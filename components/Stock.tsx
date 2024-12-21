"use client";

import {
  ChevronLeft,
  ChevronRight,
  ClipboardCopy,
  CopyPlus,
  Edit2,
  Menu,
  Trash,
} from "lucide-react";
import { Socket } from "socket.io-client";

import { StockItemWithPartialMeta } from "@/types";

import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

export default function Stock({
  stock,
  socket,
  onQuantityChange,
  onEdit,
  onDelete,
}: {
  stock: StockItemWithPartialMeta;
  socket: Socket;
  onQuantityChange: (quantity: number) => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="flex p-4 shadow-xl rounded-md border-slate-200 dark:border-slate-800 border m-2 items-center">
      <div className="p-2">
        <h2 className="text-xl font-bold">{stock.Meta.name}</h2>
        <div>{stock.id}</div>
      </div>
      <div className="p-2 flex-grow"></div>

      <div className="flex items-center">
        <div>
          <Button
            variant="ghost"
            onClick={() => {
              onQuantityChange(stock.quantity - 1);
            }}
          >
            <ChevronLeft />
          </Button>
          <span className="text-3xl">{stock.quantity}</span>
          <Button
            variant="ghost"
            onClick={() => {
              onQuantityChange(stock.quantity + 1);
            }}
          >
            <ChevronRight />
          </Button>
        </div>
        <div>
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side={"left"} sideOffset={5}>
              <DropdownMenuItem onClick={onEdit}>
                <Edit2 />
                編集
              </DropdownMenuItem>
              <DropdownMenuItem>
                <CopyPlus />
                複製
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onDelete}>
                <Trash />
                削除
              </DropdownMenuItem>
              <DropdownMenuItem>
                <ClipboardCopy />
                コピー
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
