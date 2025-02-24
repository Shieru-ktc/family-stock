import { StockItemWithFullMeta } from "@/types";
import { Family, ShoppingItem, StockItem } from "@prisma/client";
import { Emittable } from "./manager";

/**
 * Socketによって管理されるイベントを表すクラス。これにより、リスナーが受け取るデータの型を定義し、保証することができます。
 * 型定義による恩恵を受けるためのユーティリティーです。
 * @template T イベントが発火する際に渡されるデータの型
 */
export class SocketEvent<T> {
    name: string;

    constructor(name: string) {
        this.name = name;
    }

    /**
     * イベントを発火し、listenしている関数にデータを渡します。
     * @param data 渡すデータの型。
     * @param emit イベントを発火するために使用するemit-ableなオブジェクト。
     */
    dispatch(data: T, emit: Emittable) {
        emit.emit(this.name, data);
    }

    /**
     * dispatchされたイベントをlistenします。
     * @param socket on及びoffメソッドを持つsocketオブジェクト。
     * @param callback イベントが発火した際に呼び出されるコールバック関数。dispatchによって渡されたデータが引数として渡されます。
     * @returns イベントリスナーを解除するための関数。useEffectのクリーンアップ関数として使用することを想定しています。
     */
    listen(
        socket: {
            on: (ev: string, listener: (data: any) => void) => void;
            off: (ev: string, listener: (data: any) => void) => void;
        },
        callback: (data: T) => void,
    ) {
        socket.on(this.name, callback);
        return () => {
            socket.off(this.name, callback);
        };
    }
}

export const SocketEvents = {
    // Server-side events
    // サーバーが発火し、クライアントがリッスンするイベント

    /** ユーザーがファミリーを作成または参加したことによって、利用可能なファミリーが追加されたときに発火されるイベント */
    familyCreated: new SocketEvent<{ family: Family }>("family-created"),
    /** ユーザーがファミリーを削除した、またはキックされたことによって、ファミリーが利用できなくなったときに発火されるイベント */
    familyDeleted: new SocketEvent<{ family: Family }>("family-deleted"),

    /** 新しい在庫アイテムが作成された際に発火されるイベント。 */
    stockCreated: (familyId: string) =>
        new SocketEvent<{ stock: StockItemWithFullMeta }>(
            `stock-created-${familyId}`,
        ),
    /** 在庫アイテムが更新された際に発火されるイベント。 */
    stockUpdated: (familyId: string) =>
        new SocketEvent<{ stock: StockItemWithFullMeta }>(
            `stock-updated-${familyId}`,
        ),
    /** 在庫アイテムが削除された際に発火されるイベント。 */
    stockDeleted: (familyId: string) =>
        new SocketEvent<{ stockId: string }>(`stock-deleted-${familyId}`),
    /** 在庫の数量が変更された際に発火されるイベント。 */
    stockQuantityChanged: new SocketEvent<{ stock: StockItem }>(
        "stock-quantity-changed",
    ),

    shoppingCreated: (familyId: string) =>
        new SocketEvent<{ shoppingId: string }>(`shopping-created-${familyId}`),
    shoppingUpdated: (familyId: string) =>
        new SocketEvent<{ shoppingId: string }>(`shopping-updated-${familyId}`),
    shoppingCancelled: (familyId: string) =>
        new SocketEvent<{ shoppingId: string }>(
            `shopping-cancelled-${familyId}`,
        ),
    shoppingCompleted: (familyId: string) =>
        new SocketEvent<{ shoppingId: string }>(
            `shopping-completed-${familyId}`,
        ),

    shoppingQuantityChanged: new SocketEvent<{
        item: ShoppingItem;
    }>("shopping-quantity-changed"),

    /** テスト用のイベント */
    testEvent: new SocketEvent<{ message: string }>("test-event"),
    testEvent2: new SocketEvent<{ message: string }>("test-event-2"),

    // Client-side
    // クライアントが発火し、サーバーがリッスンするイベント

    /** クライアントが在庫の数量を変更した際に発火されるイベント。 */
    clientStockQuantityChanged: new SocketEvent<{
        stockId: string;
        quantity: number;
    }>("stock-quantity-changed"),

    clientShoppingQuantityChanged: new SocketEvent<{
        itemId: string;
        quantity: number;
    }>("shopping-quantity-changed"),

    /** クライアントが在庫を削除した際に発火されるイベント */
    clientStockDeleted: new SocketEvent<{ stockId: string }>("stock-deleted"),
};
