"use client";

import { useAtom } from "jotai";
import { useEffect, useState } from "react";

import { socketAtom } from "@/atoms/socketAtom";
import { SocketEvents } from "@/socket/events";

export default function HomePage() {
  const [messages, setMessages] = useState<string[]>([]);
  const [socket] = useAtom(socketAtom);

  useEffect(() => {
    return SocketEvents.testEvent.listen(socket, (data) => {
      console.log(data);
      setMessages((prev) => [...prev, data.message]);
    });
  }, [socket]);

  return <div></div>;
}
