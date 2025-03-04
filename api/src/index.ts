import { prisma } from "@/lib/prisma";
import ClientEventHandler from "@/socket/client-events";
import { SocketEvents } from "@/socket/events";
import Discord from "@auth/core/providers/discord";
import GitHub from "@auth/core/providers/github";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { authHandler, initAuthConfig, verifyAuth } from "@hono/auth-js";
import { type ServerWebSocket } from "bun";
import { Hono } from "hono";
import { createBunWebSocket } from "hono/bun";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { generalFamily } from "./family/general";
import { manager } from "./ws";
import { FamilyNotFoundError, NoPermissionError } from "./errors";
import { HTTPException } from "hono/http-exception";
import { inviteApi } from "./invite/general";
import { AdapterUser } from "@auth/core/adapters";
import { User } from "@prisma/client";
import { generalAdmin } from "./admin/general";

const { upgradeWebSocket, websocket } = createBunWebSocket<ServerWebSocket>();

const app = new Hono()
    .use("*", logger())
    .use(
        "*",
        cors({
            origin: ["http://localhost:3000", "https://stocks.shieru-lab.com"],
            credentials: true,
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
            callbacks: {
                redirect: async ({ url, baseUrl }) => {
                    return (
                            url.startsWith(baseUrl) ||
                                url.startsWith(process.env.BASE_URL ?? baseUrl)
                        ) ?
                            Promise.resolve(url)
                        :   Promise.resolve(baseUrl);
                },
                jwt: async ({ token, user }) => {
                    if (user) {
                        console.log(token, user);
                        const typedUser = user as User & AdapterUser;
                        token.id = user.id;
                        token.role = typedUser.role;
                    }
                    return token;
                },
                session: async ({ session, token }) => {
                    console.log(session, token);
                    session.user.id = token.sub!;
                    session.user.role = token.role;
                    return session;
                },
            },
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
        return c.json({
            text: "Hello hono!",
            greeting: "How about you today?",
        });
    })
    .get("/api/me", (c) => {
        const { token } = c.var.authUser;
        return c.json(token);
    })
    .route("/api/family", generalFamily)
    .route("/api/invite", inviteApi)
    .route("/api/admin", generalAdmin)
    .get(
        "/api/ws",
        upgradeWebSocket((c) => {
            const { token } = c.var.authUser;
            return {
                onMessage(e, ws) {
                    const { event, data } = JSON.parse(e.data.toString());
                    if (event === "ping") {
                        ws.send(JSON.stringify({ event: "pong", data: {} }));
                        return;
                    }
                    manager.getClient(ws)?.fire(event, data);
                },
                onOpen: async (_, ws) => {
                    console.log("Client connected");
                    const client = manager.addClient(ws, token?.sub!);
                    (
                        await prisma.family.findMany({
                            where: {
                                Members: {
                                    some: {
                                        userId: token?.sub,
                                    },
                                },
                            },
                        })
                    ).forEach((family) => client.join(family.id));
                    ClientEventHandler(manager, client, token?.sub ?? "");

                    SocketEvents.testEvent.dispatch(
                        {
                            message: `Hello, ${token?.name}!`,
                        },
                        client,
                    );
                },
                onClose(_, ws) {
                    console.log("Client disconnected");
                    manager.removeClient(ws);
                },
            };
        }),
    )
    .onError((e, c) => {
        if (e instanceof FamilyNotFoundError) {
            return c.json({ error: "Family not found" }, 404);
        }
        if (e instanceof NoPermissionError) {
            return c.json({ error: e.message }, 403);
        }

        if (e instanceof HTTPException) {
            return e.getResponse();
        }
        throw e;
    });

export default {
    fetch: app.fetch,
    port: 3030,
    websocket,
};

export type ApiAppType = typeof app;
