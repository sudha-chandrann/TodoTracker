
import { io } from "socket.io-client";

let socket;

export const initializeSocket = (userId) => {
  if (!socket) {
    socket = io({
      query:userId? { userId }:{},
    });

    socket.on("connect", () => {
      console.log("Socket connected:", socket.id);
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected");
    });

    // Additional event listeners can be added here
  }
  return socket;
};

export const getSocket = () => {
  if (!socket) {
    throw new Error("Socket is not initialized. Call initializeSocket first.");
  }
  return socket;
};

