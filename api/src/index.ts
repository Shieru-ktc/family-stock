import { prisma } from "@/lib/prisma";
import ClientEventHandler from "@/socket/client-events";
import { SocketEvents } from "@/socket/events";
import { WebSocketManager } from "@/socket/manager";
import Discord from "@auth/core/providers/discord";
import GitHub from "@auth/core/providers/github";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { authHandler, initAuthConfig, verifyAuth } from "@hono/auth-js";
import { type ServerWebSocket } from "bun";
import { Hono } from "hono";
import { createBunWebSocket } from "hono/bun";
import { cors } from "hono/cors";
import { logger } from "hono/logger";

const { upgradeWebSocket, websocket } = createBunWebSocket<ServerWebSocket>();
const manager = new WebSocketManager();

const app = new Hono()
    .use("*", logger())
    .use(
        "*",
        cors({
            origin: "http://localhost:3000",
            credentials: true, // これを追加
        }),
    )
    .use(
        "*",
        initAuthConfig((c) => ({
            secret: process.env.AUTH_SECRET,
            providers: [
                GitHub({
                    clientId: process.env.GITHUB_ID,
                    clientSecret: process.env.GITHUB_SECRET,
                    allowDangerousEmailAccountLinking: true,
                }),
                Discord({
                    clientId: process.env.DISCORD_ID,
                    clientSecret: process.env.DISCORD_SECRET,
                    allowDangerousEmailAccountLinking: true,
                }),
            ],
            adapter: PrismaAdapter(prisma),
            session: {
                strategy: "jwt",
            },
            cookies: {
                csrfToken: {
                    options: {
                        sameSite: "lax",
                    },
                },
            },
            basePath: "/api/auth",
        })),
    )
    .use("/api/auth/*", authHandler())
    .use("/api/*", verifyAuth())
    .get("/", (c) => {
        SocketEvents.testEvent.dispatch(
            {
                message: "Hello world!",
            },
            manager,
        );
        return c.text("Hello Hono!");
    })
    .get(
        "/api/ws",
        upgradeWebSocket((c) => {
            const auth = c.get("authUser");
            return {
                onMessage(e, ws) {
                    console.log(`Message from client: ${e.data}`);
                },
                onOpen(event, ws) {
                    console.log("Client connected");
                    const client = manager.addClient(ws);
                    ClientEventHandler(manager, client, auth.user?.id ?? "");
                },
            };
        }),
    );

export default {
    fetch: app.fetch,
    port: 3030,
    websocket,
};
