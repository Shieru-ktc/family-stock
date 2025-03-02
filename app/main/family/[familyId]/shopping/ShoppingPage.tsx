"use client";

import { useGetStocksQuery } from "@/app/main/queries/Stocks";
import { socketAtom } from "@/atoms/socketAtom";
import ShoppingItem from "@/components/ShoppingItem";
import StockItemSelector from "@/components/StockItemSelector";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { apiClient } from "@/lib/apiClient";
import { SocketEvents } from "@/socket/events";
import {
    PartialShopping,
    PartialShoppingItemWithStockItemMeta,
    StockItemWithPartialMeta,
    StockItemWithPartialTagMeta,
} from "@/types";
import { TagColor } from "@prisma/client";
import { useAtom } from "jotai";
import { useRef, useState } from "react";

type ShoppingType = {
    familyId: string;
    Items: {
        id: string;
        quantity: number;
        stockItemId: string;
        StockItem: {
            Meta: {
                name: string;
                position: string;
                Tags: {
                    id: string;
                    name: string;
                    color: TagColor;
                    description?: string;
                }[];
            };
        };
    }[];
};
function filterNotInShopping(
    stocks: StockItemWithPartialTagMeta[],
    shopping: ShoppingType,
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
    shopping: ShoppingType;
    familyId: string;
}) {
    const [addItemsOpen, setAddItemsOpen] = useState(false);
    const [addItemsSending, setAddItemsSending] = useState(false);

    const [socket] = useAtom(socketAtom);
    const sortedItems: ShoppingType["Items"] = shopping.Items.toSorted((a, b) =>
        a.StockItem.Meta.position.localeCompare(b.StockItem.Meta.position),
    );
    const [checked, setChecked] = useState<string[]>([]);
    const temporaryRef = useRef<HTMLTextAreaElement>(null);

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
            json: {
                items: checked,
                temporary:
                    temporaryRef.current?.value
                        .trim()
                        .split("\n")
                        .filter((v) => v !== "") ?? undefined,
            },
        });
        setAddItemsOpen(false);
        setAddItemsSending(false);
        setChecked([]);
    };

    return (
        <>
            <Dialog open={addItemsOpen} onOpenChange={setAddItemsOpen}>
                <DialogContent>
                    <DialogTitle>新しいアイテムを追加する</DialogTitle>
                    <Tabs defaultValue="addItems">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="addItems">
                                アイテムを追加
                            </TabsTrigger>
                            <TabsTrigger value="temporary">
                                一時アイテム
                            </TabsTrigger>
                        </TabsList>
                        <TabsContent value="addItems">
                            {stocks && (
                                <StockItemSelector
                                    stocks={
                                        filterNotInShopping(
                                            stocks,
                                            shopping,
                                        ).map((stock) => ({
                                            ...stock,
                                            checked: checked.includes(stock.id),
                                        })) as (StockItemWithPartialTagMeta & {
                                            checked: boolean;
                                        })[]
                                    }
                                    onCheckedChange={(stock, checked) => {
                                        if (checked) {
                                            setChecked((prev) => [
                                                ...prev,
                                                stock.id,
                                            ]);
                                        } else {
                                            setChecked((prev) =>
                                                prev.filter(
                                                    (id) => id !== stock.id,
                                                ),
                                            );
                                        }
                                    }}
                                />
                            )}
                            {stocks &&
                                filterNotInShopping(stocks, shopping).length ===
                                    0 && (
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
                                選択したアイテムを追加
                            </Button>
                        </TabsContent>
                        <TabsContent value="temporary">
                            <p>
                                この買い物のために、在庫アイテムを一時的に作成することができます。
                                <br />
                                以下のテキストボックスに、改行区切りでアイテム名を入力してください。
                            </p>
                            <p className="text-red-800 dark:text-red-200">
                                作成されたアイテムは、買い物の終了時に自動で削除されます。
                            </p>
                            <Textarea
                                className="my-2"
                                rows={5}
                                placeholder={"例: 生クリーム\nいちご\n小麦粉"}
                                ref={temporaryRef}
                            />
                            <Button
                                disabled={addItemsSending}
                                onClick={handleAddItems}
                            >
                                アイテムを追加
                            </Button>
                        </TabsContent>
                    </Tabs>
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
