"use client";

import { socketAtom } from "@/atoms/socketAtom";
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
      Messages:
      <ul>
        {messages.map((message, index) => (
          <li key={index}>{message}</li>
        ))}
      </ul>
    </div>
  );
}
