import { prisma } from "@/lib/prisma";
import { Hono } from "hono";

export const generalFamily = new Hono()
    .get("/", async (c) => {
        const session = c.var.authUser;
        const families = await prisma.family.findMany({
            where: {
                Members: {
                    some: {
                        User: {
                            id: session.user?.id,
                        },
                    },
                },
            },
        });
        return c.json(families);
    })
    .post("/", (c) => {
        return c.json({
            text: "Hello world!",
        });
    });
