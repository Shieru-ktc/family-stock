import { z } from "zod";

import { StockItemFormSchema } from "@/validations/schemas/StockItemFormSchema";

import StockItemBaseForm from "./stock-item-form/StockItemBaseForm";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "./ui/dialog";

export default function StockItemCreateModal({
  open,
  onOpenChange,
  handleSubmit,
  defaultValues,
  tags
}: {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  handleSubmit: (data: z.infer<typeof StockItemFormSchema>) => void;
    defaultValues?: z.infer<typeof StockItemFormSchema>;
  tags: { id: string; label: string }[];
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogDescription>
        新しい在庫アイテムを作成し、家族全員で共有しましょう。
      </DialogDescription>
      <DialogContent className="flex h-[80vh] min-w-[80vw] flex-col">
        <DialogTitle>商品を追加</DialogTitle>
        <StockItemBaseForm
          handleSubmit={handleSubmit}
          defaultValues={
            defaultValues ?? {
              name: "",
              description: "",
              unit: "個",
              price: 0,
              quantity: 0,
              step: 1,
              threshold: 0,
              tags: [],
            }
          }
          tags={tags}
        />
      </DialogContent>
    </Dialog>
  );
}
