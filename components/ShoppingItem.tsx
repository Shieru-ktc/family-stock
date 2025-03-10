"use client";

import { Edit2, Menu, Trash } from "lucide-react";

import { MouseEvent } from "react";
import Counter from "./Counter";
import { Button } from "./ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import Tag from "./Tag";
import { TagColor } from "@prisma/client";

export default function ShoppingItem({
    item,
    onQuantityChange,
    onEdit,
    onDelete,
}: {
    item: {
        quantity: number;
        StockItem: {
            Meta: {
                name: string;
                Tags: {
                    id: string;
                    name: string;
                    color: TagColor;
                    description?: string;
                }[];
            };
        };
    };
    onQuantityChange: (quantity: number) => void;
    onEdit: (event: MouseEvent) => void;
    onDelete: (event: MouseEvent) => void;
}) {
    return (
        <div className="m-2 flex items-center rounded-md border border-slate-200 p-4 shadow-xl dark:border-slate-800">
            <div>
                <h2 className="flex-shrink-0 overflow-hidden text-ellipsis text-xl font-bold">
                    {item.StockItem.Meta.name}
                </h2>
                <div className="flex gap-2">
                    {item.StockItem.Meta.Tags.map((tag) => (
                        <Tag key={tag.id} tag={tag} />
                    ))}
                </div>
            </div>
            <div className="flex-grow p-2" />

            <div className="flex flex-shrink-0 items-center">
                <div>
                    <Counter
                        count={item.quantity}
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
                            <DropdownMenuItem onClick={onDelete}>
                                <Trash />
                                削除
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </div>
    );
}
