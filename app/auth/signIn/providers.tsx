"use client";
import { signIn, useSession } from "next-auth/react";
import { FaDiscord, FaGithub } from "react-icons/fa";

import { SessionProvider } from "@/components/SessionProvider";
import { Button } from "@/components/ui/button";

function AuthButtons() {
  const { data: session, status } = useSession();

  return (
    <>
      {status === "authenticated" ? (
        <div>
          <p>ログイン中: {session.user.name}</p>
        </div>
      ) : (
        <div className="space-x-4 flex gap-2">
          <Button
            onClick={async () => {
              await signIn("github");
            }}
          >
            <FaGithub />
            GitHubでログイン
          </Button>
          <Button
            onClick={async () => {
              await signIn("discord");
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
