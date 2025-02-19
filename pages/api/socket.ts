import { prisma } from "@/lib/prisma";
import ClientEventHandler from "@/socket/client-events";
import { NextApiRequest, NextApiResponse } from "next";
import { getToken } from "next-auth/jwt";
import { RequestCookies } from "next/dist/server/web/spec-extension/cookies";
import { Server } from "socket.io";

// カスタムサーバーをApp Routerで使うのは厳しいのでPages Routerを使う
// （handler関数がないので）
export default function handler(req: NextApiRequest, res: NextApiResponse) {
    return;
    if (res.socket?.server.io) {
        console.log("Socket.io server already running");
        res.end();
        return;
    }

    console.log("Starting Socket.io server...");
    const io = new Server(res.socket!.server, {
        path: "/api/socket",
        cors: {
            origin: "*",
            methods: ["GET", "POST"],
        },
    });

    global.io = io;
    res.socket!.server.io = io;

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
        ClientEventHandler(io, socket, token.sub);
        families.forEach((family) => {
            socket.join(family.id);
        });
        io.emit("message", `User ${token.sub} connected`);
    });

    res.end();
}
