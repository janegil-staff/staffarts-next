// src/lib/queryClient.jsx
"use client";

import { useState, useEffect } from "react";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";

import { configureSocket } from "./socket";

export default function QueryProvider({ children }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  // Give the socket service a handle to the query client so incoming messages
  // can invalidate the unread + conversation queries (server is source of truth).
  useEffect(() => {
    configureSocket({ queryClient: client });
  }, [client]);

  return (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
}
