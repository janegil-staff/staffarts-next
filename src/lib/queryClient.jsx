// src/lib/queryClient.jsx
"use client";

import { useState, useEffect } from "react";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";

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

  // Wire the socket to the query client so incoming messages can invalidate the
  // unread + conversation queries. Imported lazily (browser only) so that
  // socket.io-client never enters the server/SSR bundle — importing it there
  // triggers "require is not defined".
  useEffect(() => {
    let cancelled = false;
    import("./socket").then(({ configureSocket }) => {
      if (!cancelled) configureSocket({ queryClient: client });
    });
    return () => {
      cancelled = true;
    };
  }, [client]);

  return (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
}
