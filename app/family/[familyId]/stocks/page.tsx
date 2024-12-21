"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { useAtom } from "jotai";
import { PackagePlus } from "lucide-react";
import { use, useEffect, useState } from "react";
import { z } from "zod";

import { StocksPostRequest } from "@/app/api/family/[familyId]/stocks/route";
import { socketAtom } from "@/atoms/socketAtom";
import Stock from "@/components/Stock";
import StockItemCreateModal from "@/components/StockItemCreateModal";
import StockItemEditModal from "@/components/StockItemEditModal";
import { Button } from "@/components/ui/button";
import { SocketEvents } from "@/socket/events";
import { StockItemWithFullMeta } from "@/types";
import { StockItemFormSchema } from "@/validations/schemas/StockItemFormSchema";

export default function StocksPage({
  params,
}: {
  params: Promise<{ familyId: string }>;
}) {
  const { familyId } = use(params);
  const useCreateNewStockItem = () =>
    useMutation({
      mutationFn: (stock: StocksPostRequest) => {
        return fetch(`/api/family/${familyId}/stocks`, {
          method: "POST",
          body: JSON.stringify(stock),
          headers: {
            "Content-Type": "application/json",
          },
        });
      },
    });
  const useEditStockItem = () =>
    useMutation({
      mutationFn: (stock: { item: { id: string } } & StocksPostRequest) => {
        return fetch(`/api/family/${familyId}/stocks`, {
          method: "PATCH",
          body: JSON.stringify(stock),
          headers: {
            "Content-Type": "application/json",
          },
        });
      },
    });
  const createNewStockItem = useCreateNewStockItem();
  const editItem = useEditStockItem();
  const [socket] = useAtom(socketAtom);
  const [stocks, setStocks] = useState<StockItemWithFullMeta[] | undefined>(
    undefined
  );
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editStock, setEditStock] = useState<StockItemWithFullMeta | undefined>(
    undefined
  );

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
    const unsubscribeEdited = SocketEvents.stockUpdated(familyId).listen(
      socket,
      (data) => {
        setStocks((prevStocks) => {
          if (prevStocks === undefined) {
            return [];
          } else {
            return prevStocks.map((stock) => {
              if (stock.id === data.stock.id) {
                return data.stock;
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
      unsubscribeEdited();
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

  function handleEditStockItem(item: z.infer<typeof StockItemFormSchema>) {
    editItem.mutate({
      item: {
        ...item,
        id: editStock?.id!,
      },
    });
    setEditOpen(false);
    setEditStock(undefined);
  }

  return (
    <div>
      <h1 className="text-2xl">在庫リスト</h1>
      <Button
        onClick={() => {
          setOpen(true);
        }}
      >
        <PackagePlus /> 新しいアイテムを追加
      </Button>
      <StockItemCreateModal
        open={open}
        onOpenChange={(open) => {
          setOpen(open);
        }}
        handleSubmit={handleCreateNewStockItem}
      />
      {editStock && (
        <StockItemEditModal
          open={editOpen}
          onOpenChange={(open) => {
            setEditOpen(open);
          }}
          stock={editStock!}
          handleSubmit={handleEditStockItem}
        />
      )}

      {isPending && <p>読み込み中...</p>}
      {stocks &&
        stocks.map((stock: StockItemWithFullMeta) => (
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
            onEdit={() => {
              setEditStock(stock);
              setEditOpen(true);
            }}
            onDelete={() => {
              SocketEvents.clientStockDeleted.dispatch(
                {
                  stockId: stock.id,
                },
                socket
              );
            }}
          />
        ))}
    </div>
  );
}
