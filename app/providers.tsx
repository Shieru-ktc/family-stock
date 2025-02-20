"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { createStore, Provider, useAtom, useSetAtom } from "jotai";

import { getQueryClient } from "./get-query-client";
import {
    authConfigManager,
    SessionProvider,
    useSession,
} from "@hono/auth-js/react";
import { sessionAtom } from "@/atoms/sessionAtom";
import { Suspense, useEffect } from "react";

authConfigManager.setConfig({
    baseUrl: "http://localhost:3030",
    credentials: "include",
});
export default function Providers({ children }: { children: React.ReactNode }) {
    return (
        <SessionProvider>
            <ClientProvider>{children}</ClientProvider>
        </SessionProvider>
    );
}

export function ClientProvider({ children }: { children: React.ReactNode }) {
    const session = useSession();
    const setSession = useSetAtom(sessionAtom);
    const queryClient = getQueryClient();
    useEffect(() => {
        console.log(session);
        if (session) {
            if (session.status !== "loading" && session.data !== null) {
                setSession(session.data);
            }
        } else {
            setSession(undefined);
        }
    }, [session, setSession]);

    if (session?.status === "loading") {
        return (
            <div className="flex h-screen w-screen items-center justify-center">
                <p>Loading...</p>
            </div>
        );
    }

    return (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    );
}
