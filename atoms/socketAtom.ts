"use client";

import { atom } from "jotai";
import { io } from "socket.io-client";

// Socket.IO クライアントインスタンスを atom で管理
export const socketAtom = atom(() => {
  const socket = io("/", {
    path: "/api/socket",
  });
  return socket;
});
