"use client";

import {
  ShoppingPostRequest,
  ShoppingPostResponse,
} from "@/app/api/family/[familyId]/shopping/route";
import { StocksGetResponse } from "@/app/api/family/[familyId]/stocks/route";
import { socketAtom } from "@/atoms/socketAtom";
import StockItemSelector from "@/components/StockItemSelector";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { SocketEvents } from "@/socket/events";
import { StockItemWithPartialMeta } from "@/types";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useAtom } from "jotai";
import { useEffect, useState } from "react";

export default function ShoppingCreatePage({ familyId }: { familyId: string }) {
  const [socket] = useAtom(socketAtom);
  const { toast } = useToast();
  const { data } = useQuery<StocksGetResponse>({
    queryKey: ["family", familyId, "stocks"],
    queryFn: async () => {
      const response = await fetch(`/api/family/${familyId}/stocks`);
      return response.json();
    },
    refetchOnMount: "always",
    refetchOnReconnect: "always",
    refetchOnWindowFocus: "always",
  });
  const useCreateNewShopping = () =>
    useMutation({
      mutationFn: (shopping: ShoppingPostRequest) => {
        const promise = fetch(`/api/family/${familyId}/shopping`, {
          method: "POST",
          body: JSON.stringify(shopping),
          headers: {
            "Content-Type": "application/json",
          },
        });
        promise.then(async (res) => {
          const json: ShoppingPostResponse = await res.json();
          if (!json.success) {
            toast({
              title: "エラー",
              description: `買い物リストの作成中にエラーが発生しました: ${json.error}`,
              color: "error",
            });
          }
        });
        return promise;
      },
    });
  const createNewShopping = useCreateNewShopping();

  const handleCreateShopping = () => {
    if (stocks) {
      createNewShopping.mutate({
        items: stocks
          .filter((v) => v.checked)
          .map((v) => ({ ...v, quantity: 0 })),
      });
    }
  };

  const [stocks, setStocks] = useState<
    (StockItemWithPartialMeta & { checked: boolean })[] | undefined
  >(undefined);

  useEffect(() => {
    const unsubscribeEdited = SocketEvents.stockUpdated(familyId).listen(
      socket,
      (data) => {
        setStocks((prevStocks) => {
          if (prevStocks === undefined) {
            return [];
          } else {
            return prevStocks.map((stock) => {
              if (stock.id === data.stock.id) {
                return { ...data.stock, checked: stock.checked };
              } else {
                return stock;
              }
            });
          }
        });
      },
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
      },
    );
    return () => {
      unsubscribeEdited();
      unsubscribeDeleted();
    };
  }, [socket, familyId]);

  useEffect(() => {
    if (data?.success) {
      setStocks(
        data?.items.map((v) => {
          return { checked: true, ...v };
        }),
      );
    }
  }, [data]);

  return (
    <>
      <div className="mr-2 flex-row items-end justify-between lg:flex">
        <div>
          <h1 className="text-2xl">買い物を開始する</h1>
          <p>家族全員がアクセスできる買い物リストを作成します。</p>
        </div>
        <Button onClick={handleCreateShopping}>買い物リストを作成する</Button>
      </div>

      <hr className="my-2" />
      {stocks && data?.success && (
        <StockItemSelector
          stocks={stocks}
          onCheckedChange={(stock, checked) => {
            setStocks(
              stocks.map((v) =>
                v.id === stock.id ? { ...v, checked: checked === true } : v,
              ),
            );
          }}
        />
      )}
    </>
  );
}
