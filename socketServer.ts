// socketServer.ts
import { Server } from "socket.io";
import { Server as HttpServer } from "http";

let io: Server | null = null;

export const initializeSocket = (server: HttpServer) => {
  if (!io) {
    io = new Server(server, {
      cors: { origin: "*" }, // 必要に応じて CORS 設定
    });

    io.on("connection", (socket) => {
      console.log("A user connected");
      socket.on("disconnect", () => {
        console.log("User disconnected");
      });
    });
  }
  return io;
};

export const getSocketServer = () => {
  if (!io) throw new Error("Socket.io server has not been initialized");
  return io;
};
