"use client";
import { FaDiscord, FaGithub } from "react-icons/fa";

import { Button } from "@/components/ui/button";
import { authConfigManager, SessionProvider, signIn, useSession } from '@hono/auth-js/react';

authConfigManager.setConfig({
  baseUrl: "http://localhost:3030",
  basePath: "/api/auth",
  credentials: "include"
})
function AuthButtons() {
  const { data: session, status } = useSession();

  return (
    <>
      {status === "authenticated" ? (
        <div>
          <p>ログイン中: {session.user?.name}</p>
        </div>
      ) : (
        <div className="space-x-4 flex gap-2">
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
