import { Server } from "socket.io";
import SocketManager from "./app/socketServer";

// global.d.ts
export {};

declare global {
  var socket: SocketManager | undefined;
}
