"use client";

import { useGetStocksQuery } from "@/app/app/queries/Stocks";
import { socketAtom } from "@/atoms/socketAtom";
import ShoppingItem from "@/components/ShoppingItem";
import StockItemSelector from "@/components/StockItemSelector";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogTitle,
} from "@/components/ui/dialog";
import { apiClient } from "@/lib/apiClient";
import { SocketEvents } from "@/socket/events";
import {
    PartialShopping,
    StockItemWithPartialMeta,
} from "@/types";
import { useAtom } from "jotai";
import { useEffect, useState } from "react";

export default function OnGoingShoppingPage({
    shopping: _shopping,
    familyId,
}: {
    shopping: PartialShopping;
    familyId: string;
}) {
    const [shopping, setShopping] = useState(_shopping);
    const [addItemsOpen, setAddItemsOpen] = useState(false);

    const [socket] = useAtom(socketAtom);
    const sortedItems = shopping.Items.toSorted((a, b) =>
        a.StockItem.Meta.name.localeCompare(b.StockItem.Meta.name),
    );
    const [checked, setChecked] = useState<string[]>([]);

    const setCount = (id: string, quantity: number) => {
        setShopping((prevShopping) => ({
            ...prevShopping,
            Items: prevShopping.Items.map((item) =>
                item.id === id ? { ...item, quantity } : item,
            ),
        }));
    };
    const { data: stocks, isPending } = useGetStocksQuery(familyId);

    useEffect(() => {
        const unsubscribeQuantityChanged =
            SocketEvents.shoppingQuantityChanged.listen(socket, (data) => {
                setCount(data.item.id, data.item.quantity);
            });
        return () => {
            unsubscribeQuantityChanged();
        };
    }, [socket]);

    const handleEnd = async (isCompleted: boolean) => {
        await apiClient.api.family[":familyId"].shopping.$delete({
            param: {
                familyId: shopping.familyId,
            },
            json: {
                isCompleted,
            },
        });
    };

    const handleAddItem = () => {
        setAddItemsOpen(true);
    };

    return (
        <>
            <Dialog open={addItemsOpen} onOpenChange={setAddItemsOpen}>
                <DialogContent>
                    <DialogTitle>新しいアイテムを追加する</DialogTitle>
                    {stocks && (
                        <StockItemSelector
                            stocks={
                                stocks
                                    .filter(
                                        (stock) =>
                                            !shopping.Items.map(
                                                (s) => s.stockItemId,
                                            ).includes(stock.id),
                                    )
                                    .map((stock) => ({
                                        ...stock,
                                        checked: checked.includes(stock.id),
                                    })) as (StockItemWithPartialMeta & {
                                    checked: boolean;
                                })[]
                            }
                            onCheckedChange={(stock, checked) => {
                                if (checked) {
                                    setChecked((prev) => [...prev, stock.id]);
                                } else {
                                    setChecked((prev) =>
                                        prev.filter((id) => id !== stock.id),
                                    );
                                }
                            }}
                        />
                    )}
                    <Button>アイテムを追加する</Button>
                </DialogContent>
            </Dialog>
            <div className="mr-2 flex-row items-end justify-between lg:flex">
                <div>
                    <h1 className="text-2xl">買い物リスト</h1>
                    <p>購入したアイテムは在庫リストに加算されます。</p>
                </div>
                <div className="flex flex-col gap-2 sm:flex-row sm:space-x-4">
                    <Button onClick={() => handleEnd(false)}>
                        買い物をキャンセル
                    </Button>
                    <Button onClick={handleAddItem}>
                        新しいアイテムを追加
                    </Button>
                    <Button onClick={() => handleEnd(true)}>
                        買い物を完了
                    </Button>
                </div>
            </div>
            <div>
                {sortedItems.map((item) => (
                    <ShoppingItem
                        key={item.id}
                        item={item}
                        onQuantityChange={(quantity) => {
                            SocketEvents.clientShoppingQuantityChanged.dispatch(
                                {
                                    itemId: item.id,
                                    quantity,
                                },
                                socket,
                            );
                        }}
                        onEdit={() => {}}
                        onDelete={() => {}}
                    />
                ))}
            </div>
        </>
    );
}
