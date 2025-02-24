"use client";

import { Family } from "@prisma/client";
import { Plus } from "lucide-react";
import { useState } from "react";

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
import { apiClient } from "@/lib/apiClient";

export default function AddMember({ family }: { family: Family }) {
    const [isOpen, setIsOpen] = useState(false);
    const [link, setLink] = useState<string | undefined>("");

    async function handleCreateInvite() {
        const data = await apiClient.api.family[":familyId"].invite.$post({
            param: {
                familyId: family.id,
            },
        });
        const invite = await data.json();
        setLink(
            new URL("/family/join/" + invite.id, window.location.href).href,
        );
    }
    return (
        <>
            <Dialog
                open={isOpen}
                onOpenChange={(open) => {
                    setIsOpen(open);
                }}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>メンバーを追加する</DialogTitle>
                    </DialogHeader>
                    ファミリーに新しいメンバーを追加します。
                    <Tabs defaultValue="email">
                        <TabsList>
                            <TabsTrigger value="link">招待リンク</TabsTrigger>
                        </TabsList>
                        <TabsContent value="link">
                            招待リンクを共有して、ファミリーに招待しましょう。
                            <Input
                                type="text"
                                placeholder={
                                    typeof window !== "undefined"
                                        ? new URL(
                                              "/family/join/...",
                                              window.location.href,
                                          ).href
                                        : ""
                                }
                                readOnly
                                value={link}
                            />
                            <Button onClick={handleCreateInvite}>
                                招待リンクを生成する
                            </Button>
                        </TabsContent>
                    </Tabs>
                </DialogContent>
            </Dialog>
            <TableCell
                colSpan={4}
                className="cursor-pointer items-center space-x-5"
                onClick={() => {
                    setIsOpen(true);
                }}
            >
                <div className="flex items-center space-x-5">
                    <Plus />
                    メンバーを追加
                </div>
            </TableCell>
        </>
    );
}
