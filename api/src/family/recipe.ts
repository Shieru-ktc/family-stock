import { prisma } from "@/lib/prisma";
import { SocketEvents } from "@/socket/events";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";
import { manager } from "../ws";
import { familyMiddleware } from "./familyMiddleware";

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
    .get("/recipes/:recipeId/consume", familyMiddleware(), async (c) => {
        const recipeId = c.req.param("recipeId");
        const recipe = await prisma.recipe.findUnique({
            where: { id: recipeId },
            include: { RecipeItems: { include: { StockItem: true } } },
        });
        if (!recipe) {
            return c.json({ success: false, message: "Recipe not found" });
        }
        return c.json(
            recipe.RecipeItems.every(
                (item) => item.StockItem.quantity - item.quantity >= 0,
            ),
        );
    })
    .post("/recipes/:recipeId/consume", familyMiddleware(), async (c) => {
        const family = c.var.family;
        const recipeId = c.req.param("recipeId");
        const recipe = await prisma.recipe.findUnique({
            where: { id: recipeId },
            include: { RecipeItems: { include: { StockItem: true } } },
        });
        if (!recipe) {
            return c.json({ success: false, message: "Recipe not found" }, 404);
        }
        recipe.RecipeItems.forEach(async (item) => {
            const newItem = await prisma.stockItem.update({
                where: { id: item.StockItem.id },
                data: {
                    quantity: Math.max(
                        0,
                        item.StockItem.quantity - item.quantity,
                    ),
                },
            });
            SocketEvents.stockQuantityChanged.dispatch(
                {
                    stock: newItem,
                },
                manager.in(family.id),
            );
        });
        return c.json({ success: true });
    })
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
