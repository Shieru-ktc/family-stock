"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { useAtom } from "jotai";
import { PackagePlus } from "lucide-react";
import { use, useEffect, useState } from "react";
import { z } from "zod";

import { socketAtom } from "@/atoms/socketAtom";
import Stock from "@/components/Stock";
import StockItemModal from "@/components/StockItemModal";
import { Button } from "@/components/ui/button";
import { SocketEvents } from "@/socket/events";
import { StockItemWithFullMeta, StockItemWithPartialMeta } from "@/types";
import { StockItemFormSchema } from "@/validations/schemas/StockItemFormSchema";

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
  const [socket] = useAtom(socketAtom);
  const [stocks, setStocks] = useState<StockItemWithFullMeta[] | undefined>(
    undefined
  );
  const [open, setOpen] = useState(false);

  const { data, isPending } = useQuery({
    queryKey: ["family", familyId, "stocks"],
    queryFn: async () => {
      const response = await fetch(`/api/family/${familyId}/stocks`);
      return response.json();
    },
  });

  useEffect(() => {
    const unsubscribeCreated = SocketEvents.stockCreated(familyId).listen(
      socket,
      (data) => {
        console.log(data);
        setStocks((prevStocks) => {
          if (prevStocks === undefined) {
            return [data.stock];
          } else {
            return [...prevStocks, data.stock];
          }
        });
      }
    );
    const unsubscribeQuantityChanged = SocketEvents.stockQuantityChanged.listen(
      socket,
      (data) => {
        setStocks((prevStocks) => {
          if (prevStocks === undefined) {
            return [];
          } else {
            return prevStocks.map((stock) => {
              if (stock.id === data.stock.id) {
                return { ...stock, quantity: data.stock.quantity };
              } else {
                return stock;
              }
            });
          }
        });
      }
    );
    const unsubscribeDeleted = SocketEvents.stockDeleted(familyId).listen(
      socket,
      (data) => {
        setStocks((prevStocks) => {
          if (prevStocks === undefined) {
            return [];
          } else {
            return prevStocks.filter((stock) => stock.id !== data.stockId);
          }
        });
      }
    );
    return () => {
      unsubscribeCreated();
      unsubscribeDeleted();
      unsubscribeQuantityChanged();
    };
  }, [socket, familyId]);

  useEffect(() => {
    if (data) {
      setStocks(data.items);
    }
  }, [data]);

  function handleCreateNewStockItem(item: z.infer<typeof StockItemFormSchema>) {
    createNewStockItem.mutate({ item: item });
    setOpen(false);
  }
  return (
    <div>
      <h1 className="text-2xl">在庫リスト</h1>
      <Button onClick={() => { setOpen(true); }}>
        <PackagePlus /> 新しいアイテムを追加
      </Button>
      <StockItemModal
        open={open}
        onOpenChange={(open) => { setOpen(open); }}
        handleSubmit={handleCreateNewStockItem}
      />
      {isPending && <p>読み込み中...</p>}
      {stocks &&
        stocks.map((stock: StockItemWithPartialMeta) => (
          <Stock
            key={stock.id}
            stock={stock}
            socket={socket}
            onQuantityChange={(quantity) => {
              SocketEvents.clientStockQuantityChanged.dispatch(
                {
                  stockId: stock.id,
                  quantity: quantity,
                },
                socket
              );
            }}
          />
        ))}
    </div>
  );
}
