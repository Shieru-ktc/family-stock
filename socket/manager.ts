import { randomUUIDv7 } from "bun";
import { WSContext } from "hono/ws";

export interface Emittable {
    emit: (event: string, data: any) => void;
}

export abstract class Channelable implements Emittable {
    abstract in(roomName: string): Channelable;
    on(roomName: string) {
        return this.in(roomName);
    }
    abstract emit(event: string, data: any): void;
}

export interface Listener {
    on: (ev: string, listener: (data: any) => void) => void;
    off: (ev: string, listener: (data: any) => void) => void;
}

class WebSocketClient implements Emittable, Listener {
    context: WSContext;
    joinedRooms: string[] = [];
    listeners: { [key: string]: ((data: any) => void)[] } = {};
    id: string;
    userId: string;

    constructor(context: WSContext, userId: string) {
        this.context = context;
        this.id = randomUUIDv7();
        this.userId = userId;
    }

    join(roomName: string) {
        this.joinedRooms.push(roomName);
    }

    leave(roomName: string) {
        this.joinedRooms = this.joinedRooms.filter((name) => name !== roomName);
    }

    emit(event: string, data: any) {
        this.context.send(JSON.stringify({ event, data }));
    }

    fire(event: string, data: any) {
        if (!this.listeners[event]) {
            return;
        }
        this.listeners[event].forEach((listener) => listener(data));
    }

    on(event: string, callback: (data: any) => void) {
        if (!this.listeners[event]) {
            this.listeners[event] = [];
        }
        this.listeners[event].push(callback);
    }

    off(event: string, callback: (data: any) => void) {
        if (!this.listeners[event]) {
            return;
        }
        this.listeners[event] = this.listeners[event].filter(
            (listener) => listener !== callback,
        );
    }
}

export class WebSocketManager extends Channelable implements Emittable {
    clients: WebSocketClient[] = [];

    constructor() {
        super();
    }

    addClient(client: WSContext, userId: string) {
        const wsClient = new WebSocketClient(client, userId);
        if (userId) {
            wsClient.join(userId);
        }
        this.clients.push(wsClient);
        return wsClient;
    }

    removeClient(client: WebSocketClient | WSContext | string) {
        if (typeof client === "string") {
            this.clients = this.clients.filter((c) => c.id !== client);
        } else if (client instanceof WSContext) {
            this.clients = this.clients.filter((c) => c.context !== client);
        } else {
            this.clients = this.clients.filter((c) => c.id !== client.id);
        }
    }

    getClient(client: WSContext | string) {
        console.log("getClient", client);
        if (typeof client === "string") {
            return this.clients.find((c) => c.userId === client);
        } else {
            return this.clients.find((c) => c.context.raw === client.raw);
        }
    }

    getClientsByUserId(userId: string) {
        return this.clients.filter((c) => c.userId === userId);
    }

    emit(event: string, data: any) {
        this.clients.forEach((client) => client.emit(event, data));
    }

    in(roomName: string | undefined) {
        if (!roomName) {
            return this;
        }
        const chain = new RoomsChain(this);
        chain.roomNames.push(roomName);
        return chain;
    }
}

class RoomsChain extends Channelable implements Emittable {
    roomNames: string[] = [];
    private manager: WebSocketManager;

    constructor(manager: WebSocketManager) {
        super();
        this.manager = manager;
    }

    emit(event: string, data: any) {
        // すべてのroomNamesに参加しているクライアントだけに送信
        this.manager.clients
            .filter((client) =>
                this.roomNames.every((room) =>
                    client.joinedRooms.includes(room),
                ),
            )
            .forEach((client) => client.emit(event, data));
    }

    in(roomName: string) {
        this.roomNames.push(roomName);
        return this;
    }
}
