"use client";

import { socketAtom } from "@/atoms/socketAtom";
import StockItemModal from "@/components/StockItemModal";
import { SocketEvents } from "@/socket/events";
import { useAtom } from "jotai";
import { useEffect, useState } from "react";

export default function HomePage() {
  const [messages, setMessages] = useState<string[]>([]);
  const [socket] = useAtom(socketAtom);

  useEffect(() => {
    return SocketEvents.testEvent.listen(socket, (data) => {
      console.log(data);
      setMessages((prev) => [...prev, data.message]);
    });
  }, [socket]);

  return (
    <div>
      <StockItemModal />
    </div>
  );
}
