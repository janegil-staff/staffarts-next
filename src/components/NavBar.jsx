// src/components/NavBar.jsx
"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";

import { useTheme } from "../lib/ThemeProvider";
import { useT } from "../i18n/index";
import { useAuthStore } from "../store/authStore";
import { fetchUnreadTotal } from "../api/messages";

const LANG_LABELS = {
  no: "Norsk", en: "English", nl: "Nederlands", fr: "Français",
  de: "Deutsch", it: "Italiano", sv: "Svenska", da: "Dansk",
  fi: "Suomi", es: "Español", pl: "Polski", pt: "Português",
};

export default function NavBar() {
  const { t, lang, setLanguage, supported } = useT();
  const { mode, toggle } = useTheme();
  const status = useAuthStore((s) => s.status);
  const logout = useAuthStore((s) => s.logout);
  const authed = status === "authed";

  const { data: unread = 0 } = useQuery({
    queryKey: ["unreadTotal"],
    queryFn: fetchUnreadTotal,
    enabled: authed,
    refetchInterval: 60_000,
  });

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        height: 64,
        display: "flex",
        alignItems: "center",
        gap: 20,
        padding: "0 clamp(16px, 4vw, 40px)",
        background: "var(--bg)",
        borderBottom: "1px solid var(--card-border)",
      }}
    >
      <Link
        href="/"
        style={{
          fontFamily: "var(--font-display)",
          fontSize: 20,
          fontWeight: 600,
          letterSpacing: "0.02em",
        }}
      >
        {t("appName")}
      </Link>

      <nav
        style={{
          display: "flex",
          gap: 18,
          marginLeft: 8,
          fontSize: 14,
          color: "var(--text-muted)",
        }}
      >
        <Link href="/">{t("navHome")}</Link>
        <Link href="/gallery">{t("navExplore")}</Link>
        <Link href="/events">{t("navEvents")}</Link>
        {authed && (
          <Link href="/messages" style={{ position: "relative" }}>
            {t("navMessages")}
            {unread > 0 && (
              <span
                style={{
                  position: "absolute",
                  top: -6,
                  right: -14,
                  minWidth: 16,
                  height: 16,
                  padding: "0 4px",
                  borderRadius: 8,
                  background: "var(--accent)",
                  color: "#fff",
                  fontSize: 10,
                  fontWeight: 700,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {unread > 99 ? "99+" : unread}
              </span>
            )}
          </Link>
        )}
      </nav>

      <div
        style={{
          marginLeft: "auto",
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}
      >
        <select
          aria-label={t("language")}
          value={lang}
          onChange={(e) => setLanguage(e.target.value)}
          style={{
            background: "transparent",
            color: "var(--text)",
            border: "1px solid var(--card-border)",
            borderRadius: 8,
            padding: "4px 8px",
            fontSize: 13,
          }}
        >
          {supported.map((l) => (
            <option key={l} value={l}>
              {LANG_LABELS[l] ?? l}
            </option>
          ))}
        </select>

        <button
          onClick={toggle}
          aria-label={t("theme")}
          title={mode === "light" ? t("dark") : t("light")}
          style={{
            background: "transparent",
            border: "1px solid var(--card-border)",
            borderRadius: 8,
            width: 34,
            height: 34,
            color: "var(--text)",
            fontSize: 15,
          }}
        >
          {mode === "light" ? "☾" : "☀"}
        </button>

        {authed ? (
          <button
            onClick={logout}
            style={{
              background: "transparent",
              border: "none",
              color: "var(--text-muted)",
              fontSize: 14,
            }}
          >
            {t("navSignOut")}
          </button>
        ) : (
          <Link
            href="/login"
            style={{
              background: "var(--accent)",
              color: "#fff",
              padding: "7px 14px",
              borderRadius: 8,
              fontSize: 14,
            }}
          >
            {t("navSignIn")}
          </Link>
        )}
      </div>
    </header>
  );
}
