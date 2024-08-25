import { createServer } from "node:http";
import next from "next";
import { Server } from "socket.io";
import dbConnect from "./src/lib/dbconnect.js";
import { Client } from "./src/models/user.model.js";
import { Team } from "./src/models/team.model.js";
const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = 4000;
const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

app.prepare().then(async () => {
  try {
    // Connect to the database
    await dbConnect();
    console.log('Database connected successfully');
    
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
            admin: userId   // This includes the ID of the creator
          });
          await Client.updateMany(
            { _id: { $in: [...members] } }, // Include the creator in the update
            { $push: { teams: newTeam._id } }
          );
          const populatedTeam = await Team.findById(newTeam._id)
          .populate({
            path: 'members',
            select: '_id username'
          })
        //   .populate({
        //     path: 'projects',
        //     select: '_id name'
        //   });
          // Emit an event to notify the client about the successful team creation
          members.forEach((memberId) => {
            io.to(memberId).emit("newTeam", {
              success: true,
              team: populatedTeam,
            });
          });
      
      
        } catch (error) {
          console.error(error);
          socket.emit("newTeam", { success: false, error: "Failed to create team" });
        }
      });
      

      



    })
     
    

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
