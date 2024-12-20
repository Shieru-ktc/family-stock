import { z } from "zod";

import { StockItemFormSchema } from "@/validations/schemas/StockItemFormSchema";

import StockItemBaseForm from "./stock-item-form/StockItemBaseForm";
import { Dialog, DialogContent, DialogTitle } from "./ui/dialog";

export default function StockItemCreateModal({
  open,
  onOpenChange,
  handleSubmit,
}: {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  handleSubmit: (data: z.infer<typeof StockItemFormSchema>) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex flex-col h-[80vh] min-w-[80vw]">
        <DialogTitle>商品を追加</DialogTitle>
        <StockItemBaseForm
          handleSubmit={handleSubmit}
          defaultValues={{
            name: "",
            description: "",
            unit: "個",
            price: 0,
            quantity: 0,
            step: 1,
            threshold: 0,
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
