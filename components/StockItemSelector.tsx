import { StockItemWithPartialMeta, StockItemWithPartialTagMeta } from "@/types";
import { CheckedState } from "@radix-ui/react-checkbox";
import { Checkbox } from "./ui/checkbox";
import Tag from "./Tag";
import { TagColor } from "@prisma/client";

export function StockItemSelectCard({
    stock,
    checked,
    onCheckedChange,
}: {
    stock: {
        quantity: number;
        Meta: {
            name: string;
            unit: string;
            threshold: number;
            Tags: {
                id: string;
                name: string;
                color: TagColor;
                description?: string;
            }[];
        };
    };
    checked?: CheckedState;
    onCheckedChange?: (checked: CheckedState) => void;
}) {
    return (
        <div className="flex flex-row items-center space-x-4 rounded-lg border border-gray-200 px-2 py-4 shadow-xl dark:border-gray-800">
            <Checkbox
                className="ml-4 h-6 w-6"
                checked={checked}
                onCheckedChange={onCheckedChange}
            />
            <div>
                <div>
                    <h2 className="flex-shrink-0 overflow-hidden text-ellipsis text-xl font-bold">
                        {stock.Meta.name}
                    </h2>
                    <div className="flex gap-2">
                        {stock.Meta.Tags.map((tag) => (
                            <Tag key={tag.id} tag={tag} />
                        ))}
                    </div>
                </div>
                <div>
                    <p>
                        {stock.quantity}
                        {stock.Meta.unit} / しきい値: {stock.Meta.threshold}
                    </p>
                </div>
            </div>
        </div>
    );
}
export default function StockItemSelector({
    stocks,
    onCheckedChange,
}: {
    stocks: (StockItemWithPartialTagMeta & { checked: CheckedState })[];
    onCheckedChange: (
        stock: StockItemWithPartialTagMeta,
        checked: CheckedState,
    ) => void;
}) {
    return stocks.map((stock) => (
        <div className="py-2" key={stock.id}>
            <StockItemSelectCard
                stock={stock}
                checked={stock.checked}
                onCheckedChange={(checked) => onCheckedChange(stock, checked)}
            />
        </div>
    ));
}
