"use client";

import { Family, Invite, User } from "@prisma/client";
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

export default function InviteActionComponent({
    invite,
}: {
    invite: Invite & { CreatedBy: User };
}) {
    const useDeleteInvite = () =>
        useMutation({
            mutationFn: (invite: Invite) => {
                return fetch(
                    `/api/family/${invite.familyId}/invites/${invite.id}`,
                    {
                        method: "DELETE",
                    },
                );
            },
        });
    const deleteInvite = useDeleteInvite();

    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);

    function onViewClick() {
        setIsEditOpen(true);
    }

    function onDeleteClick() {
        setIsDeleteOpen(true);
    }

    const onDelete = () => {
        deleteInvite.mutate(invite, {
            onSuccess: () => {
                setIsDeleteOpen(false);
                getQueryClient().invalidateQueries({
                    queryKey: ["family", invite.familyId, "invites"],
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
                        <DialogTitle>招待リンクの詳細</DialogTitle>
                    </DialogHeader>
                    <DialogDescription>
                        {invite.CreatedBy.name} によって{" "}
                        {invite.createdAt.toLocaleString()} に作成されたリンク
                    </DialogDescription>
                    <div className="grid w-full max-w-sm items-center gap-1.5">
                        <Label htmlFor="inviteId">招待ID</Label>
                        <Input readOnly value={invite.id} id="inviteId" />
                    </div>
                    <div className="grid w-full max-w-sm items-center gap-1.5">
                        <Label htmlFor="createdAt">作成日時</Label>
                        <Input
                            readOnly
                            value={invite.createdAt.toLocaleString()}
                            id="createdAt"
                        />
                    </div>
                    <div className="grid w-full max-w-sm items-center gap-1.5">
                        <Label htmlFor="expiresAt">期限切れになる日時</Label>
                        <Input
                            readOnly
                            value={invite.expiresAt.toLocaleString()}
                            id="expiresAt"
                        />
                        <p className="text-xs text-muted-foreground">
                            期限切れ日時は、リンク作成から一週間です。
                        </p>
                    </div>
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
                        <DialogTitle>招待リンクの削除</DialogTitle>
                    </DialogHeader>
                    <DialogDescription>
                        {invite.CreatedBy.name} によって{" "}
                        {invite.createdAt.toLocaleString()} に作成されたリンク
                    </DialogDescription>
                    <div className="flex flex-col space-y-4">
                        <p>
                            削除された招待リンクは使用できなくなります。
                            <br />
                            本当に削除してもよろしいですか？
                        </p>

                        <div className="flex space-x-4">
                            <Button
                                type="submit"
                                variant="destructive"
                                onClick={onDelete}
                                disabled={deleteInvite.isPending}
                            >
                                {deleteInvite.isPending && (
                                    <Loader2 className="animate-spin" />
                                )}
                                削除
                            </Button>
                            <Button
                                onClick={() => {
                                    setIsDeleteOpen(false);
                                }}
                                variant="outline"
                                disabled={deleteInvite.isPending}
                            >
                                キャンセル
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
            <TableCell className="flex space-x-4">
                <ActionButtons
                    onViewClick={onViewClick}
                    onDeleteClick={onDeleteClick}
                />
            </TableCell>
        </>
    );
}
