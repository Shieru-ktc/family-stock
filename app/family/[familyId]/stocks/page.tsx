"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { useAtom } from "jotai";
import { PackagePlus } from "lucide-react";
import { use, useEffect, useState } from "react";
import { z } from "zod";

import { StocksPostRequest } from "@/app/api/family/[familyId]/stocks/route";
import { familyAtom } from "@/atoms/familyAtom";
import { socketAtom } from "@/atoms/socketAtom";
import SortedStocks from "@/components/SortedStocks";
import StockItemCreateModal from "@/components/StockItemCreateModal";
import StockItemEditModal from "@/components/StockItemEditModal";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { SocketEvents } from "@/socket/events";
import { StockItemWithFullMeta } from "@/types";
import { StockItemFormSchema } from "@/validations/schemas/StockItemFormSchema";

export default function StocksPage({
  params,
}: {
  params: Promise<{ familyId: string }>;
}) {
  const familyId = use(params).familyId;
  const [socket] = useAtom(socketAtom);
  const [family] = useAtom(familyAtom);
  const { toast } = useToast();

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

  const [stocks, setStocks] = useState<StockItemWithFullMeta[] | undefined>(
    undefined
  );
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editStock, setEditStock] = useState<StockItemWithFullMeta | undefined>(
    undefined
  );
  const [sortCondition, setSortCondition] = useState("id");
  const [sortReverse, setSortReverse] = useState(false);
  const [createFormDefaultValues, setCreateFormDefaultValues] = useState<z.infer<typeof StockItemFormSchema> | undefined>(undefined);

  const { data, isPending } = useQuery({
    queryKey: ["family", familyId, "stocks"],
    queryFn: async () => {
      const response = await fetch(`/api/family/${familyId}/stocks`);
      return response.json();
    },
    refetchOnMount: "always",
    refetchOnReconnect: "always",
    refetchOnWindowFocus: "always",
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
          setCreateFormDefaultValues(undefined);
        }}
        handleSubmit={handleCreateNewStockItem}
        defaultValues={createFormDefaultValues}
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
      <div>
        <Label htmlFor="orderByTrigger">以下で並び替え:</Label>
        <Select value={sortCondition} onValueChange={(value) => setSortCondition(value)}>
          <SelectTrigger className="w-[180px]" id="orderByTrigger">
            <SelectValue placeholder="並び替え条件を選択..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="id">ID</SelectItem>
            <SelectItem value="name">名前</SelectItem>
          </SelectContent>
        </Select>


        <div className="items-top flex space-x-2 my-2">
          <Checkbox id="reverseOrder" checked={sortReverse} onCheckedChange={checked => setSortReverse(checked === true)} />
          <div className="grid gap-1.5 leading-none">
            <label
              htmlFor="reverseOrder"
              className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              降順で並び替え
            </label>
          </div>
        </div>
      </div>

      {isPending && <p>読み込み中...</p>}
      {stocks && <SortedStocks stocks={stocks} sortCondition={sortCondition} reverse={sortReverse}
        onEdit={(stock) => {
          setEditStock(stock);
          setEditOpen(true);
        }}
        onDelete={(stock) => {
          SocketEvents.clientStockDeleted.dispatch(
            { stockId: stock.id },
            socket
          );
        }}
        onDuplicate={(stock, event) => {
          if (event.shiftKey) {
            handleCreateNewStockItem({
              name: stock.Meta.name,
              description: stock.Meta.description,
              unit: stock.Meta.unit,
              price: stock.Meta.price,
              quantity: stock.quantity,
              step: stock.Meta.step,
              threshold: stock.Meta.threshold,
            });
          } else {
            setCreateFormDefaultValues({
              name: stock.Meta.name,
              description: stock.Meta.description,
              unit: stock.Meta.unit,
              price: stock.Meta.price,
              quantity: stock.quantity,
              step: stock.Meta.step,
              threshold: stock.Meta.threshold,
            });
            setOpen(true);
          }
        }}
        onCopy={(stock, event) => {
          const isShiftPressed = event.shiftKey;
          const isCtrlPressed = event.ctrlKey;
          const isShiftCtrl = isShiftPressed && isCtrlPressed;

          const copy = async () => {
            if (isShiftCtrl) {
              await navigator.clipboard.writeText(`${stock.familyId} stock-${stock.id} meta-${stock.metaId}`)
              return "詳細ID"
            } else if (isShiftPressed) {
              await navigator.clipboard.writeText(`${stock.Meta.name}: ${stock.quantity}${stock.Meta.unit}`)
              return "詳細情報"
            } else if (isCtrlPressed) {
              await navigator.clipboard.writeText(stock.id)
              return "在庫ID"
            } else {
              await navigator.clipboard.writeText(stock.Meta.name)
              return "在庫名"
            }
          }

          copy().then((message) => {
            toast({
              title: `クリップボードにコピー`,
              description: `${message}をクリップボードにコピーしました`,
            });
          })

        }}
      />}
    </div>
  );
}
