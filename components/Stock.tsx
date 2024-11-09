"use client";

import { StockItemWithPartialMeta } from "@/types";
import { Button } from "./ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Socket } from "socket.io-client";
import { SocketEvents } from "@/socket/events";

export default function Stock({
  stock,
  socket,
  onQuantityChange,
}: {
  stock: StockItemWithPartialMeta;
  socket: Socket;
  onQuantityChange: (quantity: number) => void;
}) {
  return (
    <div className="flex p-4 shadow-xl rounded-md border-slate-200 border m-2 items-center">
      <div className="p-2">
        <h2 className="text-xl font-bold">{stock.Meta.name}</h2>
        <div>{stock.id}</div>
      </div>
      <div className="p-2 flex-grow"></div>

      <div className="flex items-center">
        <Button
          variant="ghost"
          onClick={() => onQuantityChange(stock.quantity - 1)}
        >
          <ChevronLeft />
        </Button>
        <span className="text-3xl">{stock.quantity}</span>
        <Button
          variant="ghost"
          onClick={() => onQuantityChange(stock.quantity + 1)}
        >
          <ChevronRight />
        </Button>
      </div>
    </div>
  );
}
