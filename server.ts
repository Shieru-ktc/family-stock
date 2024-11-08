import { createServer } from "node:http";
import next from "next";
import { Server } from "socket.io";
import { getToken } from "next-auth/jwt";
import { NextRequest } from "next/server";
import { RequestCookies } from "next/dist/compiled/@edge-runtime/cookies";
import { JWT } from "next-auth";

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = 3000;
// when using middleware `hostname` and `port` must be provided below
const app = next({ dev, hostname, port, turbo: true });
const handler = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer(handler);

  const io = new Server(httpServer);

  io.on("connection", async (socket) => {
    const cookies = socket.handshake.headers.cookie;
    const parsedCookies = cookies
      ? new RequestCookies(new Headers({ cookie: cookies }))
      : new RequestCookies(new Headers());
    const token = await getToken({
      req: { ...socket.request, cookies: parsedCookies } as any,
      secret: process.env.JWT_SECRET,
    });
    console.log(token);
    if (!token || !token.sub) {
      console.log("Token not found");
      socket.emit("message", "Token not found");
      return socket.disconnect();
    }
    console.log("Socket connected");
    socket.join(token.sub);
    socket.on("disconnect", () => {
      socket.leave(token.sub!);
    });
    io.emit("message", `User ${token.sub} connected`);
  });

  global.io = io;

  httpServer
    .once("error", (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
    });
});
