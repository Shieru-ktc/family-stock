"use client";

import { Family, Invite, StockItemTag, User } from "@prisma/client";
import { useMutation } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useState } from "react";

import { getQueryClient } from "@/app/get-query-client";
import ActionButtons from "@/components/ActionButtons";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TableCell } from "@/components/ui/table";
import { apiClient } from "@/lib/apiClient";
import TagFormBase, { TagFormSchema } from "@/components/TagFormBase";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

export default function TagActionComponent({ tag }: { tag: StockItemTag }) {
    const useDeleteTag = () =>
        useMutation({
            mutationFn: async (tag: StockItemTag) => {
                return await apiClient.api.family[":familyId"].tag[
                    ":tagId"
                ].$delete({
                    param: {
                        familyId: tag.familyId,
                        tagId: tag.id,
                    },
                });
            },
        });
    const deleteTag = useDeleteTag();

    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);

    const editForm = useForm<z.infer<typeof TagFormSchema>>({
        resolver: zodResolver(TagFormSchema),
        defaultValues: {
            name: tag.name,
            description: tag.description,
            color: tag.color,
        },
    });

    function onEditClick() {
        setIsEditOpen(true);
    }

    function onDeleteClick() {
        setIsDeleteOpen(true);
    }

    const onDelete = () => {
        deleteTag.mutate(tag, {
            onSuccess: () => {
                setIsDeleteOpen(false);
                getQueryClient().invalidateQueries({
                    queryKey: ["family", tag.familyId, "tags"],
                });
            },
        });
    };

    return (
        <>
            <Dialog
                open={isEditOpen}
                onOpenChange={(open) => {
                    setIsEditOpen(open);
                }}
            >
                <DialogContent className="w-full" showCloseButton={true}>
                    <DialogHeader>
                        <DialogTitle>タグの編集</DialogTitle>
                    </DialogHeader>
                    <TagFormBase
                        form={editForm}
                        onSubmit={(data) => {
                            apiClient.api.family[":familyId"].tag[
                                ":tagId"
                            ].$patch({
                                param: {
                                    familyId: tag.familyId,
                                    tagId: tag.id,
                                },
                                json: data,
                            });
                            getQueryClient().invalidateQueries({
                                queryKey: ["family", tag.familyId, "tags"],
                            });
                            setIsEditOpen(false);
                        }}
                    />
                </DialogContent>
            </Dialog>
            <Dialog
                open={isDeleteOpen}
                onOpenChange={(open) => {
                    setIsDeleteOpen(open);
                }}
            >
                <DialogContent className="w-full" showCloseButton={false}>
                    <DialogHeader>
                        <DialogTitle>タグの削除</DialogTitle>
                    </DialogHeader>
                    <div className="flex flex-col space-y-4">
                        <p>
                            タグ "{tag.name}"
                            を削除しようとしています。この操作は取り消すことができません。
                            <br />
                            このタグが適用されている在庫アイテムからは、このタグが削除されます。
                        </p>

                        <div className="flex space-x-4">
                            <Button
                                type="submit"
                                variant="destructive"
                                onClick={onDelete}
                                disabled={deleteTag.isPending}
                            >
                                {deleteTag.isPending && (
                                    <Loader2 className="animate-spin" />
                                )}
                                削除
                            </Button>
                            <Button
                                onClick={() => {
                                    setIsDeleteOpen(false);
                                }}
                                variant="outline"
                                disabled={deleteTag.isPending}
                            >
                                キャンセル
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
            <TableCell className="flex justify-end space-x-4">
                <ActionButtons
                    onEditClick={onEditClick}
                    onDeleteClick={onDeleteClick}
                    disabled={tag.system}
                />
            </TableCell>
        </>
    );
}
