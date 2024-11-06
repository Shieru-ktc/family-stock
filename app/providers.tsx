"use client";
import { QueryClientProvider } from "@tanstack/react-query";
import { getQueryClient } from "@/app/get-query-client";
import type * as React from "react";
import { SessionProvider } from "next-auth/react";

export default function Providers({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient();

  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </SessionProvider>
  );
}
