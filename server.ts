import next from "next";
import { getToken } from "next-auth/jwt";
import { RequestCookies } from "next/dist/compiled/@edge-runtime/cookies";
import { createServer } from "node:http";
import { Server } from "socket.io";
import { prisma } from "./lib/prisma";
import ClientEventHandler from "./socket/client-events";

const dev = process.env.NODE_ENV !== "production";
const hostname = process.env.HOSTNAME || "localhost";
const port = parseInt(process.env.PORT || "3000", 10);
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
    if (!token || !token.sub) {
      socket.emit("message", "Token not found");
      return socket.disconnect();
    }
    const families = await prisma.family.findMany({
      where: {
        Members: {
          some: {
            User: {
              id: token.sub,
            },
          },
        },
      },
      select: {
        id: true,
      },
    });
    socket.join(token.sub);
    ClientEventHandler(socket, token.sub);
    families.forEach((family) => {
      socket.join(family.id);
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
