import { z } from "zod";

import { StockItemFormSchema } from "@/validations/schemas/StockItemFormSchema";

import { StockItemWithFullMeta } from "@/types";
import StockItemBaseForm from "./stock-item-form/StockItemBaseForm";
import { Dialog, DialogContent, DialogTitle } from "./ui/dialog";

export default function StockItemEditModal({
  open,
  stock,
  onOpenChange,
  handleSubmit,
}: {
  open?: boolean;
  stock: StockItemWithFullMeta;
  onOpenChange?: (open: boolean) => void;
  handleSubmit: (data: z.infer<typeof StockItemFormSchema>) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex h-[80vh] min-w-[80vw] flex-col">
        <DialogTitle>商品を編集</DialogTitle>
        <p>{stock.id}</p>
        <StockItemBaseForm
          handleSubmit={handleSubmit}
          defaultValues={{
            name: stock.Meta.name,
            description: stock.Meta.description,
            unit: stock.Meta.unit,
            price: stock.Meta.price,
            quantity: stock.quantity,
            step: stock.Meta.step,
            threshold: stock.Meta.threshold,
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
