"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAtom } from "jotai";
import { PackagePlus } from "lucide-react";
import { use, useEffect, useState } from "react";
import { z } from "zod";

import { socketAtom } from "@/atoms/socketAtom";
import SortedStocks from "@/components/SortedStocks";
import StockItemCreateModal from "@/components/StockItemCreateModal";
import StockItemEditModal from "@/components/StockItemEditModal";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { SocketEvents } from "@/socket/events";
import { StockItemWithFullMeta, StockItemWithPartialTagMeta } from "@/types";
import { StockItemFormSchema } from "@/validations/schemas/StockItemFormSchema";
import { apiClient } from "@/lib/apiClient";
import { InferRequestType } from "hono";
import { useGetStocksQuery } from "@/app/main/queries/Stocks";
import Loading from "@/components/Loading";
import { useGetTagsQuery } from "@/app/main/queries/Tags";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { DragEndEvent } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";

type StockPostRequest = InferRequestType<
    (typeof apiClient.api.family)[":familyId"]["stock"]["$post"]
>["json"];

export default function StocksPage({
    params,
}: {
    params: Promise<{ familyId: string }>;
}) {
    const familyId = use(params).familyId;
    const [socket] = useAtom(socketAtom);
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const tags = useGetTagsQuery(familyId);
    const [filteredTags, setFilteredTags] = useState<string[]>([]);

    const useCreateNewStockItem = () =>
        useMutation({
            mutationFn: async (stock: StockPostRequest) => {
                const res = await apiClient.api.family[":familyId"].stock.$post(
                    {
                        param: { familyId },
                        json: {
                            name: stock.name,
                            description: stock.description,
                            unit: stock.unit,
                            quantity: stock.quantity,
                            price: stock.price,
                            step: stock.step,
                            threshold: stock.threshold,
                            tags: stock.tags,
                        },
                    },
                );
                return await res.json();
            },
        });
    const useEditStockItem = () =>
        useMutation({
            mutationFn: async (
                stock: { item: { id: string } } & StockPostRequest,
            ) => {
                return await apiClient.api.family[":familyId"].stocks[
                    ":stockId"
                ].$patch({
                    param: {
                        familyId,
                        stockId: stock.item.id,
                    },
                    json: {
                        name: stock.name,
                        description: stock.description,
                        unit: stock.unit,
                        quantity: stock.quantity,
                        price: stock.price,
                        step: stock.step,
                        threshold: stock.threshold,
                        tags: stock.tags,
                    },
                });
            },
        });
    const createNewStockItem = useCreateNewStockItem();
    const editItem = useEditStockItem();

    const [open, setOpen] = useState(false);
    const [editOpen, setEditOpen] = useState(false);
    const [editStock, setEditStock] = useState<
        StockItemWithPartialTagMeta | undefined
    >(undefined);
    const [sortCondition, setSortCondition] = useState("custom");
    const [sortReverse, setSortReverse] = useState(false);
    const [createFormDefaultValues, setCreateFormDefaultValues] = useState<
        z.infer<typeof StockItemFormSchema> | undefined
    >(undefined);
    const { data: stocks, isPending } = useGetStocksQuery(familyId);

    useEffect(() => {
        const unsubscribeCreated = SocketEvents.stockCreated(familyId).listen(
            socket,
            (data) => {
                queryClient.setQueryData<StockItemWithFullMeta[]>(
                    ["family", familyId, "stocks"],
                    (prevStocks) =>
                        prevStocks ? [...prevStocks, data.stock] : [data.stock],
                );
            },
        );
        const unsubscribeQuantityChanged =
            SocketEvents.stockQuantityChanged.listen(socket, (data) => {
                queryClient.setQueryData<StockItemWithFullMeta[]>(
                    ["family", familyId, "stocks"],
                    (prevStocks) =>
                        prevStocks?.map((stock) =>
                            stock.id === data.stock.id
                                ? { ...stock, quantity: data.stock.quantity }
                                : stock,
                        ) ?? [],
                );
            });

        const unsubscribeEdited = SocketEvents.stockUpdated(familyId).listen(
            socket,
            (data) => {
                queryClient.setQueryData<StockItemWithFullMeta[]>(
                    ["family", familyId, "stocks"],
                    (prevStocks) =>
                        prevStocks?.map((stock) =>
                            stock.id === data.stock.id ? data.stock : stock,
                        ) ?? [],
                );
            },
        );

        const unsubscribeDeleted = SocketEvents.stockDeleted(familyId).listen(
            socket,
            (data) => {
                queryClient.setQueryData<StockItemWithFullMeta[]>(
                    ["family", familyId, "stocks"],
                    (prevStocks) =>
                        prevStocks?.filter(
                            (stock) => stock.id !== data.stockId,
                        ) ?? [],
                );
            },
        );

        const unsubscribePositionChanged = SocketEvents.stockPositionChanged(
            familyId,
        ).listen(socket, (data) => {
            queryClient.setQueryData<StockItemWithFullMeta[]>(
                ["family", familyId, "stocks"],
                (prevStocks) =>
                    prevStocks?.map((stock) =>
                        stock.id === data.stockId
                            ? {
                                  ...stock,
                                  Meta: {
                                      ...stock.Meta,
                                      position: data.position,
                                  },
                              }
                            : stock,
                    ) ?? [],
            );
        });
        return () => {
            unsubscribeCreated();
            unsubscribeEdited();
            unsubscribeDeleted();
            unsubscribeQuantityChanged();
            unsubscribePositionChanged();
        };
    }, [socket, familyId]);

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;
        if (!stocks) return;

        const oldIndex = stocks.findIndex((stock) => stock.id === active.id);
        const newIndex = stocks.findIndex((stock) => stock.id === over.id);
        const newStocks = arrayMove(stocks, oldIndex, newIndex);

        const item = newStocks[newIndex];
        const backItem = newIndex > 0 ? newStocks[newIndex - 1] : null;
        const frontItem =
            newIndex < newStocks.length - 1 ? newStocks[newIndex + 1] : null;
        console.log(backItem?.Meta.name, frontItem?.Meta.name);

        // 楽観的に「並び替えられた」と仮定する
        queryClient.setQueryData<StockItemWithFullMeta[]>(
            ["family", familyId, "stocks"],
            (prevStocks) =>
                prevStocks?.map((stock) =>
                    stock.id === item.id
                        ? {
                              ...stock,
                              Meta: {
                                  ...stock.Meta,
                                  position: backItem
                                      ? backItem.Meta.position + "z"
                                      : (frontItem?.Meta!.position!.slice(
                                            0,
                                            -2,
                                        ) ?? "0"),
                              },
                          }
                        : stock,
                ) ?? [],
        );

        SocketEvents.clientStockPositionChanged.dispatch(
            {
                stockId: item.id,
                backItemId: backItem?.id,
                frontItemId: frontItem?.id,
            },
            socket,
        );
    };

    function handleCreateNewStockItem(
        item: z.infer<typeof StockItemFormSchema>,
    ) {
        createNewStockItem.mutate({ ...item });
        setOpen(false);
    }

    function handleEditStockItem(item: z.infer<typeof StockItemFormSchema>) {
        editItem.mutate({
            item: { id: editStock!.id },
            ...item,
        });
        setEditOpen(false);
        setEditStock(undefined);
    }

    return (
        <div>
            <h1 className="text-2xl">在庫リスト</h1>
            <Button
                onClick={() => {
                    setOpen(true);
                }}
            >
                <PackagePlus /> 新しいアイテムを追加
            </Button>

            <StockItemCreateModal
                open={open}
                onOpenChange={(open) => {
                    setOpen(open);
                    setCreateFormDefaultValues(undefined);
                }}
                handleSubmit={handleCreateNewStockItem}
                defaultValues={createFormDefaultValues}
                tags={
                    tags.data?.map((tag) => ({
                        label: tag.name,
                        id: tag.id,
                    })) ?? []
                }
            />
            {editStock && (
                <StockItemEditModal
                    open={editOpen}
                    onOpenChange={(open) => {
                        setEditOpen(open);
                    }}
                    stock={editStock!}
                    handleSubmit={handleEditStockItem}
                    tags={
                        tags.data?.map((tag) => ({
                            label: tag.name,
                            id: tag.id,
                        })) ?? []
                    }
                />
            )}
            <div>
                <div className="items-top my-2 flex space-x-2">
                    <Label htmlFor="orderByTrigger">以下で並び替え:</Label>
                    <Select
                        value={sortCondition}
                        onValueChange={(value) => setSortCondition(value)}
                    >
                        <SelectTrigger
                            className="w-[180px]"
                            id="orderByTrigger"
                        >
                            <SelectValue placeholder="並び替え条件を選択..." />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="custom">ユーザー定義</SelectItem>
                            <SelectItem value="id">ID</SelectItem>
                            <SelectItem value="name">名前</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="items-top my-2 flex space-x-2">
                    <Checkbox
                        id="reverseOrder"
                        checked={sortReverse}
                        onCheckedChange={(checked) =>
                            setSortReverse(checked === true)
                        }
                    />
                    <div className="grid gap-1.5">
                        <Label htmlFor="reverseOrder">降順で並び替え</Label>
                    </div>
                </div>

                <Accordion type="single" collapsible>
                    <AccordionItem value="tagFilter">
                        <AccordionTrigger>
                            タグでフィルタリング
                        </AccordionTrigger>
                        <AccordionContent>
                            {tags.data?.map((tag) => (
                                <div
                                    key={tag.id}
                                    className="items-top my-2 flex space-x-2"
                                >
                                    <Checkbox
                                        checked={filteredTags.includes(tag.id)}
                                        onCheckedChange={(checked) => {
                                            setFilteredTags((prev) =>
                                                checked
                                                    ? [...prev, tag.id]
                                                    : prev.filter(
                                                          (t) => t !== tag.id,
                                                      ),
                                            );
                                        }}
                                        id={`tag-${tag.id}`}
                                    />
                                    <div className="grid gap-1.5">
                                        <Label htmlFor={`tag-${tag.id}`}>
                                            {tag.name}
                                        </Label>
                                    </div>
                                </div>
                            ))}
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </div>

            {isPending && <Loading />}
            {stocks && (
                <SortedStocks
                    stocks={(filteredTags.length === 0
                        ? stocks
                        : stocks.filter((stock) =>
                              filteredTags.every((tag) =>
                                  stock.Meta.Tags.some(
                                      (stockTag) => stockTag.id === tag,
                                  ),
                              ),
                          )
                    ).sort((a, b) => {
                        function sort() {
                            switch (sortCondition) {
                                case "name":
                                    return a.Meta!.name!.localeCompare(
                                        b.Meta!.name!,
                                    );
                                case "id":
                                    return a.id.localeCompare(b.id);
                                case "custom":
                                default:
                                    return a.Meta!.position!.localeCompare(
                                        b.Meta!.position!,
                                    );
                            }
                        }
                        return sortReverse ? -sort() : sort();
                    })}
                    canDrag={
                        sortCondition === "custom" &&
                        !sortReverse &&
                        filteredTags.length === 0
                    }
                    onEdit={(stock) => {
                        setEditStock(stock);
                        setEditOpen(true);
                    }}
                    onDelete={(stock) => {
                        SocketEvents.clientStockDeleted.dispatch(
                            { stockId: stock.id },
                            socket,
                        );
                    }}
                    onDuplicate={(stock, event) => {
                        if (event.shiftKey) {
                            handleCreateNewStockItem({
                                name: stock.Meta.name,
                                description: stock.Meta.description,
                                unit: stock.Meta.unit,
                                price: stock.Meta.price,
                                quantity: stock.quantity,
                                step: stock.Meta.step,
                                threshold: stock.Meta.threshold,
                                tags: stock.Meta.Tags.map((tag) => tag.id),
                            });
                        } else {
                            setCreateFormDefaultValues({
                                name: stock.Meta.name,
                                description: stock.Meta.description,
                                unit: stock.Meta.unit,
                                price: stock.Meta.price,
                                quantity: stock.quantity,
                                step: stock.Meta.step,
                                threshold: stock.Meta.threshold,
                                tags: stock.Meta.Tags.map((tag) => tag.id),
                            });
                            setOpen(true);
                        }
                    }}
                    onCopy={(stock, event) => {
                        const isShiftPressed = event.shiftKey;
                        const isCtrlPressed = event.ctrlKey;
                        const isShiftCtrl = isShiftPressed && isCtrlPressed;

                        const copy = async () => {
                            if (isShiftCtrl) {
                                await navigator.clipboard.writeText(
                                    `${stock.familyId} stock-${stock.id} meta-${stock.Meta.id}`,
                                );
                                return "詳細ID";
                            } else if (isShiftPressed) {
                                await navigator.clipboard.writeText(
                                    `${stock.Meta.name}: ${stock.quantity}${stock.Meta.unit}`,
                                );
                                return "詳細情報";
                            } else if (isCtrlPressed) {
                                await navigator.clipboard.writeText(stock.id);
                                return "在庫ID";
                            } else {
                                await navigator.clipboard.writeText(
                                    stock.Meta.name,
                                );
                                return "在庫名";
                            }
                        };

                        copy().then((message) => {
                            toast({
                                title: `クリップボードにコピー`,
                                description: `${message}をクリップボードにコピーしました`,
                            });
                        });
                    }}
                    handleDragEnd={handleDragEnd}
                />
            )}
        </div>
    );
}
