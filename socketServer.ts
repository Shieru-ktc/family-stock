// socketServer.ts
import { Server } from "socket.io";
import { Server as HttpServer } from "http";

export let socketIO: Server | undefined;
export let a = 0;

export const initializeSocket = (server: HttpServer) => {
  if (!socketIO) {
    socketIO = new Server(server, {
      cors: { origin: "*" }, // 必要に応じて CORS 設定
    });

    socketIO.on("connection", () => {
      console.log("A user connected");
    });
    socketIO.on("disconnect", () => {
      console.log("User disconnected");
    });
    a++;
  }
  return socketIO;
};

export const getSocketServer = () => {
  console.log("a", a);
  if (!socketIO) throw new Error("Socket.io server has not been initialized");
  return socketIO;
};
