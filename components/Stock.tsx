import { StockItemWithPartialMeta } from "@/types";

export default function Stock({ stock }: { stock: StockItemWithPartialMeta }) {
  return (
    <div>
      <h2>{stock.Meta.name}</h2>
      <p>{stock.Meta.description}</p>
      <p>在庫数: {stock.quantity}</p>
      <p>価格: {stock.Meta.price}</p>
    </div>
  );
}
