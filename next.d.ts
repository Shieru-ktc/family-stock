import { Server as HTTPServer } from "http";
import "net";
import { Server as SocketIOServer } from "socket.io";

// `Socket` 型に `server` プロパティを追加
declare module "net" {
    interface Socket {
        server: HTTPServer & {
            io?: SocketIOServer;
        };
    }
}
