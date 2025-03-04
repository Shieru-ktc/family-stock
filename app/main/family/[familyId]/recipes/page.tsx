"use client";

import { Button } from "@/components/ui/button";
import { apiClient } from "@/lib/apiClient";
import { useQuery } from "@tanstack/react-query";
import { use } from "react";

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
            <Button>新しいレシピを作成する</Button>
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
    return (
        <div>
            {recipes?.map((recipe) => (
                <div key={recipe.id}>
                    <h2>{recipe.name}</h2>
                    <p>{recipe.description}</p>
                    <ul>
                        {recipe.RecipeItems.map((item) => (
                            <li key={item.id}>
                                {item.StockItem.id} x{item.quantity}
                            </li>
                        ))}
                    </ul>
                </div>
            ))}
        </div>
    );
}
