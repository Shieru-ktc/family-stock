"use client";

import { useQuery } from "@tanstack/react-query";
import { use } from "react";
import ShoppingCreatePage from "./ShoppingCreatePage";
import OnGoingShoppingPage from "./ShoppingPage";
import { InferResponseType } from "hono";
import { apiClient } from "@/lib/apiClient";

export default function ShoppingPage({
    params,
}: {
    params: Promise<{ familyId: string }>;
}) {
    const familyId = use(params).familyId;
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
                                ...item.StockItem.Meta,
                                createdAt: new Date(
                                    item.StockItem.Meta.createdAt,
                                ),
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

    if (isPending) {
        return <div>loading...</div>;
    } else if (ongoingShopping) {
        return <OnGoingShoppingPage shopping={ongoingShopping} />;
    } else {
        return <ShoppingCreatePage familyId={familyId} />;
    }
}
