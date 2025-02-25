"use client";

import FormComponent from "@/components/FomComponents";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { TagColor } from "@prisma/client";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

export const TagFormSchema = z.object({
    name: z.string(),
    description: z.string().optional(),
    color: z.nativeEnum(TagColor),
});

export default function TagFormBase({
    form,
    onSubmit,
}: {
    form: ReturnType<typeof useForm<z.infer<typeof TagFormSchema>>>;
    onSubmit: (data: z.infer<typeof TagFormSchema>) => void;
}) {
    return (
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
                                    {Object.values(TagColor).map((color) => (
                                        <SelectItem key={color} value={color}>
                                            {color}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    />
                </FormComponent>
                <Button type="submit">作成</Button>
            </form>
        </Form>
    );
}
