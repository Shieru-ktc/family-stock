import { Family } from "@prisma/client";
import { Socket } from "socket.io-client";

export class SocketEvent<T> {
  name: string;

  constructor(name: string) {
    this.name = name;
  }

  dispatch(data: T, emit: { emit: (event: string, data: T) => void }) {
    emit.emit(this.name, data);
  }

  listen(socket: Socket, callback: (data: T) => void) {
    socket.on(this.name, callback);
    return () => {
      socket.off(this.name, callback);
    };
  }
}

export const SocketEvents = {
  familyCreated: new SocketEvent<{ family: Family }>("family-created"),
  testEvent: new SocketEvent<{ message: string }>("test-event"),
};
