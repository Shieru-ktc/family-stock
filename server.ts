// server.mjs
import { createServer } from "node:http";
import next from "next";
import { initializeSocket } from "./socketServer";

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = 3000;
const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer(handler);

  // Socket.io の初期化
  const io = initializeSocket(httpServer);

  io.on("connection", (socket) => {
    socket.emit("message", "Connected to server!");
  });

  httpServer
    .once("error", (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
    });
  global.socket = io;
});
