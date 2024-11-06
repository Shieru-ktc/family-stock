"use client";

import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

export default function HomePage() {
  const [socket, setSocket] = useState<Socket | undefined>(undefined);
  const [messages, setMessages] = useState<string[]>([]);

  useEffect(() => {
    // サーバーに接続
    const socket = io("http://localhost:3000");

    // サーバーからのメッセージを受信
    socket.on("connect", () => {
      console.log("Connected to server");
    });

    socket.on("message", (message) => {
      console.log("Received message:", message);
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    setSocket(socket);
    // クリーンアップ
    return () => {
      socket.disconnect();
    };
  }, []);

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
