"use client";

import { atom } from "jotai";
import { io } from "socket.io-client";

const SOCKET_SERVER_URL = "/";

// Socket.IO クライアントインスタンスを atom で管理
export const socketAtom = atom(() => {
  const socket = io(SOCKET_SERVER_URL, {
    transports: ["websocket"],
  });
  return socket;
});
