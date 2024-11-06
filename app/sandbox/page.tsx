"use client";

import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

export default function HomePage() {
  const [socket, setSocket] = useState<Socket | undefined>(undefined);

  useEffect(() => {
    // サーバーに接続
    const socket = io("ws://localhost:3000");

    // サーバーからのメッセージを受信
    socket.on("connect", () => {
      console.log("Connected to server");
    });

    socket.on("message", (message) => {
      console.log("Received message:", message);
    });

    setSocket(socket);
    // クリーンアップ
    return () => {
      socket.disconnect();
    };
  }, []);

  return <div>Socket.io with Next.js</div>;
}
