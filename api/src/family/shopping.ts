import { Hono } from "hono";
import { familyMiddleware } from "./familyMiddleware";
import { SocketEvents } from "@/socket/events";
import { manager } from "../ws";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { prisma } from "@/lib/prisma";

export const shoppingApi = new Hono()
    .get(
        "/shopping",
        familyMiddleware({
            Shopping: {
                include: {
                    Items: {
                        include: { StockItem: { include: { Meta: true } } },
                    },
                },
            },
        }),
        async (c) => {
            const family = c.var.family;
            return c.json(family.Shopping);
        },
    )
    .post(
        "/shopping",
        familyMiddleware(),
        zValidator("json", z.array(z.string())),
        async (c) => {
            const family = c.var.family;
            const { token } = c.var.authUser;
            const data = c.req.valid("json");
            const shopping = await prisma.shopping.create({
                data: {
                    Family: {
                        connect: {
                            id: family.id,
                        },
                    },
                    Items: {
                        create: data.map((stockId) => ({
                            StockItem: {
                                connect: {
                                    id: stockId,
                                },
                            },
                            quantity: 1,
                        })),
                    },
                    User: {
                        connect: {
                            id: token.sub,
                        },
                    },
                },
                include: {
                    Items: {
                        include: { StockItem: { include: { Meta: true } } },
                    },
                },
            });
            SocketEvents.shoppingCreated(family.id).dispatch(
                {
                    shoppingId: shopping.id,
                },
                manager.in(family.id),
            );
            return c.json({
                success: true,
                shopping,
            });
        },
    )
    .patch(
        "/shopping",
        familyMiddleware({ Shopping: { include: { Items: true } } }),
        zValidator("json", z.array(z.string())),
        async (c) => {
            const family = c.var.family;
            const data = c.req.valid("json");
            const items = family.Shopping?.Items;
            if (!items) {
                return c.json({
                    success: false,
                    error: "買い物リストが見つかりませんでした",
                });
            }
            const itemIds = items.map((item) => item.stockItemId);
            const toAdd = data.filter((id) => !itemIds.includes(id));
            const toRemove = itemIds.filter((id) => !data.includes(id));
            await prisma.shoppingItem.deleteMany({
                where: {
                    shoppingId: family.Shopping?.id,
                    stockItemId: {
                        in: toRemove,
                    },
                },
            });
            await prisma.shoppingItem.createMany({
                data: toAdd.map((id) => ({
                    shoppingId: family.Shopping?.id!,
                    stockItemId: id,
                    quantity: 0,
                })),
            });
            // TODO: WebSocketで通知
            return c.json({
                success: true,
            });
        },
    )
    .delete(
        "/shopping",
        familyMiddleware({
            Shopping: { include: { Items: true } },
            StockItems: true,
        }),
        zValidator(
            "json",
            z.object({
                isCompleted: z.boolean(),
            }),
        ),
        async (c) => {
            const family = c.var.family;
            const { isCompleted } = c.req.valid("json");
            if (isCompleted) {
                family.Shopping?.Items.forEach((item) => {
                    const stockItem = family.StockItems.find(
                        (stockItem) => stockItem.id === item.stockItemId,
                    );
                    if (stockItem) {
                        stockItem.quantity += item.quantity;
                        SocketEvents.stockQuantityChanged.dispatch(
                            {
                                stock: stockItem,
                            },
                            manager.in(family.id),
                        );
                    }
                });
                await prisma.family.update({
                    where: {
                        id: family.id,
                    },
                    data: {
                        StockItems: {
                            updateMany: family.StockItems.map((stockItem) => ({
                                where: {
                                    id: stockItem.id,
                                },
                                data: {
                                    quantity: stockItem.quantity,
                                },
                            })),
                        },
                    },
                });
            }

            await prisma.shopping.delete({
                where: {
                    id: family.Shopping?.id,
                },
            });
            return c.status(204);
        },
    );
