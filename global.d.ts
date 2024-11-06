import { Server } from "socket.io";

// global.d.ts
export {};

declare global {
  var socket: Server | undefined;
}
