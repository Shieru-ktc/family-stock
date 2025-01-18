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

import { StockItemWithPartialMeta } from "@/types";

import { MouseEvent } from "react";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

export default function Stock({
  stock,
  onQuantityChange,
  onEdit,
  onDelete,
  onDuplicate,
  onCopy,
}: {
  stock: StockItemWithPartialMeta;
  onQuantityChange: (quantity: number) => void;
  onEdit: (event: MouseEvent) => void;
  onDelete: (event: MouseEvent) => void;
  onDuplicate: (event: MouseEvent) => void;
  onCopy: (event: MouseEvent) => void;
}) {
  return (
    <div className="m-2 flex items-center rounded-md border border-slate-200 p-4 shadow-xl dark:border-slate-800">
      <div className="p-2">
        <h2 className="text-xl font-bold">{stock.Meta.name}</h2>
        <div>{stock.id}</div>
      </div>
      <div className="flex-grow p-2"></div>

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
              <DropdownMenuItem onClick={onDuplicate}>
                <CopyPlus />
                複製
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onDelete}>
                <Trash />
                削除
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onCopy}>
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
