"use client";

import Tag from "@/components/Tag";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { apiClient } from "@/lib/apiClient";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { use } from "react";
import { toast } from "sonner";

export default function RecipesPage({
    params,
}: {
    params: Promise<{ familyId: string }>;
}) {
    const { familyId } = use(params);

    return (
        <div>
            <h1 className="text-2xl">レシピ</h1>
            <p>
                レシピを使うと、複数の在庫アイテムの消費を一括で管理できます。
            </p>
            <Button asChild>
                <Link href="recipes/new">新しいレシピを作成する</Link>
            </Button>
            <hr className="my-2" />
            <RecipeList familyId={familyId} />
        </div>
    );
}

export function RecipeList({ familyId }: { familyId: string }) {
    const { data: recipes } = useQuery({
        queryKey: ["family", familyId, "recipes"],
        queryFn: async () => {
            const res = await apiClient.api.family[":familyId"].recipes.$get({
                param: {
                    familyId,
                },
            });
            return await res.json();
        },
    });

    async function isConsumeable(recipeId: string) {
        const res = await apiClient.api.family[":familyId"].recipes[
            ":recipeId"
        ].consume.$get({
            param: {
                familyId,
                recipeId,
            },
        });
        if (res.ok) {
            return await res.json();
        } else {
            return false;
        }
    }

    function consume(recipeId: string) {
        const mutate = async () => {
            if (!(await isConsumeable(recipeId))) {
                toast.info("Not enough items to consume this recipe.");
                return;
            }
            await apiClient.api.family[":familyId"].recipes[
                ":recipeId"
            ].consume.$post({
                param: {
                    familyId,
                    recipeId,
                },
            });
        };
        mutate();
    }

    return (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {recipes?.map((recipe) => (
                <div key={recipe.id}>
                    <Card>
                        <CardHeader>
                            <CardTitle>{recipe.name}</CardTitle>
                            <p>{recipe.description}</p>
                        </CardHeader>
                        <CardContent>
                            {recipe.RecipeItems.sort((a, b) =>
                                a.StockItem.Meta!.position.localeCompare(
                                    b.StockItem.Meta!.position,
                                ),
                            ).map((item) => (
                                <div
                                    className={
                                        "m-2 flex items-center rounded-md border border-slate-200 p-4 shadow-xl dark:border-slate-800"
                                    }
                                    key={item.id}
                                >
                                    <div className="p-2">
                                        <div className="flex items-center justify-center gap-3">
                                            <div>
                                                <h2 className="flex-shrink-0 overflow-hidden text-ellipsis text-xl font-bold">
                                                    {item.StockItem.Meta!.name}
                                                </h2>
                                                <div className="flex gap-2">
                                                    {item.StockItem.Meta!.Tags.map(
                                                        (tag) => (
                                                            <Tag
                                                                key={tag.id}
                                                                tag={tag}
                                                            />
                                                        ),
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex-grow p-2" />

                                    <div className="flex flex-shrink-0 items-center">
                                        <div className="text-2xl font-bold">
                                            {item.quantity}
                                            {item.StockItem.Meta!.unit}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                        <CardFooter>
                            <Button onClick={() => consume(recipe.id)}>
                                このレシピを使う
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            ))}
        </div>
    );
}
