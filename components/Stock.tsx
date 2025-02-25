"use client";

import { ClipboardCopy, CopyPlus, Edit2, Menu, Trash } from "lucide-react";

import { StockItemWithPartialMeta, StockItemWithPartialTagMeta } from "@/types";

import { MouseEvent } from "react";
import Counter from "./Counter";
import { Button } from "./ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { StockItemTag } from "@prisma/client";
import Chip from "./ui/chip";
import { cn, tagColorToCn } from "@/lib/utils";
import Tag from "./Tag";

export default function Stock({
    stock,
    onQuantityChange,
    onEdit,
    onDelete,
    onDuplicate,
    onCopy,
}: {
    stock: StockItemWithPartialTagMeta;
    onQuantityChange: (quantity: number) => void;
    onEdit: (event: MouseEvent) => void;
    onDelete: (event: MouseEvent) => void;
    onDuplicate: (event: MouseEvent) => void;
    onCopy: (event: MouseEvent) => void;
}) {
    return (
        <div className="m-2 flex items-center rounded-md border border-slate-200 p-4 shadow-xl dark:border-slate-800">
            <div className="p-2">
                <h2 className="flex-shrink-0 overflow-hidden text-ellipsis text-xl font-bold">
                    {stock.Meta.name}
                </h2>
                <div className="flex gap-2">
                    {stock.Meta.Tags.map((tag: StockItemTag) => (
                        <Tag key={tag.id} tag={tag} />
                    ))}
                </div>
            </div>
            <div className="flex-grow p-2" />

            <div className="flex flex-shrink-0 items-center">
                <div>
                    <Counter
                        count={stock.quantity}
                        setCount={onQuantityChange}
                    />
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
