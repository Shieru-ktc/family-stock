"use client";

import { SessionProvider } from "@/components/SessionProvider";
import { getQueryClient } from "./get-query-client";
import { Provider } from "jotai";
import { QueryClientProvider } from "@tanstack/react-query";

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
