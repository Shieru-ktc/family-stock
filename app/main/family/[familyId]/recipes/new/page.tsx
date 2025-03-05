"use client";

import { useGetStocksQuery } from "@/app/main/queries/Stocks";
import Counter from "@/components/Counter";
import Tag from "@/components/Tag";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { apiClient } from "@/lib/apiClient";
import { TagColor } from "@prisma/client";
import { use, useState } from "react";

type Stock = NonNullable<ReturnType<typeof useGetStocksQuery>["data"]>[number];
export default function CreateRecipePage({
    params,
}: {
    params: Promise<{ familyId: string }>;
}) {
    const { familyId } = use(params);
    const { data: stocks } = useGetStocksQuery(familyId);
    function handleSubmit(records: { stockId: string; quantity: number }[]) {
        const selected = records.filter((r) => r.quantity > 0);
        console.log(selected);

        apiClient.api.family[":familyId"].recipe.$post({
            param: { familyId },
            json: {
                name: "新しいレシピ",
                description: "新しいレシピの説明",
                items: selected,
            },
        });
    }

    return (
        <div>
            <h1 className="text-2xl">新しいレシピ</h1>
            <p>使用するアイテムとその個数を選択してください。</p>
            <hr className="my-2" />
            <div className="grid grid-cols-1 gap-4">
                <div className="grid grid-cols-1 gap-2">
                    <Label htmlFor="recipeName">レシピ名</Label>
                    <Input
                        id="recipeName"
                        placeholder="例: 我が家のカレーライス"
                    />
                </div>
                <div className="grid grid-cols-1 gap-2">
                    <Label htmlFor="recipeDescription">レシピの説明</Label>
                    <Textarea
                        id="recipeDescription"
                        placeholder={
                            "例: 祖母から受け継いだ、おいしいカレーライスの作り方"
                        }
                    />
                </div>
            </div>
            {stocks ?
                <ItemSelector
                    stocks={stocks.map((s) => ({ ...s, quantity: 0 }))}
                    handleSubmit={handleSubmit}
                />
            :   null}
        </div>
    );
}

function ItemSelector({
    stocks,
    handleSubmit,
}: {
    stocks: Stock[];
    handleSubmit: (records: { stockId: string; quantity: number }[]) => void;
}) {
    const [selectedStocks, setSelectedStocks] = useState(stocks);

    return (
        <>
            {selectedStocks.map((stock) => (
                <RecipeItem
                    key={stock.id}
                    stock={stock}
                    onQuantityChange={(quantity) => {
                        setSelectedStocks((prevStocks) =>
                            prevStocks.map((s) =>
                                s.id === stock.id ? { ...s, quantity } : s,
                            ),
                        );
                    }}
                />
            ))}
            <Button
                onClick={() => {
                    handleSubmit(
                        selectedStocks.map((s) => ({
                            stockId: s.id,
                            quantity: s.quantity,
                        })),
                    );
                }}
            >
                レシピを作成する
            </Button>
        </>
    );
}
function RecipeItem({
    stock,
    onQuantityChange,
}: {
    stock: {
        quantity: number;
        id: string;
        Meta: {
            name: string;
            Tags: {
                id: string;
                name: string;
                color: TagColor;
                description?: string;
            }[];
        };
    };
    onQuantityChange: (quantity: number) => void;
}) {
    return (
        <div
            className={
                "m-2 flex items-center rounded-md border border-slate-200 p-4 shadow-xl dark:border-slate-800"
            }
        >
            <div className="p-2">
                <div className="flex items-center justify-center gap-3">
                    <div>
                        <h2 className="flex-shrink-0 overflow-hidden text-ellipsis text-xl font-bold">
                            {stock.Meta.name}
                        </h2>
                        <div className="flex gap-2">
                            {stock.Meta.Tags.map((tag) => (
                                <Tag key={tag.id} tag={tag} />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
            <div className="flex-grow p-2" />

            <div className="flex flex-shrink-0 items-center">
                <div>
                    <Counter
                        count={stock.quantity}
                        setCount={onQuantityChange}
                    />
                </div>
            </div>
        </div>
    );
}
