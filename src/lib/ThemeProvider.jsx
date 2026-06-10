// src/lib/ThemeProvider.jsx
"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from "react";

const STORAGE_KEY = "staffArtsTheme";
const ThemeContext = createContext(null);

// Palette tokens. Light = parchment world; dark = warm charcoal-navy world.
// Accent stays terracotta in both, nudged warmer in dark so it holds contrast.
const THEMES = {
  light: {
    mode: "light",
    bg: "#FAF7F2", // parchment
    bgSecondary: "#F1EBE2", // soft parchment shade
    card: "#FFFFFF",
    cardBorder: "#E7DFD3",
    text: "#2D2A26",
    textMuted: "#6B6259",
    accent: "#C97060", // terracotta
    accentSoft: "#F4E2DC",
    navy: "#2D4A6E",
    shadow: "0 2px 12px rgba(45,42,38,0.08)",
  },
  dark: {
    mode: "dark",
    bg: "#1A1D24", // charcoal-navy
    bgSecondary: "#21252E",
    card: "#262B35",
    cardBorder: "#363C48",
    text: "#ECE6DD",
    textMuted: "#9AA0AC",
    accent: "#D98570", // warmer terracotta for dark contrast
    accentSoft: "#3A2E2A",
    navy: "#5A7CA8",
    shadow: "0 2px 14px rgba(0,0,0,0.4)",
  },
};

function applyTheme(tokens) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  Object.entries(tokens).forEach(([k, v]) => {
    if (k === "mode") return;
    // camelCase -> --kebab-case
    const name = "--" + k.replace(/[A-Z]/g, (m) => "-" + m.toLowerCase());
    root.style.setProperty(name, v);
  });
  root.dataset.theme = tokens.mode;
  root.style.colorScheme = tokens.mode;
}

export function ThemeProvider({ children }) {
  const [mode, setMode] = useState("light");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let initial = "light";
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved === "light" || saved === "dark") {
        initial = saved;
      } else if (
        window.matchMedia?.("(prefers-color-scheme: dark)").matches
      ) {
        initial = "dark";
      }
    } catch {}
    setMode(initial);
    applyTheme(THEMES[initial]);
    setHydrated(true);
  }, []);

  const setTheme = useCallback((next) => {
    if (next !== "light" && next !== "dark") return;
    setMode(next);
    applyTheme(THEMES[next]);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {}
  }, []);

  const toggle = useCallback(() => {
    setTheme(mode === "light" ? "dark" : "light");
  }, [mode, setTheme]);

  const value = useMemo(
    () => ({ mode, theme: THEMES[mode], setTheme, toggle, hydrated }),
    [mode, setTheme, toggle, hydrated],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    return {
      mode: "light",
      theme: THEMES.light,
      setTheme: () => {},
      toggle: () => {},
      hydrated: false,
    };
  }
  return ctx;
}
