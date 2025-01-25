"use client";

import { socketAtom } from "@/atoms/socketAtom";
import Counter from "@/components/Counter";
import { SocketEvents } from "@/socket/events";
import { FullShopping } from "@/types";
import { useAtom } from "jotai";
import { useEffect, useState } from "react";

export default function OnGoingShoppingPage({
  shopping: _shopping,
}: {
  shopping: FullShopping;
}) {
  const [shopping, setShopping] = useState(_shopping);

  const [socket] = useAtom(socketAtom);
  const sortedItems = shopping.Items.toSorted((a, b) =>
    a.StockItem.Meta.name.localeCompare(b.StockItem.Meta.name),
  );
  const setCount = (id: string, quantity: number) => {
    setShopping({
      ...shopping,
      Items: shopping.Items.map((item) =>
        item.id === id ? { ...item, quantity } : item,
      ),
    });
  };

  useEffect(() => {
    const unsubscribeQuantityChanged =
      SocketEvents.shoppingQuantityChanged.listen(socket, (data) => {
        setCount(data.item.id, data.item.quantity);
      });
    return () => {
      unsubscribeQuantityChanged();
    };
  }, [socket]);

  return (
    <>
      <h1>Shopping</h1>
      <div>
        {sortedItems.map((item) => (
          <div key={item.id}>
            <div>{item.StockItem.Meta.name}</div>
            <Counter
              count={item.quantity}
              setCount={(count) => {
                SocketEvents.clientShoppingQuantityChanged.dispatch(
                  {
                    itemId: item.id,
                    quantity: count,
                  },
                  socket,
                );
              }}
            />
          </div>
        ))}
      </div>
    </>
  );
}
