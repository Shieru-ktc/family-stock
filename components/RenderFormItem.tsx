import { PropsWithChildren, ReactNode } from "react";

import {
  FormControl,
  FormDescription,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

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
