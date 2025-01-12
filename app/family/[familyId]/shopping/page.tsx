"use client"

import { StocksGetResponse } from "@/app/api/family/[familyId]/stocks/route";
import { socketAtom } from "@/atoms/socketAtom";
import StockItemSelector from "@/components/StockItemSelector";
import { SocketEvents } from "@/socket/events";
import { StockItemWithPartialMeta } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { useAtom } from "jotai";
import { use, useEffect, useState } from "react";

export default function ShoppingPage({ params }: { params: Promise<{ familyId: string }> }) {
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
  const [stocks, setStocks] = useState<(StockItemWithPartialMeta & { checked: boolean })[] | undefined>(undefined);

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
      unsubscribeEdited();
      unsubscribeDeleted();
    }
  }, [socket, familyId])

  useEffect(() => {
    if (data?.success) {
      setStocks(data?.items.map(v => { return { checked: true, ...v } }));
    }
  }, [data])

  return <>
    <h1 className="text-2xl">買い物を開始する</h1>
    <p>家族全員がアクセスできる買い物リストを作成します。</p>

    <hr className="my-2" />
    {(stocks && data?.success) && <StockItemSelector stocks={stocks} onCheckedChange={(stock, checked) => {
      setStocks(stocks.map(v => v.id === stock.id ? { ...v, checked: checked === true } : v));
    }} />}
  </>
}
