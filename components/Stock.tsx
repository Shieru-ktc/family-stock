"use client";

import {
    ClipboardCopy,
    CopyPlus,
    Edit2,
    GripVertical,
    Menu,
    Trash,
} from "lucide-react";

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
import { StockItemTag, TagColor } from "@prisma/client";
import Chip from "./ui/chip";
import { cn, tagColorToCn } from "@/lib/utils";
import Tag from "./Tag";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "./ui/tooltip";

export default function Stock({
    stock,
    canDrag,
    onQuantityChange,
    onEdit,
    onDelete,
    onDuplicate,
    onCopy,
}: {
    stock: {
        quantity: number;
        id: string;
        Meta: {
            name: string;
            Tags: {
                id: string;
                name: string;
                color: TagColor;
                description?: string;
            }[];
            position: string;
        };
    };
    canDrag: boolean;
    onQuantityChange: (quantity: number) => void;
    onEdit: (event: MouseEvent) => void;
    onDelete: (event: MouseEvent) => void;
    onDuplicate: (event: MouseEvent) => void;
    onCopy: (event: MouseEvent) => void;
}) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: stock.id });
    const style = {
        transform: CSS.Translate.toString(transform),
        transition,
    };
    return (
        <div
            className={cn(
                "m-2 flex items-center rounded-md border border-slate-200 p-4 shadow-xl dark:border-slate-800",
                isDragging ? "border-4 border-dotted" : "",
            )}
            ref={setNodeRef}
            style={style}
        >
            <div className="p-2">
                <div className="flex items-center justify-center gap-3">
                    {canDrag ? (
                        <div
                            {...listeners}
                            {...attributes}
                            className="inline-flex"
                        >
                            <GripVertical />
                        </div>
                    ) : (
                        <div className="inline-flex">
                            <TooltipProvider delayDuration={100}>
                                <Tooltip>
                                    <TooltipTrigger>
                                        <GripVertical className="text-gray-300 dark:text-gray-700" />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>この設定では並び替えできません。</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                    )}
                    <div>
                        <h2 className="flex-shrink-0 overflow-hidden text-ellipsis text-xl font-bold">
                            {stock.Meta.name}
                        </h2>
                        <div className="flex gap-2">
                            {stock.Meta.Tags.map((tag) => (
                                <Tag key={tag.id} tag={tag} />
                            ))}
                        </div>
                    </div>
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
