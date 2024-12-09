import { Socket } from "socket.io";
import { prisma } from "../lib/prisma";
import { SocketEvents } from "./events";

export default function ClientEventHandler(socket: Socket, userId: string) {
  SocketEvents.clientStockQuantityChanged.listen(socket, (data) => {
    console.log(data);
    prisma.stockItem
      .update({
        where: {
          id: data.stockId,
          Family: {
            Members: {
              some: {
                User: {
                  id: userId,
                },
              },
            },
          },
        },
        data: {
          quantity: data.quantity,
        },
      })
      .then((stock) => {
        SocketEvents.stockQuantityChanged.dispatch(
          {
            stock,
          },
          global.io.in(stock.familyId)
        );
      });
  });
}
