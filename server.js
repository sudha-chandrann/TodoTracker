import { createServer } from "node:http";
import next from "next";
import { Server } from "socket.io";
import dbConnect from "./src/lib/dbconnect.js";
import { Client } from "./src/models/user.model.js";
import { Team } from "./src/models/team.model.js";
import { ClientProject } from "./src/models/project.model.js";
import { Todo } from "./src/models/todo.model.js";
import { Subtodo } from "./src/models/subtodo.model.js";
import { Comment } from "./src/models/comment.model.js";
const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = 4000;
const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

app.prepare().then(async () => {
  try {
    // Connect to the database
    await dbConnect();
    console.log("Database connected successfully");

    // Set up the server after database connection
    const httpServer = createServer(handler);
    const io = new Server(httpServer);

    io.on("connection", (socket) => {
      console.log("New socket connection:", socket.id);
      const userId = socket.handshake.query.userId;

      if (userId) {
        socket.join(userId); // User joins their own room
        console.log(`User ${userId} joined their room`);
      }

      socket.on("teamform", async (data) => {
        const { teamname, members } = data;

        try {
          const newTeam = await Team.create({
            name: teamname,
            members: members,
            admin: userId, // This includes the ID of the creator
          });
          await Client.updateMany(
            { _id: { $in: [...members] } }, // Include the creator in the update
            { $push: { teams: newTeam._id } }
          );
          const populatedTeam = await Team.findById(newTeam._id)
            .populate({
              path: "members",
              select: "_id username",
            })
            .populate({
              path: "projects",
              select: "_id name createdby",
            });
          // Emit an event to notify the client about the successful team creation
          members.forEach((memberId) => {
            io.to(memberId.toString()).emit("newTeam", {
              success: true,
              team: populatedTeam,
            });
          });
        } catch (error) {
          console.error(error);
          socket.emit("newTeam", {
            success: false,
            error: "Failed to create team",
          });
        }
      });
      socket.on("projectform", async (data) => {
        const { projectname, projectdescription, teamid } = data;

        try {
          const newProject = await ClientProject.create({
            name: projectname,
            description: projectdescription,
            ispersonal: false,
            team: teamid,
            createdby: userId,
          });

          if (!newProject) {
            socket.emit("newProject", {
              success: false,
              error: "Failed to create project",
            });
            return;
          }

          // Add the new project to the team's project list
          await Team.findByIdAndUpdate(teamid, {
            $push: { projects: newProject._id },
          });

          // Fetch the team to get the members
          const team = await Team.findById(teamid).populate({
            path: "members",
            select: "_id username",
          });

          if (team) {
            // Send the new project to all team members
            team.members.forEach((member) => {
              io.to(member._id.toString()).emit("newProject", {
                success: true,
                project: {
                  _id: newProject._id,
                  name: newProject.name,
                  createdby: newProject.createdby,
                },
              });
            });
          }

          // Notify the creator that the project was successfully created
          // socket.emit("projectCreated", { success: true, project: newProject });
        } catch (error) {
          console.error(error);
          socket.emit("projectCreated", {
            success: false,
            error: "Failed to create project",
          });
        }
      });
      socket.on("addnewmember", async (data) => {
        const { members, teamid } = data;

        try {
          // Step 1: Add the new members to the team's member list
          await Team.findByIdAndUpdate(teamid, {
            $push: { members: { $each: members } },
          });
          await Client.updateMany(
            { _id: { $in: members } }, // Match each new member by their ID
            { $push: { teams: teamid } } // Add the team ID to their `teams` array
          );
          // Step 2: Fetch the updated team with all members, including the new ones
          const team = await Team.findById(teamid)
            .populate({
              path: "members",
              select: "_id username email",
            })
            .populate({
              path: "projects",
              select: "_id name createdby",
            });

          if (team) {
            // Step 3: Extract the new members' details (ID, username, email)
            const newMembersDetails = team.members
              .filter((member) => members.includes(member._id.toString()))
              .map((member) => ({
                _id: member._id,
                username: member.username,
                email: member.email,
              }));

            // Step 4: Notify all existing and new team members about the new members
            team.members.forEach((member) => {
              io.to(member._id.toString()).emit("newmember", {
                success: true,
                newMembers: newMembersDetails, // Send the new members' details to all members
              });
            });

            newMembersDetails.forEach((newMember) => {
              io.to(newMember._id.toString()).emit("teamdetails", {
                success: true,
                team: team,
              });
            });
          }
        } catch (error) {
          console.error(error);
          socket.emit("addnewmember", {
            success: false,
            error: "Failed to add new members",
          });
        }
      });
      socket.on("deleteteam", async (data) => {
        const { teamId } = data;

        try {
          // Step 1: Find all projects associated with the team
          const projects = await ClientProject.find({ team: teamId });

          // Step 2: Loop through each project to delete associated todos, subtodos, and comments
          for (const project of projects) {
            const todos = await Todo.find({ project: project._id });

            for (const todo of todos) {
              const subtodos = await Subtodo.find({ todo: todo._id });
              for (const subtodo of subtodos) {
                await Comment.deleteMany({ subtodo: subtodo._id });
                await Subtodo.findByIdAndDelete(subtodo._id);
              }

              await Comment.deleteMany({ todo: todo._id });
              await Todo.findByIdAndDelete(todo._id);
            }

            await ClientProject.findByIdAndDelete(project._id);
          }

          // Step 3: Find the team and get its members
          const team = await Team.findById(teamId).populate(
            "members",
            "_id username email"
          );

          // Step 4: Remove the team from each member's teams array
          if (team && team.members) {
            for (const member of team.members) {
              await Client.findByIdAndUpdate(member._id, {
                $pull: { teams: teamId },
              });

              // Notify the member about the deletion
              io.to(member._id.toString()).emit("teamRemoved", {
                success: true,
                teamId: teamId,
                message: `The team with ID ${teamId} has been removed.`,
              });
            }
          }

          // Step 5: Delete the team itself
          await Team.findByIdAndDelete(teamId);

          // Notify the client that the team and its related data have been deleted
          socket.emit("teamDeleted", {
            success: true,
            message: "Team and all related data deleted successfully.",
          });
        } catch (error) {
          console.error(error);
          socket.emit("teamDeleted", {
            success: false,
            error: "Failed to delete team and related data.",
          });
        }
      });

      socket.on("removeUserFromTeam", async (data) => {
        const { teamId, memberId } = data;

        try {
          // Step 1: Remove the member from the team's members array
          await Team.findByIdAndUpdate(teamId, {
            $pull: { members: memberId },
          });

          // Step 2: Find all projects in the team
          const projects = await ClientProject.find({ team: teamId });

          for (let project of projects) {
            // Step 3: Find and reassign todos assigned to the member in each project
            const todos = await Todo.find({
              project: project._id,
              assignedto: memberId,
            });

            for (let todo of todos) {
              // Reassign the todo to the new assignee
              todo.assignedto = userId;
              await todo.save();

              // Step 4: Reassign subtodos within the todo
              await Subtodo.updateMany(
                { _id: { $in: todo.subtodos }, assignedto: memberId },
                { assignedto: userId }
              );
            }
          }

          // Step 5: Notify remaining team members about the removal
          const team = await Team.findById(teamId).populate(
            "members",
            "_id username email"
          );
          if (team && team.members) {
            team.members.forEach((member) => {
              io.to(member._id.toString()).emit("userRemovedFromTeam", {
                success: true,
                removedUserId: memberId,
                teamId: teamId,
                message: `A member with ID ${memberId} has been removed from the team. Todos and subtodos have been reassigned.`,
              });
            });
          }

          // Step 6: Notify the removed user
          io.to(memberId).emit("removedFromTeam", {
            success: true,
            teamId: teamId,
            message: `You have been removed from the team with ID ${teamId}.`,
          });

          // Step 7: Notify the client that initiated the removal
          socket.emit("userRemovalSuccess", {
            success: true,
            message:
              "User removed from the team and todos reassigned successfully.",
          });
        } catch (error) {
          console.error(error);
          socket.emit("userRemovalError", {
            success: false,
            error: "Failed to remove user from team or reassign todos.",
          });
        }
      });

      socket.on("deleteProjectfromteam", async (data) => {
        const { projectId, teamId } = data;

        try {
          // Find the team
          const team = await Team.findById(teamId);
          if (!team) {
            return socket.emit("projectDeleted", {
              success: false,
              error: "Team not found",
            });
          }

          // Remove the project from the team
          team.projects = team.projects.filter(
            (project) => project.toString() !== projectId
          );

          // Save the updated team
          await team.save();

          // Find all todos related to the project
          const todos = await Todo.find({ project: projectId });

          for (let todo of todos) {
            // Find all subtodos related to the todo
            const subtodos = await Subtodo.find({ todo: todo._id });

            for (let subtodo of subtodos) {
              // Delete all comments related to the subtodo
              await Comment.deleteMany({ subtodo: subtodo._id });
            }

            // Delete the subtodos related to the todo
            await Subtodo.deleteMany({ todo: todo._id });

            // Delete all comments related to the todo
            await Comment.deleteMany({ todo: todo._id });

            // Delete the todo itself
            await Todo.findByIdAndDelete(todo._id);
          }

          // Finally, delete the project
          await ClientProject.findByIdAndDelete(projectId);

          // Notify all team members about the project deletion
          team.members.forEach((member) => {
            io.to(member.toString()).emit("projectDeleted", {
              success: true,
              projectId,
              teamId,
            });
          });
        } catch (error) {
          console.error(error);
          socket.emit("projectDeleted", {
            success: false,
            error: "Failed to delete project",
          });
        }
      });
      socket.on("editProjectDescription", async (data) => {
        const { projectId, teamId, newDescription } = data;

        try {
          // Find the project and update its description
          const project = await ClientProject.findByIdAndUpdate(
            projectId,
            { description: newDescription },
            { new: true } // This returns the updated project
          );

          if (!project) {
            return socket.emit("descriptionUpdated", {
              success: false,
              error: "Project not found",
            });
          }

          // Find the team to get its members
          const team = await Team.findById(teamId).populate({
            path: "members",
            select: "_id username",
          });

          if (!team) {
            return socket.emit("descriptionUpdated", {
              success: false,
              error: "Team not found",
            });
          }

          // Notify all team members about the updated project description
          team.members.forEach((member) => {
            io.to(member._id.toString()).emit("descriptionUpdated", {
              success: true,
              projectId,
              newDescription,
            });
          });

          // Notify the user who initiated the change
          socket.emit("descriptionUpdated", {
            success: true,
            projectId,
            newDescription,
          });
        } catch (error) {
          console.error(error);
          socket.emit("descriptionUpdated", {
            success: false,
            error: "Failed to update project description",
          });
        }
      });
      socket.on("addTodo", async (data) => {
        const {
          projectId,
          teamId,
          task,
          description,
          assignedto,
          priority,
          deadline,
        } = data;

        try {
          // Create the new todo
          const newTodo = await Todo.create({
            task,
            description,
            iscompleted: false,
            project: projectId,
            assignedto,
            priority,
            deadline,
          });

          if (!newTodo) {
            return socket.emit("todoAdded", {
              success: false,
              error: "Failed to create todo",
            });
          }

          // Add the todo to the project's todo list
          const project = await ClientProject.findByIdAndUpdate(
            projectId,
            { $push: { todos: newTodo._id } },
            { new: true }
          );

          if (!project) {
            return socket.emit("todoAdded", {
              success: false,
              error: "Project not found",
            });
          }

          // Find the team to get its members
          const team = await Team.findById(teamId).populate({
            path: "members",
            select: "_id username",
          });

          if (!team) {
            return socket.emit("todoAdded", {
              success: false,
              error: "Team not found",
            });
          }
          const todo = await Todo.findById(newTodo._id).populate({
            path: "assignedto",
            select: "_id username",
          });
          // Notify all team members about the new todo
          team.members.forEach((member) => {
            io.to(member._id.toString()).emit("todoAdded", {
              success: true,
              todo: todo,
            });
          });
        } catch (error) {
          console.error(error);
          socket.emit("todoAdded", {
            success: false,
            error: "Failed to add todo",
          });
        }
      });

      socket.on("toggleTodoCompletion", async ({ todoId, teamId }) => {
        try {
          const todo = await Todo.findById(todoId).populate("subtodos");

          if (!todo) {
            return socket.emit("error", {
              success: false,
              message: "Todo not found",
            });
          }

          if (String(todo.assignedto) !== String(userId)) {
            return socket.emit("error", {
              success: false,
              message: "You are not authorized to complete this todo",
            });
          }

          const areAllSubtodosCompleted = todo.subtodos.every(
            (subtodo) => subtodo.iscompleted
          );

          if (!areAllSubtodosCompleted) {
            return socket.emit("error", {
              success: false,
              message:
                "All subtodos must be completed before marking the todo as complete",
            });
          }

          todo.iscompleted = !todo.iscompleted;
          await todo.save();

          const team = await Team.findById(teamId).populate(
            "members",
            "_id name email"
          ); // Assuming members are populated with name and email

          team.members.forEach((member) => {
            io.to(member._id.toString()).emit("todoCompletionToggled", {
              success: true,
              iscompleted: todo.iscompleted,
              todoId: todo._id,
            });
          });
        } catch (error) {
          console.error("Error toggling todo completion:", error);
          socket.emit("error", {
            success: false,
            message: "An error occurred while toggling todo completion",
          });
        }
      });
      socket.on("deleteTodoFromProject", async (data) => {
        const { todoId, projectId, teamId } = data;

        try {
          // Find the project
          const project = await ClientProject.findById(projectId);
          if (!project) {
            return socket.emit("error", {
              success: false,
              message: "Project not found",
            });
          }

          // Remove the todo from the project
          project.todos = project.todos.filter(
            (todo) => todo.toString() !== todoId
          );

          // Save the updated project
          await project.save();

          // Find the todo to be deleted
          const todo = await Todo.findById(todoId);
          if (!todo) {
            return socket.emit("error", {
              success: false,
              message: "Todo not found",
            });
          }

          // Find all subtodos related to the todo
          const subtodos = await Subtodo.find({ todo: todoId });

          for (let subtodo of subtodos) {
            // Delete all comments related to the subtodo
            await Comment.deleteMany({ subtodo: subtodo._id });
          }

          // Delete the subtodos related to the todo
          await Subtodo.deleteMany({ todo: todoId });

          // Delete all comments related to the todo
          await Comment.deleteMany({ todo: todoId });

          // Delete the todo itself
          const deletedtodo = await Todo.findByIdAndDelete(todoId);

          // Notify all project members about the todo deletion
          const team = await Team.findById(teamId).populate(
            "members",
            "_id name email"
          ); // Assuming members are populated with name and email

          team.members.forEach((member) => {
            io.to(member._id.toString()).emit("todoDeleted", {
              success: true,
              todoId: deletedtodo._id,
            });
          });
        } catch (error) {
          console.error(error);
          socket.emit("error", {
            success: false,
            message: "Failed to delete todo",
          });
        }
      });
      socket.on("updateTodoDescription", async (data) => {
        const { todoId, newDescription, teamId } = data;

        try {
          // Find the todo by its ID
          const todo = await Todo.findById(todoId);
          if (!todo) {
            return socket.emit("error", {
              success: false,
              message: "Todo not found",
            });
          }

          // Update the description of the todo
          todo.description = newDescription;

          // Save the updated todo
          await todo.save();

          // Notify the client about the successful update
          const team = await Team.findById(teamId).populate(
            "members",
            "_id name email"
          ); // Assuming members are populated with name and email

          team.members.forEach((member) => {
            io.to(member._id.toString()).emit("todoDescriptionUpdated", {
              success: true,
              newDescription: todo.description,
            });
          });
        } catch (error) {
          console.error(error);
          socket.emit("error", {
            success: false,
            message: "Failed to update todo",
          });
        }
      });
      socket.on("updateTodoPriority", async (data) => {
        const { todoId, newPriority, teamId } = data;

        try {
          // Find the todo by its ID
          const todo = await Todo.findById(todoId);
          if (!todo) {
            return socket.emit("error", {
              success: false,
              message: "Todo not found",
            });
          }

          // Update the priority of the todo
          todo.priority = newPriority;

          // Save the updated todo
          await todo.save();

          const team = await Team.findById(teamId).populate(
            "members",
            "_id name email"
          ); // Assuming members are populated with name and email

          team.members.forEach((member) => {
            io.to(member._id.toString()).emit("todoPriorityUpdated", {
              success: true,
              newPriority: todo.priority,
            });
          });
        } catch (error) {
          console.error(error);
          socket.emit("error", {
            success: false,
            message: "Failed to update priority",
          });
        }
      });

      socket.on(
        "updateTodoDeadline",
        async ({ todoId, newDeadline, teamId }) => {
          try {
            // Find the todo with its subtodos
            const todo = await Todo.findById(todoId).populate("subtodos");

            if (!todo) {
              socket.emit("error", {
                success: false,
                message: "Todo not found",
              });
              return;
            }

            // Check if the new deadline is later than all subtodo deadlines
            const isValidDeadline = todo.subtodos.every((subTodo) => {
              return new Date(newDeadline) > new Date(subTodo.deadline);
            });

            if (!isValidDeadline) {
              socket.emit("error", {
                success: false,
                message:
                  "New deadline must be later than all subtodo deadlines",
              });
              return;
            }

            // Update the todo's deadline
            todo.deadline = new Date(newDeadline);
            await todo.save();
            const team = await Team.findById(teamId).populate(
              "members",
              "_id name email"
            ); // Assuming members are populated with name and email

            team.members.forEach((member) => {
              io.to(member._id.toString()).emit("updateTodoDeadlineSuccess", {
                success: true,
                newDeadline: todo.deadline,
              });
            });
          } catch (error) {
            console.error("Error updating deadline:", error);
            socket.emit("error", {
              success: false,
              message: "Failed to update deadline",
            });
          }
        }
      );

      socket.on(
        "updateTodoAssignedTo",
        async ({ todoId, newAssignedTo, teamId }) => {
          try {
            const todo = await Todo.findById(todoId);
            if (todo) {
              todo.assignedto = newAssignedTo;
              await todo.save();

              todo.subtodos.forEach(async (subTodoId) => {
                const subTodo = await Subtodo.findById(subTodoId);
                if (subTodo) {
                  subTodo.assignedto = newAssignedTo;
                  await subTodo.save();
                }
              });

              const newassigni = await Client.findById(todo.assignedto);
              const team = await Team.findById(teamId).populate(
                "members",
                "_id name email"
              );

              team.members.forEach((member) => {
                io.to(member._id.toString()).emit("updateAssignedToSuccess", {
                  success: true,
                  newAssignedTo: {
                    _id: newassigni._id,
                    username: newassigni.username,
                    email: newassigni.email,
                  },
                });
              });
            } else {
              // Emit an error if the todo was not found
              socket.emit("error", {
                success: false,
                message: "Todo not found",
              });
            }
          } catch (error) {
            console.error("Error updating deadline:", error);
            socket.emit("error", {
              success: false,
              message: "Failed to update AssignedTo",
            });
          }
        }
      );
      socket.on("addSubtodo", async (data) => {
        const { todoId, teamId, task, description, priority, deadline } = data;

        try {
          // Find the todo by its ID
          const todo = await Todo.findById(todoId);
          if (!todo) {
            return socket.emit("error", {
              success: false,
              message: "Todo not found",
            });
          }

          // Check if the todo is completed
          if (todo.iscompleted) {
            return socket.emit("error", {
              success: false,
              message: "Cannot add a subtodo to a completed todo",
            });
          }

          // Check if the subtodo's deadline is less than or equal to the todo's deadline
          if (new Date(deadline) > new Date(todo.deadline)) {
            return socket.emit("error", {
              success: false,
              message: "Subtodo deadline exceeds the todo deadline",
            });
          }

          // Create the new subtodo
          const subtodo = new Subtodo({
            task,
            description,
            assignedto: todo.assignedto,
            deadline,
            priority,
            todo: todoId,
            iscompleted: false, // Default to not completed
          });

          // Save the new subtodo
          await subtodo.save();

          // Optionally, you can add this subtodo to the todo's subtodos array (if you are storing references)
          todo.subtodos.push(subtodo._id);
          await todo.save();
          const team = await Team.findById(teamId).populate(
            "members",
            "_id name email"
          );

          team.members.forEach((member) => {
            io.to(member._id.toString()).emit("subtodoAdded", {
              success: true,
              subtodo: subtodo,
            });
          });
        } catch (error) {
          console.error(error);
          socket.emit("error", {
            success: false,
            message: "Failed to add subtodo",
          });
        }
      });
      socket.on("toggleSubTodoCompletion", async ({ subtodoId, teamId }) => {
        try {
          const subtodo = await Subtodo.findById(subtodoId);

          if (!subtodo) {
            return socket.emit("error", {
              success: false,
              message: "subTodo not found",
            });
          }

          if (String(subtodo.assignedto) !== String(userId)) {
            return socket.emit("error", {
              success: false,
              message: "You are not authorized to complete this subtodo",
            });
          }

          subtodo.iscompleted = !subtodo.iscompleted;
          await subtodo.save();

          const team = await Team.findById(teamId).populate(
            "members",
            "_id name email"
          );

          team.members.forEach((member) => {
            io.to(member._id.toString()).emit("subtodoCompletionToggled", {
              success: true,
              iscompleted: subtodo.iscompleted,
              subtodoId: subtodo._id,
            });
          });
        } catch (error) {
          console.error("Error toggling subtodo completion:", error);
          socket.emit("error", {
            success: false,
            message: "An error occurred while toggling subtodo completion",
          });
        }
      });
      socket.on("deleteSubTodo", async (data) => {
        const { SubtodoId, todoId, teamId } = data;

        try {
          const todo = await Todo.findById(todoId);
          if (!todo) {
            return socket.emit("error", {
              success: false,
              message: "todo not found",
            });
          }
          todo.subtodos = todo.subtodos.filter(
            (subtodo) => subtodo.toString() !== SubtodoId
          );
          await Comment.deleteMany({ subtodo: SubtodoId });

          const deletedsubtodo = await Subtodo.findByIdAndDelete(SubtodoId);

          // Notify all project members about the todo deletion
          const team = await Team.findById(teamId).populate(
            "members",
            "_id name email"
          ); // Assuming members are populated with name and email

          team.members.forEach((member) => {
            io.to(member._id.toString()).emit("subtodoDeleted", {
              success: true,
              subtodoId: deletedsubtodo._id,
            });
          });
        } catch (error) {
          console.error(error);
          socket.emit("error", {
            success: false,
            message: "Failed to delete subtodo",
          });
        }
      });
      socket.on("addCommentToTodo", async (data) => {
        const { todoId, comment, teamId } = data;

        try {
          const todo = await Todo.findById(todoId);
          if (!todo) {
            return socket.emit("error", {
              success: false,
              message: "Todo not found",
            });
          }

          const newcomment = new Comment({
            todo: todoId,
            user: userId,
            comment: comment,
          });

          await newcomment.save();

          todo.comments.push(newcomment._id);
          await todo.save();

          const user = await Client.findById(userId);
          const team = await Team.findById(teamId).populate(
            "members",
            "_id name email"
          ); // Assuming members are populated with name and email

          team.members.forEach((member) => {
            io.to(member._id.toString()).emit("commenttodoAdded", {
              success: true,
              comment: {
                _id: newcomment._id,
                comment: newcomment.comment,
                user: user.username,
                userid: user._id,
              },
            });
          });
        } catch (error) {
          console.error(error);
          socket.emit("error", {
            success: false,
            message: "Failed to add comment",
          });
        }
      });
      socket.on("deleteTodoComment", async (data) => {
        const { todoId, commentId, teamId } = data;

        try {
          // Find the todo
          const todo = await Todo.findById(todoId);
          if (!todo) {
            return socket.emit("error", {
              success: false,
              message: "Todo not found",
            });
          }

          // Remove the comment from the todo
          todo.comments = todo.comments.filter(
            (comment) => comment.toString() !== commentId
          );

          // Save the updated todo
          await todo.save();

          // Delete the comment itself from the Comment collection
          const deletedcomment = await Comment.findByIdAndDelete(commentId);
          const team = await Team.findById(teamId).populate(
            "members",
            "_id name email"
          ); // Assuming members are populated with name and email

          team.members.forEach((member) => {
            io.to(member._id.toString()).emit("commenttodoDeleted", {
              success: true,
              commentId: deletedcomment._id,
            });
          });
        } catch (error) {
          console.error(error);
          socket.emit("error", {
            success: false,
            message: "Failed to delete comment",
          });
        }
      });
      socket.on("updatetodocomment", async (data) => {
        const { newcomment, commentId, teamId } = data;

        try {
          const comment = await Comment.findById(commentId);
          comment.comment = newcomment;
          await comment.save();
          const team = await Team.findById(teamId).populate(
            "members",
            "_id name email"
          ); // Assuming members are populated with name and email

          team.members.forEach((member) => {
            io.to(member._id.toString()).emit("updatedtodocomment", {
              success: true,
              commentId: comment._id,
              comment: comment.comment,
            });
          });
        } catch (error) {
          console.error(error);
          socket.emit("error", {
            success: false,
            message: "Failed to update comment",
          });
        }
      });
      socket.on("updatesubTodoDescription", async (data) => {
        const { subtodoId, newDescription, teamId } = data;

        try {
          // Find the todo by its ID
          const subtodo = await Subtodo.findById(subtodoId);
          if (!subtodo) {
            return socket.emit("error", {
              success: false,
              message: "subTodo not found",
            });
          }

          // Update the description of the todo
          subtodo.description = newDescription;

          // Save the updated todo
          await subtodo.save();

          // Notify the client about the successful update
          const team = await Team.findById(teamId).populate(
            "members",
            "_id name email"
          ); // Assuming members are populated with name and email

          team.members.forEach((member) => {
            io.to(member._id.toString()).emit("subtodoDescriptionUpdated", {
              success: true,
              newDescription: subtodo.description,
            });
          });
        } catch (error) {
          console.error(error);
          socket.emit("error", {
            success: false,
            message: "Failed to update subtodo",
          });
        }
      });
      socket.on("updatesubTodoPriority", async (data) => {
        const { subtodoId, newPriority, teamId } = data;

        try {
          // Find the todo by its ID
          const subtodo = await Subtodo.findById(subtodoId);
          if (!subtodo) {
            return socket.emit("error", {
              success: false,
              message: "Todo not found",
            });
          }

          // Update the priority of the todo
          subtodo.priority = newPriority;

          // Save the updated todo
          await subtodo.save();

          const team = await Team.findById(teamId).populate(
            "members",
            "_id name email"
          ); // Assuming members are populated with name and email

          team.members.forEach((member) => {
            io.to(member._id.toString()).emit("subtodoPriorityUpdated", {
              success: true,
              newPriority: subtodo.priority,
            });
          });
        } catch (error) {
          console.error(error);
          socket.emit("error", {
            success: false,
            message: "Failed to update priority",
          });
        }
      });

      socket.on(
        "updatesubTodoDeadline",
        async ({ subtodoId, newDeadline, teamId }) => {
          try {
            // Find the todo with its subtodos
            const subtodo = await Subtodo.findById(subtodoId);
            if (!subtodo) {
              socket.emit("error", {
                success: false,
                message: "subTodo not found",
              });
              return;
            }
            const todo = await Todo.findById(subtodo.todo);
            // Check if the new deadline is later than all subtodo deadlines
            const isnotValidDeadline =
              new Date(newDeadline) > new Date(todo.deadline);

            if (isnotValidDeadline) {
              socket.emit("error", {
                success: false,
                message:
                  "New deadline must be less than or equal to todo deadlines",
              });
              return;
            }

            // Update the todo's deadline
            subtodo.deadline = new Date(newDeadline);
            await subtodo.save();
            const team = await Team.findById(teamId).populate(
              "members",
              "_id name email"
            ); // Assuming members are populated with name and email

            team.members.forEach((member) => {
              io.to(member._id.toString()).emit(
                "updatesubTodoDeadlineSuccess",
                {
                  success: true,
                  newDeadline: subtodo.deadline,
                }
              );
            });
          } catch (error) {
            console.error("Error updating deadline:", error);
            socket.emit("error", {
              success: false,
              message: "Failed to update deadline",
            });
          }
        }
      );

      socket.on("addCommentToSubTodo", async (data) => {
        const { subtodoId, comment, teamId } = data;

        try {
          const subtodo = await Subtodo.findById(subtodoId);
          if (!subtodo) {
            return socket.emit("error", {
              success: false,
              message: "subtodo not found",
            });
          }

          const newcomment = new Comment({
            subtodo: subtodoId,
            user: userId,
            comment: comment,
          });

          await newcomment.save();

          subtodo.comments.push(newcomment._id);
          await subtodo.save();

          const user = await Client.findById(userId);
          const team = await Team.findById(teamId).populate(
            "members",
            "_id name email"
          ); // Assuming members are populated with name and email

          team.members.forEach((member) => {
            io.to(member._id.toString()).emit("commentsubtodoAdded", {
              success: true,
              comment: {
                _id: newcomment._id,
                comment: newcomment.comment,
                user: user.username,
                userid: user._id,
              },
            });
          });
        } catch (error) {
          console.error(error);
          socket.emit("error", {
            success: false,
            message: "Failed to add comment",
          });
        }
      });
      socket.on("deletesubTodoComment", async (data) => {
        const { subtodoId, commentId, teamId } = data;

        try {
          // Find the todo
          const subtodo = await Subtodo.findById(subtodoId);
          if (!subtodo) {
            return socket.emit("error", {
              success: false,
              message: "Subtodo not found",
            });
          }

          // Remove the comment from the todo
          subtodo.comments = subtodo.comments.filter(
            (comment) => comment.toString() !== commentId
          );

          // Save the updated todo
          await subtodo.save();

          // Delete the comment itself from the Comment collection
          const deletedcomment = await Comment.findByIdAndDelete(commentId);
          const team = await Team.findById(teamId).populate(
            "members",
            "_id name email"
          ); // Assuming members are populated with name and email

          team.members.forEach((member) => {
            io.to(member._id.toString()).emit("commentsubtodoDeleted", {
              success: true,
              commentId: deletedcomment._id,
            });
          });
        } catch (error) {
          console.error(error);
          socket.emit("error", {
            success: false,
            message: "Failed to delete comment",
          });
        }
      });
      socket.on("updatesubtodocomment", async (data) => {
        const { newcomment, commentId, teamId } = data;

        try {
          const comment = await Comment.findById(commentId);
          comment.comment = newcomment;
          await comment.save();
          const team = await Team.findById(teamId).populate(
            "members",
            "_id name email"
          ); // Assuming members are populated with name and email
          team.members.forEach((member) => {
            io.to(member._id.toString()).emit("updatedsubtodocomment", {
              success: true,
              commentId: comment._id,
              comment: comment.comment,
            });
          });
        } catch (error) {
          console.error(error);
          socket.emit("error", {
            success: false,
            message: "Failed to update comment",
          });
        }
      });
    });

    httpServer
      .once("error", (err) => {
        console.error("Server error:", err);
        process.exit(1);
      })
      .listen(port, () => {
        console.log(`> Ready on http://${hostname}:${port}`);
      });
  } catch (error) {
    console.error("Error during server setup:", error.message);
    process.exit(1);
  }
});
