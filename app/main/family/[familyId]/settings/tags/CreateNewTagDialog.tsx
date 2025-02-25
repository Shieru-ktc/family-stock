"use client";

import TagFormBase, { TagFormSchema } from "@/components/TagFormBase";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { zodResolver } from "@hookform/resolvers/zod";
import { TagColor } from "@prisma/client";
import { DialogDescription } from "@radix-ui/react-dialog";
import { useForm } from "react-hook-form";
import { z } from "zod";

export default function CreateNewTagDialog({
    isOpen,
    onOpenChange,
    handleSubmit,
}: {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    handleSubmit: (tag: {
        name: string;
        description: string | undefined;
        color: TagColor;
    }) => void;
}) {
    const form = useForm<z.infer<typeof TagFormSchema>>({
        resolver: zodResolver(TagFormSchema),
    });
    const onSubmit = (data: z.infer<typeof TagFormSchema>) => {
        handleSubmit({
            name: data.name,
            description: data.description,
            color: data.color,
        });
    };
    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogTitle>新しいタグを作成</DialogTitle>
                <DialogDescription>新しいタグを作成します。</DialogDescription>
                <TagFormBase form={form} onSubmit={onSubmit} />
            </DialogContent>
        </Dialog>
    );
}
