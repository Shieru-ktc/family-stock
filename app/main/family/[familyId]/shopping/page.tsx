"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { use, useEffect } from "react";
import ShoppingCreatePage from "./ShoppingCreatePage";
import OnGoingShoppingPage from "./ShoppingPage";
import { apiClient } from "@/lib/apiClient";
import LoadingPage from "@/app/loading/page";
import { SocketEvents } from "@/socket/events";
import { useAtomValue } from "jotai";
import { socketAtom } from "@/atoms/socketAtom";

type PartialShoppingType =
    | {
          Items: { id: string; quantity: number }[];
      }
    | undefined;

export default function ShoppingPage({
    params,
}: {
    params: Promise<{ familyId: string }>;
}) {
    const familyId = use(params).familyId;
    const socket = useAtomValue(socketAtom);
    const queryClient = useQueryClient();

    const { data: ongoingShopping, isPending } = useQuery({
        queryKey: ["family", familyId, "shopping"],
        queryFn: async () => {
            return await (
                await apiClient.api.family[":familyId"].shopping.$get({
                    param: {
                        familyId,
                    },
                })
            ).json();
        },
        select: (data) => {
            if (data) {
                return {
                    ...data,
                    createdAt: new Date(data.createdAt),
                    Items: data.Items.map((item) => ({
                        ...item,
                        createdAt: new Date(item.createdAt),
                        StockItem: {
                            ...item.StockItem,
                            Meta: {
                                ...item.StockItem.Meta!,
                                createdAt: new Date(
                                    item.StockItem.Meta!.createdAt,
                                ),
                                Tags: item.StockItem.Meta!.Tags.map((tag) => ({
                                    ...tag,
                                    createdAt: new Date(tag.createdAt),
                                })),
                            },
                            createdAt: new Date(item.StockItem.createdAt),
                        },
                    })),
                };
            }
            return null;
        },
        refetchOnMount: "always",
        refetchOnReconnect: "always",
        refetchOnWindowFocus: "always",
    });

    useEffect(() => {
        const unsubscribeQuantityChanged =
            SocketEvents.shoppingQuantityChanged.listen(socket, (data) => {
                queryClient.setQueryData(
                    ["family", familyId, "shopping"],
                    (prevShopping: PartialShoppingType) => {
                        if (prevShopping) {
                            return {
                                ...prevShopping,
                                Items: prevShopping.Items.map((item) =>
                                    item.id === data.item.id
                                        ? {
                                              ...item,
                                              quantity: data.item.quantity,
                                          }
                                        : item,
                                ),
                            };
                        }
                        return prevShopping;
                    },
                );
            });
        const unsubscribeItemsAdded = SocketEvents.shoppingItemsAdded(
            familyId,
        ).listen(socket, (data) => {
            queryClient.setQueryData(
                ["family", familyId, "shopping"],
                (prevShopping: PartialShoppingType) => {
                    console.log("added", data);
                    if (prevShopping) {
                        return {
                            ...prevShopping,
                            Items: [...prevShopping.Items, ...data.items],
                        };
                    }
                    return prevShopping;
                },
            );
        });
        const unsubscribeItemsDeleted = SocketEvents.shoppingItemsDeleted(
            familyId,
        ).listen(socket, (data) => {
            queryClient.setQueryData(
                ["family", familyId, "shopping"],
                (prevShopping: PartialShoppingType) => {
                    if (prevShopping) {
                        return {
                            ...prevShopping,
                            Items: prevShopping.Items.filter(
                                (item) =>
                                    !data.items.some(
                                        (dataItem) => dataItem.id === item.id,
                                    ),
                            ),
                        };
                    }
                    return prevShopping;
                },
            );
        });
        return () => {
            unsubscribeQuantityChanged();
            unsubscribeItemsAdded();
            unsubscribeItemsDeleted();
        };
    }, [socket]);

    if (isPending) {
        return <LoadingPage />;
    } else if (ongoingShopping) {
        return (
            <OnGoingShoppingPage
                shopping={ongoingShopping}
                familyId={familyId}
            />
        );
    } else {
        return <ShoppingCreatePage familyId={familyId} />;
    }
}
