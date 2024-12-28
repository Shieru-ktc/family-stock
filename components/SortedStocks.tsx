"use client";

import { socketAtom } from "@/atoms/socketAtom";
import { SocketEvents } from "@/socket/events";
import { StockItemWithFullMeta } from "@/types";
import { useAtom } from "jotai";
import Stock from "./Stock";

export default function SortedStocks(
  { stocks, sortCondition, reverse, onEdit, onDelete, }:
    { stocks: StockItemWithFullMeta[], sortCondition: string, reverse: boolean, onEdit: (stock: StockItemWithFullMeta) => void, onDelete: (stock: StockItemWithFullMeta) => void }
) {
  const [socket] = useAtom(socketAtom);

  const sortedStocks = stocks.sort((a, b) => {
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
  })

  return sortedStocks.map((stock: StockItemWithFullMeta) => (
    <Stock
      key={stock.id}
      stock={stock}
      onQuantityChange={(quantity) => {
        SocketEvents.clientStockQuantityChanged.dispatch(
          {
            stockId: stock.id,
            quantity: quantity,
          },
          socket
        );
      }}
      onEdit={() => onEdit(stock)}
      onDelete={() => onDelete(stock)}
    />
  ))

}