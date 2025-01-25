import { FullShopping } from "@/types";

export default function OnGoingShoppingPage({
  shopping,
}: {
  shopping: FullShopping;
}) {
  return (
    <>
      <h1>Shopping</h1>
      <div>
        {shopping.Items.map((item) => (
          <div key={item.id}>
            <div>{item.StockItem.Meta.name}</div>
            <div>{item.quantity}</div>
          </div>
        ))}
      </div>
    </>
  );
}
