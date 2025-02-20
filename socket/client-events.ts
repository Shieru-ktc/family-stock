import { Server, Socket } from "socket.io";
import { prisma } from "../lib/prisma";
import { SocketEvents } from "./events";

export default function ClientEventHandler(
  io: Server,
  socket: Socket,
  userId: string,
) {
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
          io.in(stock.familyId),
        );
      });
  });

  SocketEvents.clientShoppingQuantityChanged.listen(socket, (data) => {
    console.log(data);
    prisma.shoppingItem
      .update({
        where: {
          id: data.itemId,
          Shopping: {
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
        },
        include: {
          Shopping: true,
        },
        data: {
          quantity: data.quantity,
        },
      })
      .then((shopping) => {
        SocketEvents.shoppingQuantityChanged.dispatch(
          {
            item: shopping,
          },
          io.in(shopping.Shopping.familyId),
        );
      });
  });

  SocketEvents.clientStockDeleted.listen(socket, (data) => {
    prisma.stockItem
      .delete({
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
      })
      .then((stock) => {
        SocketEvents.stockDeleted(stock.familyId).dispatch(
          {
            stockId: stock.id,
          },
          io.in(stock.familyId),
        );
      });
  });
}
