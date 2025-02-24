"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { useSetAtom } from "jotai";

import { getQueryClient } from "./get-query-client";
import {
    authConfigManager,
    SessionProvider,
    useSession,
} from "@hono/auth-js/react";
import { sessionAtom } from "@/atoms/sessionAtom";
import { useEffect } from "react";
import SignIn from "./app/auth/signIn/page";
import Loading from "@/components/Loading";

authConfigManager.setConfig({
    baseUrl:
        process.env.NODE_ENV === "production"
            ? "https://stocks-api.shieru-lab.com"
            : "http://localhost:3030",
    credentials: "include",
});
export default function Providers({ children }: { children: React.ReactNode }) {
    const queryClient = getQueryClient();

    return (
        <SessionProvider>
            <QueryClientProvider client={queryClient}>
                <ClientProvider>{children}</ClientProvider>
            </QueryClientProvider>
        </SessionProvider>
    );
}

export function ClientProvider({ children }: { children: React.ReactNode }) {
    const session = useSession();
    const setSession = useSetAtom(sessionAtom);

    useEffect(() => {
        console.log(session);
        if (session) {
            if (session.status !== "loading") {
                setSession(session.data);
            }
        } else {
            setSession(undefined);
        }
    }, [session, setSession]);

    if (session?.status === "loading") {
        return <Loading />;
    } else if (session?.status === "authenticated") {
        return <>{children}</>;
    } else {
        return <SignIn />;
    }
}
