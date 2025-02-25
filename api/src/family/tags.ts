import { StockItem } from "@prisma/client";
import { Hono } from "hono";
import { familyMiddleware } from "./familyMiddleware";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { prisma } from "@/lib/prisma";

export const tagsApi = new Hono()
    .get("/tags", familyMiddleware({ StockItemTags: true }), async (c) => {
        const family = c.var.family;
        return c.json(family.StockItemTags);
    })
    .post(
        "/tag",
        familyMiddleware(),
        zValidator("json", z.string()),
        async (c) => {
            const family = c.var.family;
            const { token } = c.var.authUser;
            const data = c.req.valid("json");
            const tag = await prisma.stockItemTag.create({
                data: {
                    Family: {
                        connect: {
                            id: family.id,
                        },
                    },
                    name: data,
                },
            });
            return c.json(tag);
        },
    )
    .delete(
        "/tag/:tagId",
        familyMiddleware(),
        zValidator("param", z.object({ tagId: z.string() })),
        async (c) => {
            const family = c.var.family;
            const { token } = c.var.authUser;
            const { tagId } = c.req.valid("param");
            await prisma.stockItemTag.deleteMany({
                where: {
                    id: tagId,
                    familyId: family.id,
                },
            });
            return c.status(204);
        },
    );
