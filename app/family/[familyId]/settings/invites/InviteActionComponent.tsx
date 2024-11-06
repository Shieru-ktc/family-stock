"use client";

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
import { TableCell } from "@/components/ui/table";
import { Family, Invite, Member, User } from "@prisma/client";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { link } from "fs";
import { FormEvent, useState } from "react";
import { Label } from "@/components/ui/label";
import { DeleteInvite } from "./actions";

export default function InviteActionComponent({
  invite,
}: {
  invite: Invite & { CreatedBy: User; Family: Family & { Members: Member[] } };
}) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  function onViewClick() {
    setIsEditOpen(true);
  }

  function onDeleteClick() {
    setIsDeleteOpen(true);
  }

  const onDelete = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    console.log(invite);
    await DeleteInvite({
      ...invite,
    });
  };

  return (
    <>
      <Dialog open={isEditOpen} onOpenChange={(open) => setIsEditOpen(open)}>
        <DialogContent className="w-full">
          <DialogHeader>
            <DialogTitle>招待リンクの詳細</DialogTitle>
          </DialogHeader>
          <DialogDescription>
            {invite.CreatedBy.name} によって {invite.createdAt.toLocaleString()}{" "}
            に作成されたリンク
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
        onOpenChange={(open) => setIsDeleteOpen(open)}
      >
        <DialogContent className="w-full">
          <DialogHeader>
            <DialogTitle>招待リンクの削除</DialogTitle>
          </DialogHeader>
          <DialogDescription>
            {invite.CreatedBy.name} によって {invite.createdAt.toLocaleString()}{" "}
            に作成されたリンク
          </DialogDescription>
          <div className="flex flex-col space-y-4">
            <p>本当に削除してもよろしいですか？</p>

            <div className="flex space-x-4">
              <form onSubmit={onDelete}>
                <Button type="submit" variant="destructive">
                  削除
                </Button>
              </form>

              <Button onClick={() => setIsDeleteOpen(false)} variant="outline">
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
