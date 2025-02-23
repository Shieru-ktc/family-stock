"use client";

import { socketAtom } from "@/atoms/socketAtom";
import { SocketEvents } from "@/socket/events";
import { StockItemWithMeta, StockItemWithPartialMeta } from "@/types";
import { useAtom } from "jotai";
import { MouseEvent } from "react";
import Stock from "./Stock";

export default function SortedStocks({
  stocks,
  sortCondition,
  reverse,
  onEdit,
  onDelete,
  onDuplicate,
  onCopy,
}: {
  stocks: StockItemWithPartialMeta[];
  sortCondition: string;
  reverse: boolean;
  onEdit: (stock: StockItemWithPartialMeta, event: MouseEvent) => void;
  onDelete: (stock: StockItemWithPartialMeta, event: MouseEvent) => void;
  onDuplicate: (stock: StockItemWithPartialMeta, event: MouseEvent) => void;
  onCopy: (stock: StockItemWithPartialMeta, event: MouseEvent) => void;
}) {
  const [socket] = useAtom(socketAtom);

  const sortedStocks = stocks.toSorted((a, b) => {
    function sort() {
      switch (sortCondition) {
        case "name":
          return a.Meta.name.localeCompare(b.Meta.name);
        case "id":
        default:
          return a.id.localeCompare(b.id);
      }
    }
    return reverse ? -sort() : sort();
  });

  return sortedStocks.map((stock: StockItemWithPartialMeta) => (
    <Stock
      key={stock.id}
      stock={stock}
      onQuantityChange={(quantity) => {
        SocketEvents.clientStockQuantityChanged.dispatch(
          {
            stockId: stock.id,
            quantity: quantity,
          },
          socket,
        );
      }}
      onEdit={(event) => onEdit(stock, event)}
      onDelete={(event) => onDelete(stock, event)}
      onDuplicate={(event) => onDuplicate(stock, event)}
      onCopy={(event) => onCopy(stock, event)}
    />
  ));
}
