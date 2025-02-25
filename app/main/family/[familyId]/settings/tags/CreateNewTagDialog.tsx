"use client";

import FormComponent from "@/components/FomComponents";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { TagColor } from "@prisma/client";
import { DialogDescription } from "@radix-ui/react-dialog";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

const FormSchema = z.object({
    name: z.string(),
    description: z.string().optional(),
    color: z.nativeEnum(TagColor),
});

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
    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
    });
    const onSubmit = (data: z.infer<typeof FormSchema>) => {
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
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="flex flex-col space-y-5"
                    >
                        <FormComponent label="タグ名">
                            <Input {...form.register("name")} />
                        </FormComponent>
                        <FormComponent label="説明">
                            <Input {...form.register("description")} />
                        </FormComponent>
                        <FormComponent label="色">
                            <Controller
                                control={form.control}
                                name="color"
                                render={({ field }) => (
                                    <Select
                                        onValueChange={field.onChange}
                                        value={field.value}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="色を選択..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {Object.values(TagColor).map(
                                                (color) => (
                                                    <SelectItem
                                                        key={color}
                                                        value={color}
                                                    >
                                                        {color}
                                                    </SelectItem>
                                                ),
                                            )}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                        </FormComponent>
                        <Button type="submit">作成</Button>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
