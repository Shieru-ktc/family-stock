import { StockItemWithPartialMeta } from "@/types";
import { CheckedState } from "@radix-ui/react-checkbox";
import { Checkbox } from "./ui/checkbox";

export function StockItemSelectCard({
  stock,
  checked,
  onCheckedChange,
}: {
  stock: StockItemWithPartialMeta;
  checked?: CheckedState;
  onCheckedChange?: (checked: CheckedState) => void;
}) {
  return (
    <div className="flex flex-row items-center space-x-4 rounded-lg border border-gray-200 px-2 py-4 shadow-xl dark:border-none dark:shadow-sm dark:shadow-white">
      <Checkbox
        className="ml-4 h-6 w-6"
        checked={checked}
        onCheckedChange={onCheckedChange}
      />
      <div>
        <h2 className="text-lg font-semibold">{stock.Meta.name}</h2>
        <p>
          {stock.quantity}
          {stock.Meta.unit} / しきい値: {stock.Meta.threshold}
        </p>
      </div>
    </div>
  );
}
export default function StockItemSelector({
  stocks,
  onCheckedChange,
}: {
  stocks: (StockItemWithPartialMeta & { checked: CheckedState })[];
  onCheckedChange: (
    stock: StockItemWithPartialMeta,
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
