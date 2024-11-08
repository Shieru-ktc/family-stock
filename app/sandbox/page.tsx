"use client";

import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

const socket = io({ autoConnect: false });

export default function HomePage() {
  const [messages, setMessages] = useState<string[]>([]);

  const socketInitializer = (socket: any) => {
    // サーバーとの接続が確立したときの処理
    socket.on("connect", () => {
      console.log("Connected to the server");
    });
    // サーバーとの接続が切断されたときの処理
    socket.on("disconnect", () => {
      console.log("Disconnected from the server");
    });
    // サーバーからメッセージを受信したときの処理
    socket.on("message", (message: any) => {
      console.log(message);
      setMessages((prevMessages) => [...prevMessages, message]);
    });
  };

  useEffect(() => {
    // サーバーに接続
    const socket = io();
    socketInitializer(socket);

    // クリーンアップ
    return () => {
      socket.disconnect();
      socket.off("connect");
      socket.off("disconnect");
      socket.off("message");
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
