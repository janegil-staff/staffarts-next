// src/components/NavBar.jsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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

function UnreadBadge({ count }) {
  if (!count) return null;
  return (
    <span
      style={{
        marginLeft: 6,
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
        verticalAlign: "middle",
      }}
    >
      {count > 99 ? "99+" : count}
    </span>
  );
}

export default function NavBar() {
  const { t, lang, setLanguage, supported } = useT();
  const { mode, toggle } = useTheme();
  const status = useAuthStore((s) => s.status);
  const logout = useAuthStore((s) => s.logout);
  const authed = status === "authed";
  const pathname = usePathname();

  const [menuOpen, setMenuOpen] = useState(false);

  // Close the mobile menu whenever the route changes.
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  const { data: unread = 0 } = useQuery({
    queryKey: ["unreadTotal"],
    queryFn: fetchUnreadTotal,
    enabled: authed,
    refetchInterval: 60_000,
  });

  // Shared link list, reused in desktop bar and mobile dropdown.
  const links = (
    <>
      <Link href="/">{t("navHome")}</Link>
      <Link href="/gallery">{t("navExplore")}</Link>
      <Link href="/events">{t("navEvents")}</Link>
      {authed && (
        <Link href="/messages">
          {t("navMessages")}
          <UnreadBadge count={unread} />
        </Link>
      )}
      {authed && <Link href="/profile">{t("navProfile")}</Link>}
    </>
  );

  const langSelect = (
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
  );

  const authButton = authed ? (
    <button
      onClick={logout}
      style={{
        background: "transparent",
        border: "none",
        color: "var(--text-muted)",
        fontSize: 14,
        cursor: "pointer",
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
  );

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        background: "var(--bg)",
        borderBottom: "1px solid var(--card-border)",
      }}
    >
      <div
        style={{
          height: 64,
          display: "flex",
          alignItems: "center",
          gap: 20,
          padding: "0 clamp(16px, 4vw, 40px)",
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

        {/* Desktop inline nav */}
        <nav
          className="nav-desktop"
          style={{
            display: "flex",
            gap: 18,
            marginLeft: 8,
            fontSize: 14,
            color: "var(--text-muted)",
          }}
        >
          {links}
        </nav>

        <div
          style={{
            marginLeft: "auto",
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          {/* Theme toggle is always visible */}
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

          {/* Desktop: language + auth inline */}
          <div className="nav-desktop" style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {langSelect}
            {authButton}
          </div>

          {/* Mobile: hamburger */}
          <button
            className="nav-mobile-toggle"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Menu"
            aria-expanded={menuOpen}
            style={{
              display: "none",
              background: "transparent",
              border: "1px solid var(--card-border)",
              borderRadius: 8,
              width: 38,
              height: 38,
              color: "var(--text)",
              fontSize: 18,
              position: "relative",
            }}
          >
            {menuOpen ? "✕" : "☰"}
            {!menuOpen && unread > 0 && (
              <span
                style={{
                  position: "absolute",
                  top: 4,
                  right: 4,
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  background: "var(--accent)",
                }}
              />
            )}
          </button>
        </div>
      </div>

      {/* Mobile dropdown panel */}
      {menuOpen && (
        <nav
          className="nav-mobile-panel"
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 4,
            padding: "8px 16px 16px",
            borderTop: "1px solid var(--card-border)",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 2,
              fontSize: 16,
            }}
          >
            <MobileLink href="/">{t("navHome")}</MobileLink>
            <MobileLink href="/gallery">{t("navExplore")}</MobileLink>
            <MobileLink href="/events">{t("navEvents")}</MobileLink>
            {authed && (
              <MobileLink href="/messages">
                {t("navMessages")}
                <UnreadBadge count={unread} />
              </MobileLink>
            )}
            {authed && <MobileLink href="/profile">{t("navProfile")}</MobileLink>}
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
              marginTop: 10,
              paddingTop: 12,
              borderTop: "1px solid var(--card-border)",
            }}
          >
            {langSelect}
            {authButton}
          </div>
        </nav>
      )}

      <style>{`
        /* Phones: hide the desktop inline nav, show the hamburger. */
        @media (max-width: 720px) {
          .nav-desktop { display: none !important; }
          .nav-mobile-toggle { display: inline-flex !important;
            align-items: center; justify-content: center; }
        }
      `}</style>
    </header>
  );
}

function MobileLink({ href, children }) {
  return (
    <Link
      href={href}
      style={{
        display: "block",
        padding: "12px 8px",
        color: "var(--text)",
        borderRadius: 8,
      }}
    >
      {children}
    </Link>
  );
}
