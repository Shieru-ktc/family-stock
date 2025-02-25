"use client";

import { Button } from "@/components/ui/button";
import CreateNewTagDialog from "./CreateNewTagDialog";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { familyAtom } from "@/atoms/familyAtom";
import { useAtomValue } from "jotai";
import { apiClient } from "@/lib/apiClient";

export default function TagManagePage() {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const family = useAtomValue(familyAtom);
    const queryClient = useQueryClient();

    const { data: tags, isLoading } = useQuery({
        queryKey: ["family", family?.id, "tags"],
        queryFn: async () => {
            const res = await apiClient.api.family[":familyId"].tags.$get({
                param: {
                    familyId: family!.id,
                },
            });
            return await res.json();
        },
    });

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
                <div>
                    {tags.map((tag) => (
                        <div key={tag.id}>
                            <h2>{tag.name}</h2>
                            <p>{tag.description}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
