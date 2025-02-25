"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm, UseFormReturn } from "react-hook-form";
import { z } from "zod";

import { StockItemFormSchema } from "@/validations/schemas/StockItemFormSchema";

import FormComponent from "../FomComponents";
import { Button } from "../ui/button";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Textarea } from "../ui/textarea";
import { Checkbox } from "../ui/checkbox";

function BasicOptions({
    form,
}: {
    form: UseFormReturn<z.infer<typeof StockItemFormSchema>>;
}) {
    return (
        <>
            <FormComponent label="アイテム名">
                <Input
                    {...form.register("name")}
                    placeholder="例: インスタントヌードル"
                />
            </FormComponent>
            <FormComponent label="個数">
                <Input
                    {...form.register("quantity", { valueAsNumber: true })}
                    inputMode="numeric"
                />
            </FormComponent>
        </>
    );
}

export default function StockItemBaseForm({
    handleSubmit,
    defaultValues,
    tags,
}: {
    handleSubmit: (data: z.infer<typeof StockItemFormSchema>) => void;
    defaultValues?: z.infer<typeof StockItemFormSchema>;
    tags: { id: string; label: string }[];
}) {
    const form = useForm<z.infer<typeof StockItemFormSchema>>({
        resolver: zodResolver(StockItemFormSchema),
        defaultValues: defaultValues ?? {
            name: "",
            quantity: 1,
        },
    });

    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(handleSubmit)}
                className="flex h-full flex-col space-y-5"
            >
                <Tabs defaultValue="basic" className="flex-grow">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="basic">基本設定</TabsTrigger>
                        <TabsTrigger value="advanced">詳細設定</TabsTrigger>
                    </TabsList>
                    <TabsContent value="basic">
                        <BasicOptions form={form} />
                    </TabsContent>
                    <TabsContent value="advanced">
                        <BasicOptions form={form} />
                        <FormComponent label="説明">
                            <Textarea
                                placeholder="詳細説明や、使う目的など..."
                                rows={5}
                                className="resize-none"
                                {...form.register("description")}
                            />
                        </FormComponent>
                        <FormComponent label="単位">
                            <Input
                                {...form.register("unit")}
                                placeholder="例: 個, mL, mol..."
                            />
                        </FormComponent>
                        <FormComponent label="価格">
                            <Input
                                {...form.register("price", {
                                    valueAsNumber: true,
                                })}
                                type="number"
                            />
                        </FormComponent>
                        <FormComponent label="ステップ">
                            <Input
                                {...form.register("step", {
                                    valueAsNumber: true,
                                })}
                                type="number"
                            />
                        </FormComponent>
                        <FormComponent label="閾値">
                            <Input
                                {...form.register("threshold", {
                                    valueAsNumber: true,
                                })}
                                type="number"
                            />
                        </FormComponent>
                        <FormField
                            control={form.control}
                            name="tags"
                            render={() => (
                                <FormItem>
                                    <div className="mb-4">
                                        <FormLabel className="text-base">
                                            タグ
                                        </FormLabel>
                                    </div>
                                    {tags.map((tag) => (
                                        <FormField
                                            key={tag.id}
                                            control={form.control}
                                            name="tags"
                                            render={({ field }) => {
                                                return (
                                                    <FormItem
                                                        key={tag.id}
                                                        className="flex flex-row items-start space-x-3 space-y-0"
                                                    >
                                                        <FormControl>
                                                            <Checkbox
                                                                checked={field.value?.includes(
                                                                    tag.id,
                                                                )}
                                                                onCheckedChange={(
                                                                    checked,
                                                                ) => {
                                                                    return checked
                                                                        ? field.onChange(
                                                                              [
                                                                                  ...field.value,
                                                                                  tag.id,
                                                                              ],
                                                                          )
                                                                        : field.onChange(
                                                                              field.value?.filter(
                                                                                  (
                                                                                      value,
                                                                                  ) =>
                                                                                      value !==
                                                                                      tag.id,
                                                                              ),
                                                                          );
                                                                }}
                                                            />
                                                        </FormControl>
                                                        <FormLabel className="text-sm font-normal">
                                                            {tag.label}
                                                        </FormLabel>
                                                    </FormItem>
                                                );
                                            }}
                                        />
                                    ))}
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </TabsContent>
                </Tabs>
                <Button type="submit">追加</Button>
            </form>
        </Form>
    );
}
