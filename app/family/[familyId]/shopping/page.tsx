"use client";

import {
  ShoppingGetResponse,
  ShoppingPostRequest,
} from "@/app/api/family/[familyId]/shopping/route";
import { StocksGetResponse } from "@/app/api/family/[familyId]/stocks/route";
import { socketAtom } from "@/atoms/socketAtom";
import StockItemSelector from "@/components/StockItemSelector";
import { Button } from "@/components/ui/button";
import { SocketEvents } from "@/socket/events";
import { StockItemWithPartialMeta } from "@/types";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useAtom } from "jotai";
import { use, useEffect, useState } from "react";

export default function ShoppingPage({
  params,
}: {
  params: Promise<{ familyId: string }>;
}) {
  const familyId = use(params).familyId;
  const [socket] = useAtom(socketAtom);
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
  const { data: ongoingShopping } = useQuery<ShoppingGetResponse>({
    queryKey: ["family", familyId, "shopping"],
    queryFn: async () => {
      const response = await fetch(`/api/family/${familyId}/shopping`);
      return response.json();
    },
    refetchOnMount: "always",
    refetchOnReconnect: "always",
    refetchOnWindowFocus: "always",
  });
  const useCreateNewShopping = () =>
    useMutation({
      mutationFn: (shopping: ShoppingPostRequest) => {
        return fetch(`/api/family/${familyId}/shopping`, {
          method: "POST",
          body: JSON.stringify(shopping),
          headers: {
            "Content-Type": "application/json",
          },
        });
      },
    });
  const createNewShopping = useCreateNewShopping();

  const handleCreateShopping = () => {
    if (stocks) {
      createNewShopping.mutate({
        items: stocks.filter((v) => v.checked),
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
      {ongoingShopping?.success &&
        ongoingShopping.shopping?.Items.map((item) => {
          return <div key={item.id}>{item.StockItem.Meta.name}</div>;
        })}
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
