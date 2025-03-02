import { Hono } from "hono";
import { familyMiddleware } from "./familyMiddleware";
import { SocketEvents } from "@/socket/events";
import { manager } from "../ws";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { assertStockItemWithMeta, prisma } from "@/lib/prisma";
import { LexoRank } from "@dalet-oss/lexorank";

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
        zValidator(
            "json",
            z.object({
                items: z.array(z.string()),
                temporary: z.array(z.string()).optional(),
            }),
        ),
        async (c) => {
            const family = c.var.family;
            const { token } = c.var.authUser;
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
            let position = lastStockItem
                ? LexoRank.parse(lastStockItem.Meta!.position).between(
                      LexoRank.max(),
                  )
                : LexoRank.min().genNext();
            let tempTag = await prisma.stockItemTag.findFirst({
                where: {
                    familyId: family.id,
                    name: "Temporary",
                    system: true,
                },
            });
            if (data.temporary && !tempTag) {
                tempTag = await prisma.stockItemTag.create({
                    data: {
                        name: "Temporary",
                        description:
                            "買い物のために一時的に作成された在庫アイテム",
                        color: "GREY",
                        familyId: family.id,
                        system: true,
                    },
                });
            }
            const shopping = await prisma.shopping.create({
                data: {
                    Family: {
                        connect: {
                            id: family.id,
                        },
                    },
                    Items: {
                        create: [
                            ...data.items.map((stockId) => ({
                                StockItem: {
                                    connect: {
                                        id: stockId,
                                    },
                                },
                                quantity: 0,
                            })),
                            ...(data.temporary?.map((name) => {
                                position = position.genNext();
                                return {
                                    StockItem: {
                                        create: {
                                            Family: {
                                                connect: {
                                                    id: family.id,
                                                },
                                            },
                                            quantity: 0,
                                            Meta: {
                                                create: {
                                                    position:
                                                        position.toString(),
                                                    name: name,
                                                    unit: "",
                                                    price: 0,
                                                    step: 1,
                                                    threshold: 0,
                                                    Family: {
                                                        connect: {
                                                            id: family.id,
                                                        },
                                                    },
                                                    Tags: {
                                                        connect: {
                                                            id: tempTag?.id,
                                                        },
                                                    },
                                                    system: true,
                                                },
                                            },
                                        },
                                    },
                                    quantity: 0,
                                };
                            }) || []),
                        ],
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
    .post(
        "/shopping/items",
        familyMiddleware({ Shopping: true }),
        zValidator("json", z.array(z.string())),
        async (c) => {
            const family = c.var.family;
            const data = c.req.valid("json");
            console.log(family.Shopping?.id, family.shoppingId);
            if (!family.Shopping) {
                return c.json(
                    {
                        success: false,
                        error: "Shopping not found",
                    },
                    404,
                );
            }
            const stockItems = await prisma.stockItem.findMany({
                where: {
                    id: { in: data },
                    familyId: family.id,
                },
            });
            if (stockItems.length !== data.length) {
                return c.json(
                    {
                        success: false,
                        error: "One or more stock items not found",
                    },
                    404,
                );
            }
            const newItems = await prisma.shoppingItem.createManyAndReturn({
                data: stockItems.map((stockItem) => ({
                    shoppingId: family.Shopping!.id,
                    stockItemId: stockItem.id,
                    quantity: 1,
                })),
                include: { StockItem: { include: { Meta: true } } },
            });
            SocketEvents.shoppingItemsAdded(family.id).dispatch(
                {
                    items: newItems.map((item) => ({
                        ...item,
                        StockItem: assertStockItemWithMeta(item.StockItem),
                    })),
                },
                manager.in(family.id),
            );
            return c.json({
                success: true,
                items: newItems,
            });
        },
    )
    .delete(
        "/shopping/items",
        familyMiddleware({ Shopping: true }),
        zValidator("json", z.array(z.string())),
        async (c) => {
            const family = c.var.family;
            const data = c.req.valid("json");
            if (!family.Shopping) {
                return c.json(
                    {
                        success: false,
                        error: "Shopping not found",
                    },
                    404,
                );
            }
            const items = await prisma.shoppingItem.findMany({
                where: {
                    id: { in: data },
                    shoppingId: family.Shopping.id,
                },
            });
            if (items.length !== data.length) {
                return c.json(
                    {
                        success: false,
                        error: "One or more items not found",
                    },
                    404,
                );
            }
            const temporaryItems = await prisma.stockItem.findMany({
                where: {
                    id: { in: items.map((item) => item.stockItemId) },
                    Meta: {
                        Tags: {
                            some: {
                                name: "Temporary",
                            },
                        },
                        system: true,
                    },
                },
            });
            temporaryItems.forEach((item) => {
                SocketEvents.stockDeleted(family.id).dispatch(
                    {
                        stockId: item.id,
                    },
                    manager.in(family.id),
                );
            });
            await prisma.stockItem.deleteMany({
                where: {
                    id: { in: items.map((item) => item.stockItemId) },
                    Meta: {
                        Tags: {
                            some: {
                                name: "Temporary",
                            },
                        },
                        system: true,
                    },
                },
            });
            await prisma.shoppingItem.deleteMany({
                where: {
                    id: { in: data },
                },
            });
            SocketEvents.shoppingItemsDeleted(family.id).dispatch(
                {
                    items,
                },
                manager.in(family.id),
            );
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
            const shopping = family.Shopping;
            if (!shopping) {
                return c.json(
                    {
                        success: false,
                        error: "Shopping not found",
                    },
                    404,
                );
            }
            if (isCompleted) {
                shopping.Items.forEach((item) => {
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

            await prisma.stockItem.deleteMany({
                where: {
                    familyId: family.id,
                    ShoppingItem: {
                        shoppingId: shopping.id,
                    },
                    Meta: {
                        system: true,
                        Tags: {
                            some: {
                                name: "Temporary",
                            },
                        },
                    },
                },
            });
            await prisma.shopping.delete({
                where: {
                    id: family.Shopping?.id,
                },
            });
            return c.body(null, 204);
        },
    );
