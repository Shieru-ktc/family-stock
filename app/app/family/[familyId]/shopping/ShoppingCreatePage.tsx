"use client";

import { socketAtom } from "@/atoms/socketAtom";
import StockItemSelector from "@/components/StockItemSelector";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { SocketEvents } from "@/socket/events";
import { StockItemWithFullMeta, StockItemWithPartialMeta } from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAtom } from "jotai";
import { useEffect, useState } from "react";
import { InferRequestType } from "hono";
import { apiClient } from "@/lib/apiClient";
import { useGetStocksQuery } from "@/app/app/queries/Stocks";

type ShoppingPostRequest = InferRequestType<
    (typeof apiClient.api.family)[":familyId"]["shopping"]["$post"]
>["json"];

export default function ShoppingCreatePage({ familyId }: { familyId: string }) {
    const [socket] = useAtom(socketAtom);
    const { toast } = useToast();
    const { data: stocks, isPending } = useGetStocksQuery(familyId);
    const [checked, setChecked] = useState<string[]>([]);

    const queryClient = useQueryClient();

    const useCreateNewShopping = () =>
        useMutation({
            mutationFn: async (shopping: ShoppingPostRequest) => {
                await (
                    await apiClient.api.family[":familyId"].shopping.$post({
                        param: {
                            familyId,
                        },
                        json: shopping,
                    })
                ).json();
            },
        });
    const createNewShopping = useCreateNewShopping();

    const handleCreateShopping = () => {
        if (stocks) {
            createNewShopping.mutate(checked);
        }
    };

    useEffect(() => {
        const unsubscribeCreated = SocketEvents.stockCreated(familyId).listen(
            socket,
            (data) => {
                queryClient.setQueryData<StockItemWithFullMeta[]>(
                    ["family", familyId, "stocks"],
                    (prevStocks) =>
                        prevStocks ? [...prevStocks, data.stock] : [data.stock],
                );
            },
        );

        const unsubscribeQuantityChanged =
            SocketEvents.stockQuantityChanged.listen(socket, (data) => {
                queryClient.setQueryData<StockItemWithFullMeta[]>(
                    ["family", familyId, "stocks"],
                    (prevStocks) =>
                        prevStocks?.map((stock) =>
                            stock.id === data.stock.id
                                ? { ...stock, quantity: data.stock.quantity }
                                : stock,
                        ) ?? [],
                );
            });

        const unsubscribeEdited = SocketEvents.stockUpdated(familyId).listen(
            socket,
            (data) => {
                queryClient.setQueryData<StockItemWithFullMeta[]>(
                    ["family", familyId, "stocks"],
                    (prevStocks) =>
                        prevStocks?.map((stock) =>
                            stock.id === data.stock.id ? data.stock : stock,
                        ) ?? [],
                );
            },
        );

        const unsubscribeDeleted = SocketEvents.stockDeleted(familyId).listen(
            socket,
            (data) => {
                queryClient.setQueryData<StockItemWithFullMeta[]>(
                    ["family", familyId, "stocks"],
                    (prevStocks) =>
                        prevStocks?.filter(
                            (stock) => stock.id !== data.stockId,
                        ) ?? [],
                );
            },
        );
        return () => {
            unsubscribeCreated();
            unsubscribeQuantityChanged();
            unsubscribeEdited();
            unsubscribeDeleted();
        };
    }, [socket, familyId]);

    return (
        <>
            <div className="mr-2 flex-row items-end justify-between lg:flex">
                <div>
                    <h1 className="text-2xl">買い物を開始する</h1>
                    <p>家族全員がアクセスできる買い物リストを作成します。</p>
                </div>
                <Button onClick={handleCreateShopping}>
                    買い物リストを作成する
                </Button>
            </div>

            <hr className="my-2" />
            {stocks && (
                <StockItemSelector
                    stocks={
                        stocks.map((stock) => ({
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
        </>
    );
}
