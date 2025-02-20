"use client";
import { FaDiscord, FaGithub } from "react-icons/fa";

import { Button } from "@/components/ui/button";
import { SessionProvider, signIn } from "@hono/auth-js/react";
import { useAtomValue } from "jotai";
import { sessionAtom } from "@/atoms/sessionAtom";

function AuthButtons() {
    const session = useAtomValue(sessionAtom);

    return (
        <>
            {session ? (
                <div>
                    <p>ログイン中: {session?.user?.name}</p>
                </div>
            ) : (
                <div className="flex gap-2 space-x-4">
                    <Button
                        onClick={() => {
                            signIn("github");
                        }}
                    >
                        <FaGithub />
                        GitHubでログイン
                    </Button>
                    <Button
                        onClick={() => {
                            signIn("discord");
                        }}
                    >
                        <FaDiscord />
                        Discordでログイン
                    </Button>
                </div>
            )}
        </>
    );
}
export default function SignInProviders() {
    return (
        <SessionProvider>
            <AuthButtons />
        </SessionProvider>
    );
}
