import { StockItemWithPartialMeta } from "@/types";
import { CheckedState } from "@radix-ui/react-checkbox";
import { Checkbox } from "./ui/checkbox";

export function StockItemSelectCard({ stock, checked, onCheckedChange }: { stock: StockItemWithPartialMeta, checked?: CheckedState, onCheckedChange?: (checked: CheckedState) => void }) {
  return (
    <div className="flex flex-row items-center space-x-4 px-2 py-4 shadow-xl rounded-lg dark:border-none border-gray-200 border dark:shadow-white dark:shadow-sm">
      <Checkbox className="w-6 h-6 ml-4" checked={checked} onCheckedChange={onCheckedChange} />
      <div>
        <h2 className="text-lg font-semibold">{stock.Meta.name}</h2>
        <p>{stock.quantity}{stock.Meta.unit} / しきい値: {stock.Meta.threshold}</p>
      </div>
    </div>
  )
}
export default function StockItemSelector({ stocks, onCheckedChange }: { stocks: (StockItemWithPartialMeta & { checked: CheckedState })[], onCheckedChange: (stock: StockItemWithPartialMeta, checked: CheckedState) => void }) {
  return stocks.map(stock =>
    <div className="py-2" key={stock.id}>
      <StockItemSelectCard stock={stock} checked={stock.checked} onCheckedChange={checked => onCheckedChange(stock, checked)} />
    </div>
  )
}