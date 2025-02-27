"use client";

import { socketAtom } from "@/atoms/socketAtom";
import { SocketEvents } from "@/socket/events";
import { StockItemWithPartialTagMeta } from "@/types";
import { useAtom } from "jotai";
import { MouseEvent, useMemo } from "react";
import Stock from "./Stock";
import {
    DndContext,
    closestCenter,
    DragEndEvent,
    CollisionDetection,
} from "@dnd-kit/core";
import {
    SortableContext,
    verticalListSortingStrategy,
    arrayMove,
} from "@dnd-kit/sortable";

export default function SortedStocks({
    stocks,
    canDrag,
    onEdit,
    onDelete,
    onDuplicate,
    onCopy,
    handleDragEnd,
}: {
    stocks: StockItemWithPartialTagMeta[];
    canDrag: boolean;
    onEdit: (stock: StockItemWithPartialTagMeta, event: MouseEvent) => void;
    onDelete: (stock: StockItemWithPartialTagMeta, event: MouseEvent) => void;
    onDuplicate: (
        stock: StockItemWithPartialTagMeta,
        event: MouseEvent,
    ) => void;
    onCopy: (stock: StockItemWithPartialTagMeta, event: MouseEvent) => void;
    handleDragEnd: (event: DragEndEvent) => void;
}) {
    const [socket] = useAtom(socketAtom);

    return (
        <DndContext
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
        >
            <SortableContext
                items={stocks}
                strategy={verticalListSortingStrategy}
            >
                <ul className="space-y-2">
                    {stocks.map((stock: StockItemWithPartialTagMeta) => (
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
                            canDrag={canDrag}
                        />
                    ))}
                </ul>
            </SortableContext>
        </DndContext>
    );
}
