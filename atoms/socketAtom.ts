"use client";

import { atom } from "jotai";

const ENDPOINT =
    process.env.NODE_ENV === "development" ? "localhost:3030" : "stocks-api.shieru-lab.com";

class WebSocketClient {
    socket: WebSocket;
    listeners: { [key: string]: ((data: any) => void)[] } = {};

    constructor(socket: WebSocket) {
        this.socket = socket;
        this.socket.onmessage = (event) => {
            const { event: eventName, data } = JSON.parse(event.data);
            if (!this.listeners[eventName]) {
                return;
            }
            this.listeners[eventName].forEach((listener) => listener(data));
        };
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
    const socket = new WebSocket(`ws://${ENDPOINT}/api/ws`);
    return new WebSocketClient(socket);
});
