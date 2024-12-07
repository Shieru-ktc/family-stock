"use client";

import { Session } from "next-auth";
import { signIn, signOut } from "next-auth/react";

import { Button } from "./ui/button";

export default function AuthButtons({ session }: { session: Session | null }) {
  if (session) {
    return (
      <>
        <div className="text-2xl">ようこそ、{session.user.name}さん！</div>
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
