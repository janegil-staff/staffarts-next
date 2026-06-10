// src/app/page.js
// Home: greeting + a preview of upcoming events (max 2, in EventsStrip) and a
// small grid of the newest artworks (max 6). Full lists live at /events and
// /gallery.
"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";

import { useT } from "../i18n/index";
import { listArtworksPaged } from "../api/artwork";
import ArtworkFeedCard from "../components/ArtworkFeedCard";
import EventsStrip, { SectionLabel } from "../components/EventsStrip";
import { useAuthStore } from "../store/authStore";

const HOME_ARTWORK_LIMIT = 6;

function greetingKey() {
  const h = new Date().getHours();
  if (h < 12) return "goodMorning";
  if (h < 18) return "goodAfternoon";
  return "goodEvening";
}

export default function HomePage() {
  const { t } = useT();
  const user = useAuthStore((s) => s.user);
  const [availableOnly, setAvailableOnly] = useState(false);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["artworks-home", { availableOnly }],
    queryFn: () =>
      listArtworksPaged({
        page: 1,
        limit: HOME_ARTWORK_LIMIT,
        available: availableOnly || undefined,
        sort: "-createdAt",
      }),
  });

  const items = (data?.data ?? []).slice(0, HOME_ARTWORK_LIMIT);
  const firstName = (user?.displayName || "").split(" ")[0];

  return (
    <div
      style={{
        maxWidth: 720,
        margin: "0 auto",
        padding: "clamp(20px, 4vw, 36px) clamp(16px, 5vw, 28px) 60px",
      }}
    >
      {/* Greeting */}
      <header style={{ marginBottom: "clamp(28px, 5vw, 40px)" }}>
        <div style={{ fontSize: 18, color: "var(--text-muted)" }}>
          {t(greetingKey())},
        </div>
        <div
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(34px, 8vw, 48px)",
            color: "var(--text)",
            lineHeight: 1.1,
          }}
        >
          {firstName || t("appName")}
        </div>
      </header>

      {/* SHOWS & MUSIC — events preview (max 2, capped inside EventsStrip) */}
      <EventsStrip />

      {/* JUST ADDED — newest artworks (max 6) */}
      <section>
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            justifyContent: "space-between",
            marginBottom: 14,
          }}
        >
          <SectionLabel>{t("justAdded")}</SectionLabel>
          <button
            onClick={() => setAvailableOnly((v) => !v)}
            style={{
              padding: "5px 12px",
              borderRadius: 16,
              fontSize: 13,
              border: "1px solid var(--card-border)",
              background: availableOnly ? "var(--accent)" : "transparent",
              color: availableOnly ? "#fff" : "var(--text-muted)",
            }}
          >
            {availableOnly ? t("filterAvailable") : t("filterAll")}
          </button>
        </div>

        {isLoading ? (
          <p style={{ color: "var(--text-muted)" }}>{t("loading")}</p>
        ) : isError ? (
          <div>
            <p style={{ color: "var(--text-muted)" }}>{t("error")}</p>
            <button onClick={() => refetch()}>{t("retry")}</button>
          </div>
        ) : items.length === 0 ? (
          <p style={{ color: "var(--text-muted)" }}>{t("noArtworks")}</p>
        ) : (
          <>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
                gap: "clamp(14px, 3vw, 22px)",
              }}
            >
              {items.map((a) => (
                <ArtworkFeedCard key={a._id} artwork={a} />
              ))}
            </div>

            {/* Link through to the full feed instead of paginating on home */}
            <div style={{ textAlign: "center", marginTop: 28 }}>
              <Link
                href="/gallery"
                style={{
                  display: "inline-block",
                  padding: "11px 26px",
                  borderRadius: 10,
                  border: "1px solid var(--card-border)",
                  color: "var(--text)",
                  fontSize: 14,
                }}
              >
                {t("navExplore")} ›
              </Link>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
