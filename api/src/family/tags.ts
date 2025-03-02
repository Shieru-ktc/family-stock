import { StockItem, TagColor } from "@prisma/client";
import { Hono } from "hono";
import { familyMiddleware } from "./familyMiddleware";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { prisma } from "@/lib/prisma";

export const tagsApi = new Hono()
    .get("/tags", familyMiddleware({ StockItemTags: true }), async (c) => {
        const family = c.var.family;
        return c.json(
            family.StockItemTags.sort((a, b) => a.id.localeCompare(b.id)),
        );
    })
    .post(
        "/tag",
        familyMiddleware({}, "ADMIN"),
        zValidator(
            "json",
            z.object({
                name: z.string(),
                color: z.nativeEnum(TagColor),
                description: z.string().optional(),
            }),
        ),
        async (c) => {
            const family = c.var.family;
            const data = c.req.valid("json");
            const exceededTag = await prisma.stockItemTag.findFirst({
                where: {
                    familyId: family.id,
                },
                skip: family.Config.maxTagsPerFamily - 1,
            });
            if (exceededTag) {
                return c.json(
                    {
                        error: "You have reached the maximum number of tags.",
                    },
                    400,
                );
            }
            const tag = await prisma.stockItemTag.create({
                data: {
                    Family: {
                        connect: {
                            id: family.id,
                        },
                    },
                    name: data.name,
                    color: data.color,
                    description: data.description,
                },
            });
            return c.json(tag);
        },
    )
    .patch(
        "/tag/:tagId",
        familyMiddleware({}, "ADMIN"),
        zValidator("param", z.object({ tagId: z.string() })),
        zValidator(
            "json",
            z.object({
                name: z.string(),
                color: z.nativeEnum(TagColor),
                description: z.string().optional(),
            }),
        ),
        async (c) => {
            const { tagId } = c.req.valid("param");
            const data = c.req.valid("json");
            const tag = await prisma.stockItemTag.findFirst({
                where: {
                    id: tagId,
                    familyId: c.var.family.id,
                },
            });
            if (!tag) {
                return c.json(
                    {
                        error: "Tag not found.",
                    },
                    404,
                );
            }
            if (tag.system) {
                return c.json(
                    {
                        error: "System managed tags cannot be updated.",
                    },
                    400,
                );
            }
            const updatedTag = await prisma.stockItemTag.update({
                where: {
                    id: tagId,
                    familyId: c.var.family.id,
                },
                data: {
                    name: data.name,
                    color: data.color,
                    description: data.description,
                },
            });
            return c.json(updatedTag);
        },
    )
    .delete(
        "/tag/:tagId",
        familyMiddleware({}, "ADMIN"),
        zValidator("param", z.object({ tagId: z.string() })),
        async (c) => {
            const family = c.var.family;
            const { tagId } = c.req.valid("param");
            const tag = await prisma.stockItemTag.findFirst({
                where: {
                    id: tagId,
                    familyId: family.id,
                },
            });
            if (!tag) {
                return c.json(
                    {
                        error: "Tag not found.",
                    },
                    404,
                );
            }
            if (tag.system) {
                return c.json(
                    {
                        error: "System managed tags cannot be deleted.",
                    },
                    400,
                );
            }
            await prisma.stockItemTag.deleteMany({
                where: {
                    id: tagId,
                    familyId: family.id,
                },
            });
            return c.body(null, 204);
        },
    );
