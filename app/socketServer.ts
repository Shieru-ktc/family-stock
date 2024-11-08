import { Server } from "socket.io";

const clients = [];

export default class SocketManager {
  private io: Server;

  constructor(io: Server) {
    this.io = io;
    this.io.on("connection", (socket) => {
      console.log("a user connected");
      io.emit("message", `Client connected: ${socket.id}`);

      socket.on("disconnect", () => {
        console.log("user disconnected");
      });
    });
  }
}
