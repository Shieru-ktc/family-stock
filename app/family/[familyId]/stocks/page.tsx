"use client";

import {
  StocksGetResponse,
  StocksPostResponse,
} from "@/app/api/family/[familyId]/stocks/route";
import Stock from "@/components/Stock";
import { Button } from "@/components/ui/button";
import { StockItemWithPartialMeta } from "@/types";
import { StockItem } from "@prisma/client";
import { useMutation, useQuery } from "@tanstack/react-query";
import { PackagePlus } from "lucide-react";
import { use } from "react";

export default function StocksPage({
  params,
}: {
  params: Promise<{ familyId: string }>;
}) {
  const { familyId } = use(params);
  const useCreateNewStockItem = () =>
    useMutation({
      mutationFn: (stock: { item: { name: string } }) => {
        return fetch(`/api/family/${familyId}/stocks`, {
          method: "POST",
          body: JSON.stringify(stock),
          headers: {
            "Content-Type": "application/json",
          },
        });
      },
    });
  const createNewStockItem = useCreateNewStockItem();

  const { data: stocks, isPending } = useQuery<StocksGetResponse>({
    queryKey: ["family", familyId, "stocks"],
    queryFn: async () => {
      const response = await fetch(`/api/family/${familyId}/stocks`);
      return response.json();
    },
  });
  return (
    <div>
      <h1 className="text-2xl">在庫リスト</h1>
      <Button
        onClick={() => createNewStockItem.mutate({ item: { name: "test" } })}
      >
        <PackagePlus /> 新しいアイテムを追加
      </Button>
      {isPending && <p>読み込み中...</p>}
      {!isPending &&
        stocks?.success &&
        stocks?.items.map((stock: StockItemWithPartialMeta) => (
          <Stock key={stock.id} stock={stock} />
        ))}
    </div>
  );
}
