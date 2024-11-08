"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { TableCell } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Family } from "@prisma/client";
import { Plus, PlusCircle } from "lucide-react";
import { useState } from "react";

export default function AddMember({ family }: { family: Family }) {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [link, setLink] = useState<string | undefined>("");

  function handleCreateInvite() {
    fetch(`/api/family/${family.id}/invites`, {
      method: "POST",
    }).then((res) => {
      res.json().then((data) => {
        setLink(new URL("/family/join/" + data.id, window.location.href).href);
      });
    });
  }
  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => setIsOpen(open)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>メンバーを追加する</DialogTitle>
          </DialogHeader>
          ファミリーに新しいメンバーを追加します。
          <Tabs defaultValue="email">
            <TabsList>
              <TabsTrigger value="email">メールで招待</TabsTrigger>
              <TabsTrigger value="link">招待リンク</TabsTrigger>
            </TabsList>
            <TabsContent value="email">
              招待したい人のメールアドレスを入力してください。
              <Input type="email" placeholder="メールアドレス" />
              <Button>招待する</Button>
            </TabsContent>
            <TabsContent value="link">
              招待リンクを共有して、ファミリーに招待しましょう。
              <Input
                type="text"
                placeholder={
                  typeof window !== "undefined"
                    ? new URL("/family/join/...", window.location.href).href
                    : ""
                }
                readOnly
                value={link}
              />
              <Button onClick={handleCreateInvite}>招待リンクを生成する</Button>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
      <TableCell
        colSpan={4}
        className="items-center space-x-5 cursor-pointer"
        onClick={() => setIsOpen(true)}
      >
        <div className="flex items-center space-x-5">
          <Plus />
          メンバーを追加
        </div>
      </TableCell>
    </>
  );
}
