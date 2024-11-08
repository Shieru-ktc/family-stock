"use client";

import { socketAtom } from "@/atoms/socketAtom";
import { useAtom } from "jotai";
import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

export default function HomePage() {
  const [messages, setMessages] = useState<string[]>([]);
  const [socket] = useAtom(socketAtom);

  useEffect(() => {
    socket.on("message", (message: string) => {
      setMessages((prevMessages) => [...prevMessages, message]);
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
