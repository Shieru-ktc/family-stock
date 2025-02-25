"use client";

import { atom } from "jotai";

const ENDPOINT =
    process.env.NODE_ENV === "development"
        ? "ws://localhost:3030"
        : "wss://stocks-api.shieru-lab.com";

class WebSocketClient {
    socket: WebSocket;
    listeners: { [key: string]: ((data: any) => void)[] } = {};
    private pingTimeout: Timer | null = null;
    private lastPing: number = Date.now();
    lastPingMs: number = 0;

    constructor(socket: WebSocket) {
        this.socket = socket;
        this.socket.onmessage = (event) => {
            const { event: eventName, data } = JSON.parse(event.data);
            if (eventName === "pong" && this.pingTimeout) {
                clearTimeout(this.pingTimeout);
                this.lastPingMs = Date.now() - this.lastPing;
                return;
            }
            if (!this.listeners[eventName]) {
                return;
            }
            this.listeners[eventName].forEach((listener) => listener(data));
        };
        // ping
        setInterval(() => {
            this.socket.send(JSON.stringify({ event: "ping", data: {} }));
            this.lastPing = Date.now();
            // 3秒以内にpongが返ってこなかったら再接続
            this.pingTimeout = setTimeout(() => {
                this.socket.close();
                this.socket = new WebSocket(`${ENDPOINT}/api/ws`);
            }, 3000);
        }, 10000);
    }

    on(event: string, callback: (data: any) => void) {
        if (!this.listeners[event]) {
            this.listeners[event] = [];
        }
        this.listeners[event].push(callback);
    }

    off(event: string, callback: (data: any) => void) {
        if (!this.listeners[event]) {
            return;
        }
        this.listeners[event] = this.listeners[event].filter(
            (listener) => listener !== callback,
        );
    }

    emit(event: string, data: any) {
        this.socket.send(JSON.stringify({ event, data }));
    }
}
// WebSocketに接続
export const socketAtom = atom(() => {
    const socket = new WebSocket(`${ENDPOINT}/api/ws`);
    return new WebSocketClient(socket);
});
