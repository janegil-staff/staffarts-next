// src/components/Providers.jsx
"use client";

import { useEffect } from "react";

import QueryProvider from "../lib/queryClient";
import { ThemeProvider } from "../lib/ThemeProvider";
import { I18nProvider } from "../i18n/index";
import { useAuthStore } from "../store/authStore";

// Runs auth bootstrap once on mount (reads stored tokens, fetches current user).
function AppBootstrap({ children }) {
  const bootstrap = useAuthStore((s) => s.bootstrap);

  useEffect(() => {
    bootstrap();
  }, [bootstrap]);

  return children;
}

export default function Providers({ children }) {
  return (
    <QueryProvider>
      <ThemeProvider>
        <I18nProvider>
          <AppBootstrap>{children}</AppBootstrap>
        </I18nProvider>
      </ThemeProvider>
    </QueryProvider>
  );
}
