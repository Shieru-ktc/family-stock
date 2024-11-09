import { StockItemWithFullMeta } from "@/types";
import { Family, StockItem } from "@prisma/client";

export class SocketEvent<T> {
  name: string;
  params: any[];

  constructor(name: string, ...params: any[]) {
    this.name = name;
    this.params = params;
  }

  dispatch(data: T, emit: { emit: (event: string, data: T) => void }) {
    emit.emit(this.name, data);
  }

  listen(
    socket: {
      on: (ev: string, listener: (data: any) => void) => void;
      off: (ev: string, listener: (data: any) => void) => void;
    },
    callback: (data: T) => void
  ) {
    socket.on(this.name, callback);
    return () => {
      socket.off(this.name, callback);
    };
  }
}

export const SocketEvents = {
  familyCreated: new SocketEvent<{ family: Family }>("family-created"),
  familyDeleted: new SocketEvent<{ family: Family }>("family-deleted"),
  stockCreated: (familyId: string) =>
    new SocketEvent<{ stock: StockItemWithFullMeta }>(
      `stock-created-${familyId}`
    ),
  stockUpdated: (familyId: string) =>
    new SocketEvent<{ stock: StockItemWithFullMeta }>(
      `stock-updated-${familyId}`
    ),
  stockDeleted: (familyId: string) =>
    new SocketEvent<{ stockId: string }>(`stock-deleted-${familyId}`),
  stockQuantityChanged: new SocketEvent<{ stock: StockItem }>(
    "stock-quantity-changed"
  ),
  testEvent: new SocketEvent<{ message: string }>("test-event"),

  // Client-side
  clientStockQuantityChanged: new SocketEvent<{
    stockId: string;
    quantity: number;
  }>("stock-quantity-changed"),
};
