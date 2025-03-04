import { Server, Socket } from "socket.io";
import { assertStockItemWithMeta, prisma } from "../lib/prisma";
import { SocketEvents } from "./events";
import { Channelable, Emittable, Listener } from "./manager";
import { StockItem } from "@prisma/client";
import { LexoRank } from "@dalet-oss/lexorank";
import { StockItemWithMeta, StockItemWithPartialMeta } from "@/types";

export default function ClientEventHandler(
    io: Channelable & Emittable,
    socket: Listener,
    userId: string,
) {
    SocketEvents.clientStockQuantityChanged.listen(socket, (data) => {
        prisma.stockItem
            .update({
                where: {
                    id: data.stockId,
                    Family: {
                        Members: {
                            some: {
                                User: {
                                    id: userId,
                                },
                            },
                        },
                    },
                },
                data: {
                    quantity: data.quantity,
                },
            })
            .then((stock) => {
                SocketEvents.stockQuantityChanged.dispatch(
                    {
                        stock,
                    },
                    io.in(stock.familyId),
                );
            });
    });

    SocketEvents.clientShoppingQuantityChanged.listen(socket, (data) => {
        prisma.shoppingItem
            .update({
                where: {
                    id: data.itemId,
                    Shopping: {
                        Family: {
                            Members: {
                                some: {
                                    User: {
                                        id: userId,
                                    },
                                },
                            },
                        },
                    },
                },
                include: {
                    Shopping: true,
                },
                data: {
                    quantity: data.quantity,
                },
            })
            .then((shopping) => {
                SocketEvents.shoppingQuantityChanged.dispatch(
                    {
                        item: shopping,
                    },
                    io.in(shopping.Shopping.familyId),
                );
            });
    });

    SocketEvents.clientStockDeleted.listen(socket, (data) => {
        prisma.stockItem
            .delete({
                where: {
                    id: data.stockId,
                    Family: {
                        Members: {
                            some: {
                                User: {
                                    id: userId,
                                },
                            },
                        },
                    },
                },
            })
            .then((stock) => {
                SocketEvents.stockDeleted(stock.familyId).dispatch(
                    {
                        stockId: stock.id,
                    },
                    io.in(stock.familyId),
                );
            });
    });

    SocketEvents.clientStockPositionChanged.listen(socket, (data) => {
        let backItem: StockItemWithPartialMeta | null = null;
        let frontItem: StockItemWithPartialMeta | null = null;
        let item: StockItemWithPartialMeta | null = null;
        const promises = [];

        if (data.backItemId) {
            promises.push(
                prisma.stockItem
                    .findFirst({
                        where: {
                            id: data.backItemId,
                            Family: {
                                Members: {
                                    some: {
                                        User: {
                                            id: userId,
                                        },
                                    },
                                },
                            },
                        },
                        include: {
                            Meta: true,
                        },
                    })
                    .then(
                        (stock) => (backItem = assertStockItemWithMeta(stock)),
                    ),
            );
        }
        if (data.frontItemId) {
            promises.push(
                prisma.stockItem
                    .findFirst({
                        where: {
                            id: data.frontItemId,
                            Family: {
                                Members: {
                                    some: {
                                        User: {
                                            id: userId,
                                        },
                                    },
                                },
                            },
                        },
                        include: {
                            Meta: true,
                        },
                    })
                    .then(
                        (stock) => (frontItem = assertStockItemWithMeta(stock)),
                    ),
            );
        }
        promises.push(
            prisma.stockItem
                .findFirst({
                    where: {
                        id: data.stockId,
                        Family: {
                            Members: {
                                some: {
                                    User: {
                                        id: userId,
                                    },
                                },
                            },
                        },
                    },
                    include: {
                        Meta: true,
                    },
                })
                .then((stock) => (item = assertStockItemWithMeta(stock))),
        );

        Promise.all(promises).then(async () => {
            if (item === null) {
                console.log("item not found");
                return;
            }
            if (backItem === null && frontItem === null) {
                console.log("both back and front not found");
                return;
            }
            let position = "";

            if (backItem === null && frontItem !== null) {
                position = LexoRank.min()
                    .between(LexoRank.parse(frontItem.Meta.position))
                    .toString();
                console.log(position);
                await prisma.stockItemMeta.update({
                    where: {
                        id: item.Meta.id,
                    },
                    data: {
                        position,
                    },
                });
            } else if (frontItem === null && backItem !== null) {
                position = LexoRank.parse(backItem.Meta.position)
                    .between(LexoRank.max())
                    .toString();
                console.log(position);
                await prisma.stockItemMeta.update({
                    where: {
                        id: item.Meta.id,
                    },
                    data: {
                        position,
                    },
                });
            } else if (backItem !== null && frontItem !== null) {
                position = LexoRank.parse(backItem.Meta.position)
                    .between(LexoRank.parse(frontItem.Meta.position))
                    .toString();
                console.log(position);
                await prisma.stockItemMeta.update({
                    where: {
                        id: item.Meta.id,
                    },
                    data: {
                        position,
                    },
                });
            }

            SocketEvents.stockPositionChanged(item.familyId).dispatch(
                {
                    stockId: item.id,
                    position,
                },
                io.in(item.familyId),
            );
        });

        if (backItem === null && frontItem === null) {
            return;
        }
    });
}
