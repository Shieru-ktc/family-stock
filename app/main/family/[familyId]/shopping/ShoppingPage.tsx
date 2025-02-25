"use client";

import { useGetStocksQuery } from "@/app/main/queries/Stocks";
import { socketAtom } from "@/atoms/socketAtom";
import ShoppingItem from "@/components/ShoppingItem";
import StockItemSelector from "@/components/StockItemSelector";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { apiClient } from "@/lib/apiClient";
import { SocketEvents } from "@/socket/events";
import { PartialShopping, StockItemWithPartialMeta } from "@/types";
import { useAtom } from "jotai";
import { useState } from "react";

function filterNotInShopping(
    stocks: StockItemWithPartialMeta[],
    shopping: PartialShopping,
) {
    return stocks.filter(
        (stock) =>
            !shopping.Items.map((item) => item.stockItemId).includes(stock.id),
    );
}
export default function OnGoingShoppingPage({
    shopping,
    familyId,
}: {
    shopping: PartialShopping;
    familyId: string;
}) {
    const [addItemsOpen, setAddItemsOpen] = useState(false);
    const [addItemsSending, setAddItemsSending] = useState(false);

    const [socket] = useAtom(socketAtom);
    const sortedItems = shopping.Items.toSorted((a, b) =>
        a.StockItem.Meta.name.localeCompare(b.StockItem.Meta.name),
    );
    const [checked, setChecked] = useState<string[]>([]);

    const { data: stocks } = useGetStocksQuery(familyId);


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

    const handleAddItems = async () => {
        setAddItemsSending(true);
        await apiClient.api.family[":familyId"].shopping.items.$post({
            param: {
                familyId: familyId,
            },
            json: checked,
        });
        setAddItemsSending(false);
        setAddItemsOpen(false);
    };

    return (
        <>
            <Dialog open={addItemsOpen} onOpenChange={setAddItemsOpen}>
                <DialogContent>
                    <DialogTitle>新しいアイテムを追加する</DialogTitle>
                    {stocks && (
                        <StockItemSelector
                            stocks={
                                filterNotInShopping(stocks, shopping).map(
                                    (stock) => ({
                                        ...stock,
                                        checked: checked.includes(stock.id),
                                    }),
                                ) as (StockItemWithPartialMeta & {
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
                    {stocks &&
                        filterNotInShopping(stocks, shopping).length === 0 && (
                            <p>追加できる在庫アイテムがありません。</p>
                        )}
                    <Button
                        disabled={
                            addItemsSending ||
                            filterNotInShopping(stocks ?? [], shopping)
                                .length === 0
                        }
                        onClick={handleAddItems}
                    >
                        アイテムを追加する
                    </Button>
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
                        onDelete={() => {
                            apiClient.api.family[
                                ":familyId"
                            ].shopping.items.$delete({
                                param: {
                                    familyId: familyId,
                                },
                                json: [item.id],
                            });
                        }}
                    />
                ))}
            </div>
        </>
    );
}
