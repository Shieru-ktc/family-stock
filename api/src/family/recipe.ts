import { Hono } from "hono";
import { familyMiddleware } from "./familyMiddleware";
import { SocketEvents } from "@/socket/events";
import { manager } from "../ws";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { prisma } from "@/lib/prisma";
import { LexoRank } from "@dalet-oss/lexorank";

export const recipeApi = new Hono()
    .get(
        "/recipes",
        familyMiddleware({
            Recipe: {
                include: { RecipeItems: { include: { StockItem: true } } },
            },
        }),
        async (c) => {
            const family = c.var.family;
            return c.json(family.Recipe);
        },
    )
    .post(
        "/recipe",
        familyMiddleware(),
        zValidator(
            "json",
            z.object({
                name: z.string(),
                description: z.string(),
                items: z.array(
                    z.object({
                        stockId: z.string(),
                        quantity: z.number(),
                    }),
                ),
            }),
        ),
        async (c) => {
            const family = c.var.family;
            const { token } = c.var.authUser;
            const data = c.req.valid("json");
            const recipe = await prisma.recipe.create({
                data: {
                    name: data.name,
                    description: data.description,
                    familyId: family.id,
                    createdBy: token.sub,
                    RecipeItems: {
                        create: data.items.map((item) => ({
                            quantity: item.quantity,
                            StockItem: {
                                connect: {
                                    id: item.stockId,
                                },
                            },
                        })),
                    },
                },
            });
            return c.json(recipe);
        },
    )
    .delete("/recipes/:recipeId", familyMiddleware(), async (c) => {
        const family = c.var.family;
        const recipeId = c.req.param("recipeId");
        await prisma.recipe.delete({
            where: {
                id: recipeId,
                familyId: family.id,
            },
        });
        return c.json({ success: true });
    });
