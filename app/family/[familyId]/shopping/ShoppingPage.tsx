"use client";

import { socketAtom } from "@/atoms/socketAtom";
import Counter from "@/components/Counter";
import { Button } from "@/components/ui/button";
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
    setShopping((prevShopping) => ({
      ...prevShopping,
      Items: prevShopping.Items.map((item) =>
        item.id === id ? { ...item, quantity } : item,
      ),
    }));
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

  const handleCancel = () => {
    fetch(`/api/family/${shopping.familyId}/shopping`, {
      method: "DELETE",
      body: JSON.stringify({ completed: false }),
    })
  }

  const handleComplete = () => {
    fetch(`/api/family/${shopping.familyId}/shopping`, {
      method: "DELETE",
      body: JSON.stringify({ completed: true }),
    })
  }

  const handleAddItem = () => {
    // TODO: Not Impletemented
  }

  return (
    <>
      <div className="mr-2 flex-row items-end justify-between lg:flex">
        <div>
          <h1 className="text-2xl">買い物リスト</h1>
          <p>購入したアイテムは在庫リストに加算されます。</p>
        </div>
        <div className="flex space-x-4">
          <Button onClick={handleCancel}>買い物をキャンセル</Button>
          <Button onClick={handleAddItem}>新しいアイテムを追加</Button>
          <Button onClick={handleComplete}>買い物を完了</Button>
        </div>
      </div>
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
