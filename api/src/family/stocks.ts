import { Hono } from "hono";
import { familyMiddleware } from "./familyMiddleware";
import { SocketEvents } from "@/socket/events";
import { manager } from "../ws";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { prisma } from "@/lib/prisma";
import { LexoRank } from "@dalet-oss/lexorank";

export const stocksApi = new Hono()
    .get(
        "/stocks",
        familyMiddleware({
            StockItems: { include: { Meta: { include: { Tags: true } } } },
        }),
        async (c) => {
            const family = c.var.family;
            return c.json(
                family.StockItems.sort((a, b) =>
                    a.Meta.position.localeCompare(b.Meta.position),
                ),
            );
        },
    )
    .post(
        "/stock",
        familyMiddleware(),
        zValidator(
            "json",
            z.object({
                name: z.string(),
                description: z.string(),
                unit: z.string(),
                quantity: z.number(),
                price: z.number(),
                step: z.number(),
                threshold: z.number(),
                tags: z.array(z.string()),
            }),
        ),
        async (c) => {
            const family = c.var.family;
            const data = c.req.valid("json");
            const lastStockItem = await prisma.stockItem.findFirst({
                where: {
                    familyId: family.id,
                },
                include: {
                    Meta: true,
                },
                orderBy: {
                    Meta: {
                        position: "desc",
                    },
                },
            });
            const position = lastStockItem
                ? LexoRank.parse(lastStockItem.Meta.position)
                      .between(LexoRank.max())
                      .toString()
                : LexoRank.min().toString();
            const createdItem = await prisma.stockItem.create({
                data: {
                    quantity: data.quantity,
                    Meta: {
                        create: {
                            name: data.name,
                            description: data.description,
                            unit: data.unit,
                            price: data.price,
                            step: data.step,
                            threshold: data.threshold,
                            position: position,
                            Family: {
                                connect: {
                                    id: family.id,
                                },
                            },
                            Tags: {
                                connect: data.tags.map((tag) => ({
                                    id: tag,
                                })),
                            },
                        },
                    },
                    Family: {
                        connect: {
                            id: family.id,
                        },
                    },
                },
                include: {
                    Meta: {
                        include: {
                            Tags: true,
                        },
                    },
                },
            });
            SocketEvents.stockCreated(family.id).dispatch(
                {
                    stock: {
                        ...createdItem,
                        Meta: { Family: family, ...createdItem.Meta },
                    },
                },
                manager.in(family.id),
            );
            return c.json({
                success: true,
                item: createdItem,
            });
        },
    )
    .post(
        "/stocks/position",
        familyMiddleware(),
        zValidator(
            "json",
            z.object({
                prevPos: z.string().optional(),
                id: z.string(),
                nextPos: z.string().optional(),
            }),
        ),
        async (c) => {
            const family = c.var.family;
            const data = c.req.valid("json");
            const stockItems = await prisma.stockItem.findMany({
                where: {
                    familyId: family.id,
                    id: {
                        in: [data.id, data.prevPos, data.nextPos].filter(
                            (x) => x !== undefined,
                        ),
                    },
                },
                take: 3,
                include: {
                    Meta: true,
                },
            });
            if (stockItems.length === 3) {
                const [stockItem, prevStockItem, nextStockItem] = stockItems;
                const newPosition = LexoRank.parse(prevStockItem.Meta.position)
                    .between(LexoRank.parse(nextStockItem.Meta.position))
                    .toString();
                await prisma.stockItem.update({
                    where: {
                        id: stockItem.id,
                    },
                    data: {
                        Meta: {
                            update: {
                                position: newPosition,
                            },
                        },
                    },
                });
                SocketEvents.stockPositionChanged(family.id).dispatch(
                    {
                        stockId: stockItem.id,
                        position: newPosition,
                    },
                    manager.in(family.id),
                );
                return c.json({
                    success: true,
                });
            } else if (stockItems.length === 2) {
                // if prev is null
                if (data.prevPos === undefined) {
                    const [stockItem, nextStockItem] = stockItems;
                    const newPosition = LexoRank.min()
                        .between(LexoRank.parse(nextStockItem.Meta.position))
                        .toString();
                    await prisma.stockItem.update({
                        where: {
                            id: stockItem.id,
                        },
                        data: {
                            Meta: {
                                update: {
                                    position: newPosition,
                                },
                            },
                        },
                    });
                    SocketEvents.stockPositionChanged(family.id).dispatch(
                        {
                            stockId: stockItem.id,
                            position: newPosition,
                        },
                        manager.in(family.id),
                    );
                    return c.json({
                        success: true,
                    });
                } else {
                    const [prevStockItem, stockItem] = stockItems;
                    const newPosition = LexoRank.parse(
                        prevStockItem.Meta.position,
                    )
                        .between(LexoRank.max())
                        .toString();
                    await prisma.stockItem.update({
                        where: {
                            id: stockItem.id,
                        },
                        data: {
                            Meta: {
                                update: {
                                    position: newPosition,
                                },
                            },
                        },
                    });
                    SocketEvents.stockPositionChanged(family.id).dispatch(
                        {
                            stockId: stockItem.id,
                            position: newPosition,
                        },
                        manager.in(family.id),
                    );
                    return c.json({
                        success: true,
                    });
                }
            } else {
                return c.json(
                    {
                        success: false,
                        message: "Invalid request",
                    },
                    400,
                );
            }
        },
    )

    .patch(
        "/stocks/:stockId",
        familyMiddleware(),
        zValidator(
            "json",
            z.object({
                name: z.string(),
                description: z.string(),
                unit: z.string(),
                quantity: z.number(),
                price: z.number(),
                step: z.number(),
                threshold: z.number(),
                tags: z.array(z.string()),
            }),
        ),
        async (c) => {
            const family = c.var.family;
            const stockId = c.req.param("stockId");
            const data = c.req.valid("json");
            const updatedItem = await prisma.stockItem.update({
                where: {
                    id: stockId,
                },
                data: {
                    quantity: data.quantity,
                    Meta: {
                        update: {
                            name: data.name,
                            description: data.description,
                            unit: data.unit,
                            price: data.price,
                            step: data.step,
                            threshold: data.threshold,
                            Tags: {
                                set: data.tags.map((tag) => ({
                                    id: tag,
                                })),
                            },
                        },
                    },
                },
                include: {
                    Meta: {
                        include: {
                            Tags: true,
                        },
                    },
                },
            });
            SocketEvents.stockUpdated(family.id).dispatch(
                {
                    stock: {
                        ...updatedItem,
                        Meta: { Family: family, ...updatedItem.Meta },
                    },
                },
                manager.in(family.id),
            );
            return c.json({
                success: true,
                item: updatedItem,
            });
        },
    )
    .delete("/stocks/:stockId", familyMiddleware(), async (c) => {
        const family = c.var.family;
        const stockId = c.req.param("stockId");
        await prisma.stockItem.delete({
            where: {
                id: stockId,
            },
        });
        SocketEvents.stockDeleted(family.id).dispatch(
            {
                stockId,
            },
            manager.in(family.id),
        );
        return c.json({
            success: true,
        });
    });
