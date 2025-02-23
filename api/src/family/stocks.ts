import { Hono } from "hono";
import { familyMiddleware } from "./familyMiddleware";
import { SocketEvents } from "@/socket/events";
import { manager } from "../ws";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { prisma } from "@/lib/prisma";

export const stocksApi = new Hono()
    .get(
        "/stocks",
        familyMiddleware({ StockItems: { include: { Meta: true } } }),
        async (c) => {
            const family = c.var.family;
            return c.json(family.StockItems);
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
            }),
        ),
        async (c) => {
            const family = c.var.family;
            const data = c.req.valid("json");
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
                            Family: {
                                connect: {
                                    id: family.id,
                                },
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
