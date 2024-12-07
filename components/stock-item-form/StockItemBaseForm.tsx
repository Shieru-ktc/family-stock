"use client";

import { StockItemFormSchema } from "@/validations/schemas/StockItemFormSchema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import RenderFormItem from "../RenderFormItem";

export default function StockItemBaseForm({
  handleSubmit,
  defaultValues,
}: {
  handleSubmit: (data: z.infer<typeof StockItemFormSchema>) => void;
  defaultValues?: z.infer<typeof StockItemFormSchema>;
}) {
  const form = useForm<z.infer<typeof StockItemFormSchema>>({
    resolver: zodResolver(StockItemFormSchema),
    defaultValues: defaultValues,
  });

  function BasicOptions() {
    return (
      <>
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>在庫名</FormLabel>
              <FormControl>
                <Input placeholder="インスタントラーメン" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="quantity"
          render={({ field }) => (
            <FormItem>
              <FormLabel>個数</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </>
    );
  }
  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="h-full flex flex-col space-y-5"
      >
        <Tabs defaultValue="basic" className="flex-grow">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="basic">基本設定</TabsTrigger>
            <TabsTrigger value="advanced">詳細設定</TabsTrigger>
          </TabsList>
          <TabsContent value="basic">
            <BasicOptions />
          </TabsContent>
          <TabsContent value="advanced">
            <BasicOptions />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <RenderFormItem label={"説明・備考欄"}>
                  <Textarea
                    placeholder="詳細説明や、使う目的など..."
                    rows={5}
                    className="resize-none"
                    {...field}
                  />
                </RenderFormItem>
              )}
            />
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>価格</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
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
