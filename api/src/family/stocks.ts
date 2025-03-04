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
                    a.Meta!.position.localeCompare(b.Meta!.position),
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
            const exceededStockItem = await prisma.stockItem.findFirst({
                where: {
                    familyId: family.id,
                },
                skip: family.Config.maxStocksPerFamily - 1,
            });
            if (exceededStockItem) {
                return c.json(
                    {
                        error: "You have reached the maximum number of stocks.",
                    },
                    400,
                );
            }
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
            const isSystemTagIncluded = await prisma.stockItemTag.findFirst({
                where: {
                    id: {
                        in: data.tags,
                    },
                    familyId: family.id,
                    system: true,
                },
            });
            if (isSystemTagIncluded) {
                return c.json(
                    { error: "System tags cannot be included." },
                    400,
                );
            }
            const position =
                lastStockItem ?
                    LexoRank.parse(lastStockItem.Meta!.position)
                        .between(LexoRank.max())
                        .toString()
                :   LexoRank.min().genNext().toString();
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
                        Meta: { Family: family, ...createdItem.Meta! },
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
            const stockItem = await prisma.stockItem.findFirst({
                where: {
                    id: stockId,
                    familyId: family.id,
                },
                include: {
                    Meta: true,
                },
            });
            if (!stockItem) {
                return c.json(
                    {
                        error: "Stock not found.",
                    },
                    404,
                );
            }
            if (stockItem.Meta!.system) {
                return c.json(
                    {
                        error: "System managed stocks cannot be deleted.",
                    },
                    400,
                );
            }
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
                        Meta: { Family: family, ...updatedItem.Meta! },
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
        const stockItem = await prisma.stockItem.findFirst({
            where: {
                id: stockId,
                familyId: family.id,
            },
            include: {
                Meta: true,
            },
        });
        if (!stockItem) {
            return c.json(
                {
                    error: "Stock not found.",
                },
                404,
            );
        }
        if (stockItem.Meta!.system) {
            return c.json(
                {
                    error: "System managed stocks cannot be deleted.",
                },
                400,
            );
        }
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
