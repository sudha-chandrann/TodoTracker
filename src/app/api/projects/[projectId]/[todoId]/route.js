

import { NextResponse } from "next/server";

import dbConnect from "@/lib/dbconnect";
import {ApiResponse} from "@/helper/Apiresponse"
import {getDataFromToken} from "@/helper/getdatafromtoken"
import mongoose from "mongoose";
import { Todo } from "@/models/todo.model";
import { Subtodo } from "@/models/subtodo.model";
import { Comment } from "@/models/comment.model";
import { ClientProject } from "@/models/project.model";



// to get the todos
export async function GET(req, context) {
  await dbConnect();

  try {
    const id = getDataFromToken(req);
    const { params } = context;
    const projectId = params.projectId;
    const todoId = params.todoId;
    if (!projectId && !todoId) {
      return NextResponse.json(
        new ApiResponse(400, {}, "both projectId  and todoId are required")
      );
    }
    const todo = await Todo.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(todoId),
        },
      },
      {
        $lookup: {
          from: "comments",
          localField: "comments",
          foreignField: "_id",
          as: "comments",
          pipeline: [
            {
              $lookup: {
                from: "clients",
                localField: "user",
                foreignField: "_id",
                as: "commentedby",
                pipeline: [
                  {
                    $project: {
                      username: 1,
                    },
                  },
                ],
              },
            },
            {
              $addFields:{
                  user: {
                    $arrayElemAt: ["$commentedby.username", 0],
                  },  
              }
            },
            {
              $project: {
                _id: 1,
                comment: 1,
                user: 1,
              },
            },
          ],
        },
      },
      {
        $lookup: {
          from: "subtodos",
          localField: "subtodos",
          foreignField: "_id",
          as: "subtodos",
          pipeline: [
            {
              $project: {
                task: 1,
                id: 1,
                todo: 1,
                iscompleted: 1,
                priority: 1,
                deadline: 1,
              },
            },
          ],
        },
      },
      {
        $lookup: {
          from: "clientprojects",
          localField: "project",
          foreignField: "_id",
          as: "project",
          pipeline: [
            {
              $project: {
                name: 1,
              },
            },
          ],
        },
      },
      {
        $addFields: {
          project: {
            $arrayElemAt: ["$project.name", 0],
          },

        },
      },
      {
        $project: {
          _id: 1,
          task: 1,
          description: 1,
          subtodos: 1,
          comments: 1,
          deadline: 1,
          priority: 1,
          iscompleted: 1,
          project: 1,
        },
      },
    ]);
    if (!todo) {
      return NextResponse.json(new ApiResponse(500, {}, "todo is not found"));
    }
    return NextResponse.json(
      new ApiResponse(200, { todo: todo[0] }, "todo is  found successfully")
    );
  } catch (error) {
    console.error(error);
  }
}


// to delete the todo
export async function DELETE(req, context) {
    await dbConnect();
  
    try {
      const id = getDataFromToken(req);
      const { params } = context;
      const projectId = params.projectId;
      const todoId = params.todoId;
  
      if (!projectId || !todoId) {
        return NextResponse.json(
          new ApiResponse(400, {}, "both projectId and todoId are required")
        );
      }
  
      // Remove the todo from the project's todo list
    
     const project=  await ClientProject.findByIdAndUpdate(
        projectId,
        {
          $pull: {
            todos: todoId,
          },
        },
        {
          new: true,
        }
      );
  
      const todo = await Todo.findById(todoId)
        .populate({
          path: "subtodos",
          populate: { path: "comments" },
        })
        .populate("comments");
  
      if (!todo) {
        return NextResponse.json(new ApiResponse(400, {}, "todo not found"));
      }
  
      // Delete comments associated with the todo and its subtodos
      const subtodoIds = todo.subtodos.map((subtodo) => subtodo._id);
  
      await Comment.deleteMany({
        $or: [
          { _id: { $in: todo.comments } },
          { subtodo: { $in: subtodoIds } }
        ]
      });
  
      // Delete all subtodos
      await Subtodo.deleteMany({ _id: { $in: subtodoIds } });
  
      // Delete the todo
      const deleted = await Todo.findByIdAndDelete(todoId);
  
      return NextResponse.json(
        new ApiResponse(200, { 
            id: deleted._id 
        
        }, "Todo deleted successfully")
      );
  
    } catch (error) {
      console.error("Error:", error);
      return NextResponse.json(new ApiResponse(500, {}, "An error occurred while deleting the todo"));
    }
  }

//   to togglecomplete the todo
export async function PUT(req, context) {
  await dbConnect();

  try {
    const id = getDataFromToken(req);
    const { params } = context;
    const projectId = params.projectId;
    const todoId = params.todoId;
    const { iscompleted } = await req.json();
    if (!projectId && !todoId) {
      return NextResponse.json(
        new ApiResponse(400, {}, "both projectId  and todoId are required")
      );
    }

    const todo = await Todo.findById(todoId).populate("subtodos");

    if (!todo) {
      return NextResponse.json(new ApiResponse(400, {}, "todo is not found"));
    }
    const hasIncompleteSubtodo = todo.subtodos.some(
      (subtodo) => !subtodo.iscompleted
    );
    if (hasIncompleteSubtodo) {
      return NextResponse.json(
        new ApiResponse(400, {}, "first complete your subtodos of this todo")
      );
    }

    todo.iscompleted = iscompleted;
    await todo.save();

    return NextResponse.json(
      new ApiResponse(
        200,
        {
          id: todo._id,
          iscompleted: todo.iscompleted,
        },
        "todo is  updated successfully"
      )
    );
  } catch (error) {
    console.error(error);
  }
}

// add the subtodo
export async function POST(req, context) {
  await dbConnect();

  try {
    const id = getDataFromToken(req);
    const { params } = context;
    const projectId = params.projectId;
    const todoId = params.todoId;
    if (!projectId || !todoId) {
      return NextResponse.json(
        new ApiResponse(400, {}, "projectId and todoid both are  required")
      );
    }
    const { task, description, priority, deadline } = await req.json();
    if ([task, description, priority, deadline].some((field) => !field)) {
      return NextResponse.json(
        new ApiResponse(400, {}, "all fields are required")
      );
    }
 
   const todo=await Todo.findById(todoId);
   if(todo.iscompleted){
    return NextResponse.json(
      new ApiResponse(400, {}, "this todo is already completed")
      );
   }
   let tododeadline=new Date(todo.deadline);
   let deadlineDate=new Date(deadline);
   tododeadline.setHours(23, 59, 59, 999);
   deadlineDate.setHours(23, 59, 59, 999);
   if(tododeadline<deadlineDate){
    return NextResponse.json(
      new ApiResponse(400, {}, "deadline should be less than or equal to todo deadline")
      );
   }

    const subtodo = await Subtodo.create({
      task: task,
      description: description,
      todo: todoId,
      assignedto: id,
      priority: priority,
      deadline: deadline,
    });
    if (!subtodo) {
      return NextResponse.json(
        new ApiResponse(500, {}, "failed to create subtodo")
      );
    }
    await Todo.findByIdAndUpdate(
      todoId,
      {
        $push: { subtodos: subtodo._id },
      },
      {
        new: true,
      }
    );

    return NextResponse.json(
      new ApiResponse(
        200,
        { subtodo },
        "Subtodo is added successfully"
      )
    );
  } catch (error) {
    console.error(error);
  }
}

// update the todo
export async function PATCH(req, context) {
  await dbConnect();

  try {
    const id = getDataFromToken(req);
    const { params } = context;
    const projectId = params.projectId;
    const todoId = params.todoId;
    if (!projectId || !todoId) {
      return NextResponse.json(
        new ApiResponse(400, {}, "both projectId and todoId are required")
      );
    }
    const { newdescription,newpriority,newdeadline } = await req.json();
    if (!newdescription && !newpriority && !newdeadline) {
      return NextResponse.json(
        new ApiResponse(400, {}, "all fields are required")
      );
    }
    if(newdescription){
      const todo = await Todo.findByIdAndUpdate(
        todoId,
        {
          $set: {
            description: newdescription,
          },
        },
        {
          new: true,
        }
      );
      if (!todo) {
        return NextResponse.json(new ApiResponse(404, {}, "todo is not found"));
      }
  
      return NextResponse.json(
        new ApiResponse(
          200,
          { description: todo.description },
          "project is  updated successfully"
        )
      );
    }
    if(newpriority){
      const todo = await Todo.findByIdAndUpdate(
        todoId,
        {
          $set: {
            priority: newpriority,
          },
        },
        {
          new: true,
        }
      );
      if (!todo) {
        return NextResponse.json(new ApiResponse(404, {}, "todo is not found"));
      }
  
      return NextResponse.json(
        new ApiResponse(
          200,
          { priority: todo.priority },
          "project is  updated successfully"
        )
      );
    }
    if(newdeadline){
      const todo = await Todo.findByIdAndUpdate(
        todoId,
        {
          $set: {
            deadline: newdeadline,
          },
        },
        {
          new: true,
        }
      );
      if (!todo) {
        return NextResponse.json(new ApiResponse(404, {}, "todo is not found"));
      }
  
      return NextResponse.json(
        new ApiResponse(
          200,
          { deadline: todo.deadline },
          "project is  updated successfully"
        )
      );
    }

  } catch (error) {
    console.error(error);
  }
}
