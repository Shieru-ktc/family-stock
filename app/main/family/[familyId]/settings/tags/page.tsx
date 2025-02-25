"use client";

import { Button } from "@/components/ui/button";
import CreateNewTagDialog from "./CreateNewTagDialog";
import { use, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { familyAtom } from "@/atoms/familyAtom";
import { useAtomValue } from "jotai";
import { apiClient } from "@/lib/apiClient";
import { useGetTagsQuery } from "@/app/main/queries/Tags";
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import TagActionComponent from "./TagActionComponent";
import Tag from "@/components/Tag";

export default function TagManagePage({
    params,
}: {
    params: Promise<{ familyId: string }>;
}) {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const { familyId } = use(params);
    const family = useAtomValue(familyAtom);
    const queryClient = useQueryClient();
    const { data: tags } = useGetTagsQuery(familyId);

    return (
        <div>
            <h1 className="text-2xl">タグの管理</h1>
            <CreateNewTagDialog
                isOpen={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                handleSubmit={(tag) => {
                    console.log(tag);
                    setIsDialogOpen(false);
                    apiClient.api.family[":familyId"].tag
                        .$post({
                            param: {
                                familyId: family!.id,
                            },
                            json: tag,
                        })
                        .then(async (res) => {
                            // add to tags
                            const createdTag = await res.json();
                            queryClient.setQueryData(
                                ["family", family?.id, "tags"],
                                (oldTags: any) => {
                                    return [...oldTags, createdTag];
                                },
                            );
                        });
                }}
            />
            <p>タグを使用すると、在庫アイテムの分類が簡単になります。</p>
            <Button onClick={() => setIsDialogOpen(true)}>
                新しいタグを作成
            </Button>
            {tags && (
                <Table>
                    <TableCaption>作成されたタグの一覧</TableCaption>
                    <TableHeader>
                        <TableRow>
                            <TableHead>タグ</TableHead>
                            <TableHead className="text-right">
                                アクション
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {tags.map((tag) => (
                            <TableRow key={tag.id}>
                                <TableCell>
                                    <Tag tag={tag} />
                                </TableCell>
                                <TagActionComponent tag={tag} />
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            )}
        </div>
    );
}
