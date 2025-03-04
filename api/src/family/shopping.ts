import { Hono } from "hono";
import { familyMiddleware } from "./familyMiddleware";
import { SocketEvents } from "@/socket/events";
import { manager } from "../ws";
import { date, z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { assertStockItemWithMeta, prisma } from "@/lib/prisma";
import { LexoRank } from "@dalet-oss/lexorank";

/**
 * ヘルパー関数: 指定の familyId における最新の StockItem の位置を元に、新規の position を返す
 */
async function getInitialPosition(familyId: string) {
    const lastStockItem = await prisma.stockItem.findFirst({
        where: { familyId },
        include: { Meta: true },
        orderBy: { Meta: { position: "desc" } },
    });
    return lastStockItem ?
            LexoRank.parse(lastStockItem.Meta!.position).between(LexoRank.max())
        :   LexoRank.min().genNext();
}

/**
 * ヘルパー関数: Temporary タグが存在しなければ作成（temporary アイテムがある場合のみ）
 */
async function ensureTemporaryTag(familyId: string, hasTemporary: boolean) {
    let tempTag = await prisma.stockItemTag.findFirst({
        where: {
            familyId,
            name: "Temporary",
            system: true,
        },
    });
    if (hasTemporary && !tempTag) {
        tempTag = await prisma.stockItemTag.create({
            data: {
                name: "Temporary",
                description: "買い物のために一時的に作成された在庫アイテム",
                color: "GREY",
                familyId,
                system: true,
            },
        });
    }
    return tempTag;
}

/**
 * ヘルパー関数: temporary な StockItem 作成後、stockCreated イベントを dispatch する
 */
function dispatchStockCreatedForTemporaryItems(
    familyId: string,
    items: any[],
    family: any,
) {
    items
        .filter((item) => item.StockItem.Meta?.system)
        .forEach((item) => {
            const asserted = assertStockItemWithMeta(item.StockItem);
            SocketEvents.stockCreated(familyId).dispatch(
                {
                    stock: {
                        ...asserted,
                        Meta: {
                            ...asserted.Meta,
                            Family: { ...family },
                            Tags:
                                item.StockItem.Meta?.Tags ?
                                    [...item.StockItem.Meta.Tags]
                                :   [],
                        },
                    },
                },
                manager.in(familyId),
            );
        });
}

/**
 * ヘルパー関数: 指定の StockItem（temporary）削除時のイベント送信
 */
function dispatchStockDeletedEvents(familyId: string, items: any[]) {
    items.forEach((item) => {
        SocketEvents.stockDeleted(familyId).dispatch(
            { stockId: item.id },
            manager.in(familyId),
        );
    });
}

export const shoppingApi = new Hono()
    // GET /shopping
    .get(
        "/shopping",
        familyMiddleware({
            Shopping: {
                include: {
                    Items: {
                        include: {
                            StockItem: {
                                include: { Meta: { include: { Tags: true } } },
                            },
                        },
                    },
                },
            },
        }),
        async (c) => {
            const family = c.var.family;
            return c.json(family.Shopping);
        },
    )

    // POST /shopping
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

            // 位置の初期値取得
            let position = await getInitialPosition(family.id);

            // Temporary タグの取得／作成
            const tempTag = await ensureTemporaryTag(
                family.id,
                Boolean(data.temporary),
            );

            const shopping = await prisma.shopping.create({
                data: {
                    Family: {
                        connect: { id: family.id },
                    },
                    Items: {
                        create: [
                            ...data.items.map((stockId) => ({
                                StockItem: {
                                    connect: { id: stockId },
                                },
                                quantity: 0,
                            })),
                            // temporary アイテムの一括生成（ネストした create で同時生成）
                            ...(data.temporary || []).map((name) => {
                                position = position.genNext();
                                return {
                                    StockItem: {
                                        create: {
                                            Family: {
                                                connect: { id: family.id },
                                            },
                                            quantity: 0,
                                            Meta: {
                                                create: {
                                                    position:
                                                        position.toString(),
                                                    name,
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
                            }),
                        ],
                    },
                    User: { connect: { id: token.sub } },
                },
                include: {
                    Items: {
                        include: {
                            StockItem: {
                                include: {
                                    Meta: {
                                        include: { Family: true, Tags: true },
                                    },
                                },
                            },
                        },
                    },
                },
            });

            // temporary アイテムがあればイベント送信
            if (data.temporary) {
                dispatchStockCreatedForTemporaryItems(
                    family.id,
                    shopping.Items,
                    family,
                );
            }

            SocketEvents.shoppingCreated(family.id).dispatch(
                { shoppingId: shopping.id },
                manager.in(family.id),
            );

            return c.json({
                success: true,
                shopping,
            });
        },
    )

    // POST /shopping/items
    .post(
        "/shopping/items",
        familyMiddleware({ Shopping: true }),
        zValidator(
            "json",
            z.object({
                items: z.array(z.string()),
                temporary: z.array(z.string()).optional(),
            }),
        ),
        async (c) => {
            const family = c.var.family;
            const data = c.req.valid("json");

            if (!family.Shopping) {
                return c.json(
                    { success: false, error: "Shopping not found" },
                    404,
                );
            }

            const stockItems = await prisma.stockItem.findMany({
                where: {
                    id: { in: data.items },
                    familyId: family.id,
                },
            });
            if (stockItems.length !== data.items.length) {
                return c.json(
                    {
                        success: false,
                        error: "One or more stock items not found",
                    },
                    404,
                );
            }

            // 位置の初期値取得
            let position = await getInitialPosition(family.id);
            // Temporary タグの取得／作成
            const tempTag = await ensureTemporaryTag(
                family.id,
                Boolean(data.temporary),
            );

            const createdItems = await prisma.shoppingItem.createManyAndReturn({
                data: [
                    ...data.items.map((stockId) => ({
                        shoppingId: family.Shopping!.id,
                        stockItemId: stockId,
                        quantity: 0,
                    })),
                ],
                include: {
                    StockItem: {
                        include: { Meta: { include: { Tags: true } } },
                    },
                },
            });

            // temporary アイテムを個別に作成
            const newItems = await Promise.all(
                (data.temporary || []).map(async (name) => {
                    position = position.genNext();
                    const stockItem = await prisma.stockItem.create({
                        data: {
                            Family: { connect: { id: family.id } },
                            quantity: 0,
                            Meta: {
                                create: {
                                    position: position.toString(),
                                    name,
                                    unit: "",
                                    price: 0,
                                    step: 1,
                                    threshold: 0,
                                    Family: { connect: { id: family.id } },
                                    Tags: { connect: { id: tempTag?.id } },
                                    system: true,
                                },
                            },
                        },
                    });
                    return prisma.shoppingItem.create({
                        data: {
                            shoppingId: family.Shopping!.id,
                            stockItemId: stockItem.id,
                            quantity: 0,
                        },
                        include: {
                            StockItem: {
                                include: { Meta: { include: { Tags: true } } },
                            },
                        },
                    });
                }),
            );

            const allItems = [...createdItems, ...newItems];

            SocketEvents.shoppingItemsAdded(family.id).dispatch(
                {
                    items: allItems.map((item) => ({
                        ...item,
                        StockItem: assertStockItemWithMeta(item.StockItem),
                    })),
                },
                manager.in(family.id),
            );
            return c.json({ success: true, items: allItems });
        },
    )

    // DELETE /shopping/items
    .delete(
        "/shopping/items",
        familyMiddleware({ Shopping: true }),
        zValidator("json", z.array(z.string())),
        async (c) => {
            const family = c.var.family;
            const data = c.req.valid("json");

            if (!family.Shopping) {
                return c.json(
                    { success: false, error: "Shopping not found" },
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
                    { success: false, error: "One or more items not found" },
                    404,
                );
            }

            const temporaryItems = await prisma.stockItem.findMany({
                where: {
                    id: { in: items.map((item) => item.stockItemId) },
                    Meta: {
                        Tags: {
                            some: { name: "Temporary" },
                        },
                        system: true,
                    },
                },
            });

            dispatchStockDeletedEvents(family.id, temporaryItems);

            await prisma.stockItem.deleteMany({
                where: {
                    id: { in: items.map((item) => item.stockItemId) },
                    Meta: {
                        Tags: {
                            some: { name: "Temporary" },
                        },
                        system: true,
                    },
                },
            });
            await prisma.shoppingItem.deleteMany({
                where: { id: { in: data } },
            });

            SocketEvents.shoppingItemsDeleted(family.id).dispatch(
                { items },
                manager.in(family.id),
            );
            return c.json({ success: true });
        },
    )

    // DELETE /shopping
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
                    { success: false, error: "Shopping not found" },
                    404,
                );
            }
            if (isCompleted) {
                shopping.Items.forEach((item) => {
                    const stockItem = family.StockItems.find(
                        (si) => si.id === item.stockItemId,
                    );
                    if (stockItem) {
                        stockItem.quantity += item.quantity;
                        SocketEvents.stockQuantityChanged.dispatch(
                            { stock: stockItem },
                            manager.in(family.id),
                        );
                    }
                });
                await prisma.family.update({
                    where: { id: family.id },
                    data: {
                        StockItems: {
                            updateMany: family.StockItems.map((stockItem) => ({
                                where: { id: stockItem.id },
                                data: { quantity: stockItem.quantity },
                            })),
                        },
                    },
                });
            }

            const temporaryItems = await prisma.stockItem.findMany({
                where: {
                    Meta: {
                        Tags: {
                            some: { name: "Temporary" },
                        },
                        system: true,
                    },
                },
            });
            dispatchStockDeletedEvents(family.id, temporaryItems);

            await prisma.stockItem.deleteMany({
                where: {
                    Meta: {
                        Tags: {
                            some: { name: "Temporary" },
                        },
                        system: true,
                    },
                },
            });
            await prisma.shopping.delete({
                where: { id: family.Shopping?.id },
            });
            return c.body(null, 204);
        },
    );
