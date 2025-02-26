import { z } from "zod";

import { StockItemFormSchema } from "@/validations/schemas/StockItemFormSchema";

import { StockItemWithPartialMeta, StockItemWithPartialTagMeta } from "@/types";
import StockItemBaseForm from "./stock-item-form/StockItemBaseForm";
import { Dialog, DialogContent, DialogTitle } from "./ui/dialog";

export default function StockItemEditModal({
    open,
    stock,
    onOpenChange,
    handleSubmit,
    tags,
}: {
    open?: boolean;
    stock: {
        Meta: {
            name: string;
            description: string;
            unit: string;
            price: number;
            step: number;
            threshold: number;
            Tags: { id: string }[];
        };
        quantity: number;
    };
    onOpenChange?: (open: boolean) => void;
    handleSubmit: (data: z.infer<typeof StockItemFormSchema>) => void;
    tags: { id: string; label: string }[];
}) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="flex h-[80vh] min-w-[80vw] flex-col">
                <DialogTitle>商品を編集</DialogTitle>
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
                        tags: stock.Meta.Tags.map((tag) => tag.id),
                    }}
                    tags={tags}
                />
            </DialogContent>
        </Dialog>
    );
}
