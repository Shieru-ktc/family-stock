import { randomUUIDv7 } from "bun";
import { WSContext } from "hono/ws";

interface Emittable {
    emit: (event: string, data: any) => void;
}

abstract class Channelable {
    abstract in(roomName: string): Channelable;
    on(roomName: string) {
        return this.in(roomName);
    }
}

class WebSocketClient implements Emittable {
    context: WSContext;
    joinedRooms: string[] = [];
    id: string;

    constructor(context: WSContext) {
        this.context = context;
        this.id = randomUUIDv7();
    }

    join(roomName: string) {
        this.joinedRooms.push(roomName);
    }

    leave(roomName: string) {
        this.joinedRooms = this.joinedRooms.filter((name) => name !== roomName);
    }

    emit(event: string, data: any) {
        this.context.send(event, data);
    }
}

export class WebSocketManager extends Channelable implements Emittable {
    clients: WebSocketClient[] = [];

    constructor() {
        super();
    }

    addClient(client: WSContext) {
        this.clients.push(new WebSocketClient(client));
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
        if (typeof client === "string") {
            return this.clients.find((c) => c.id === client);
        } else {
            return this.clients.find((c) => c.context === client);
        }
    }

    emit(event: string, data: any) {
        this.clients.forEach((client) => client.emit(event, data));
    }

    in(roomName: string) {
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
