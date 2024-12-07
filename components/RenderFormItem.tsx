import { PropsWithChildren, ReactNode } from "react";
import {
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from "@/components/ui/form";
import React from "react";

export function RenderFormItem({
  label,
  description,
  children,
}: {
  label?: ReactNode;
  description?: ReactNode;
  children: ReactNode;
} & PropsWithChildren) {
  return (
    <FormItem>
      <FormLabel>{label}</FormLabel>
      <FormControl>{children}</FormControl>
      <FormDescription>{description}</FormDescription>
      <FormMessage />
    </FormItem>
  );
}

export default RenderFormItem;
