import { initAuthConfig } from "@hono/auth-js";
import { Hono } from "hono";
import GitHub from "@auth/core/providers/github";
import Discord from "@auth/core/providers/discord";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import { createBunWebSocket } from "hono/bun";
import { serve, type ServerWebSocket } from "bun";
import { Server } from "socket.io";
import { Server as HttpServer } from "http";
import { WebSocketManager } from "@/socket/manager";

const { upgradeWebSocket, websocket } = createBunWebSocket<ServerWebSocket>();
const manager = new WebSocketManager();

const app = new Hono()
    .use(
        "*",
        initAuthConfig((c) => ({
            secret: process.env.AUTH_SECRET,
            providers: [
                GitHub({
                    clientId: c.env.GITHUB_ID,
                    clientSecret: c.env.GITHUB_SECRET,
                    allowDangerousEmailAccountLinking: true,
                }),
                Discord({
                    clientId: c.env.DISCORD_ID,
                    clientSecret: c.env.DISCORD_SECRET,
                    allowDangerousEmailAccountLinking: true,
                }),
            ],
            adapter: PrismaAdapter(prisma),
            session: {
                strategy: "jwt",
            },
        })),
    )
    .get("/", (c) => {
        return c.text("Hello Hono!");
    })
    .get(
        "/ws",
        upgradeWebSocket((c) => {
            return {
                onMessage(event, ws) {
                    console.log(`Message from client: ${event.data}`);
                    const data = JSON.parse(event.data.toString());
                    if (data.event === "roomJoin") {
                        const client = manager.getClient(ws);
                        client?.join(data.room);
                    } else if (data.event === "roomLeave") {
                        const client = manager.getClient(ws);
                        client?.leave(data.room);
                    } else {
                        
                    }
                },
                onOpen(event, ws) {
                    console.log("Client connected");
                    manager.addClient(ws);
                }
            };
        }),
    );

export default {
    fetch: app.fetch,
    port: 3030,
};
