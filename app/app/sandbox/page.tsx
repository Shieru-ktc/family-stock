"use client";

import { useAtom } from "jotai";
import { useEffect, useState } from "react";

import { socketAtom } from "@/atoms/socketAtom";
import { SocketEvents } from "@/socket/events";
import { hc } from "hono/client";
import { ApiAppType } from "@/api/src";

const client = hc<ApiAppType>("http://localhost:3030");

export default function HomePage() {
    const [messages, setMessages] = useState<string[]>([]);
    const [apiRootText, setApiRootText] = useState<string>("");
    const [socket] = useAtom(socketAtom);

    useEffect(() => {
        return SocketEvents.testEvent.listen(socket, (data) => {
            console.log(data);
            setMessages((prev) => [...prev, data.message]);
        });
    }, [socket]);

    useEffect(() => {
        client.index.$get().then(async (data) => {
            const response = await data.json();
            setApiRootText(response.text);
        });
    }, []);

    return (
        <div>
            <p>Api Root: {apiRootText}</p>
            {messages.map((message, i) => (
                <p key={i}>{message}</p>
            ))}
        </div>
    );
}
