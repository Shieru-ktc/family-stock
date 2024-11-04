"use client";
import { signIn, useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { SessionProvider } from "@/components/SessionProvider";
import { FaDiscord, FaGithub } from "react-icons/fa";

function AuthButtons() {
  const { data: session, status } = useSession();

  return (
    <>
      {status === "authenticated" ? (
        <div>
          <p>ログイン中: {session.user?.name}</p>
        </div>
      ) : (
        <>
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
        </>
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
