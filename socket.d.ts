import { Server as SocketIOServer } from "socket.io";

declare module "http" {
  interface IncomingMessage {
    socket: IncomingSocket;
  }

  interface IncomingSocket extends import("net").Socket {
    server: IncomingServer;
  }

  interface IncomingServer extends import("http").Server {
    io?: SocketIOServer;
  }
}
