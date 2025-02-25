"use client";

import { useAtom } from "jotai";
import { useEffect, useState } from "react";

import { socketAtom } from "@/atoms/socketAtom";
import { SocketEvents } from "@/socket/events";
import { apiClient } from "@/lib/apiClient";
import Chip from "@/components/ui/chip";
import { cn, tagColorToCn } from "@/lib/utils";

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
        apiClient.index.$get().then(async (data) => {
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
