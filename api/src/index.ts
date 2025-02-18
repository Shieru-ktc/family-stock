import { initAuthConfig } from "@hono/auth-js";
import { Hono } from "hono";
import GitHub from "@auth/core/providers/github";
import Discord from "@auth/core/providers/discord";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

const app = new Hono();

app.use(
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
);
app.get("/", (c) => {
    return c.text("Hello Hono!");
});

export default {
    fetch: app.fetch,
    port: 3030,
};
