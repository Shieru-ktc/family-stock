"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { Provider } from "jotai";

import { SessionProvider } from "@/components/SessionProvider";

import { getQueryClient } from "./get-query-client";

export default function Providers({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient();

  return (
    <SessionProvider>
      <Provider>
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      </Provider>
    </SessionProvider>
  );
}
