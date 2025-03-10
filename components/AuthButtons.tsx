"use client";

import { signIn, signOut } from "@hono/auth-js/react";
import { Button } from "./ui/button";
import { Session } from "@auth/core/types";

export default function AuthButtons({
    session,
}: {
    session: Session | null | undefined;
}) {
    if (session) {
        return (
            <>
                <div className="text-2xl">
                    ようこそ、{session?.user?.name}さん！
                </div>
                <div>ここはあなたのトップページです。</div>
                <br />
                <Button onClick={() => signOut()}>サインアウト</Button>
            </>
        );
    }
    return (
        <>
            サインインしていません
            <br />
            <Button onClick={() => signIn(undefined, { callbackUrl: "/" })}>
                Sign in
            </Button>
        </>
    );
}
