// src/app/events/page.js
"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { useT } from "../../i18n/index";
import { listEventsPaged } from "../../api/event";

function formatDate(d, lang) {
  if (!d) return "";
  try {
    return new Date(d).toLocaleDateString(lang, {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return String(d);
  }
}

export default function EventsPage() {
  const { t, lang } = useT();
  const [upcoming, setUpcoming] = useState(true);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["events", { upcoming }],
    queryFn: () => listEventsPaged({ page: 1, limit: 50, upcoming }),
  });

  const events = data?.data ?? [];

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "clamp(24px,5vw,48px)" }}>
      <header style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: "clamp(28px,5vw,44px)", margin: 0 }}>
          {t("eventsTitle")}
        </h1>
        <p style={{ color: "var(--text-muted)", marginTop: 6, fontSize: 15 }}>
          {t("eventsSubtitle")}
        </p>
      </header>

      <div style={{ display: "flex", gap: 8, marginBottom: 28 }}>
        {[true, false].map((val) => (
          <button
            key={String(val)}
            onClick={() => setUpcoming(val)}
            style={{
              padding: "8px 16px",
              borderRadius: 20,
              fontSize: 14,
              border: "1px solid var(--card-border)",
              background: upcoming === val ? "var(--accent)" : "transparent",
              color: upcoming === val ? "#fff" : "var(--text)",
            }}
          >
            {val ? t("upcoming") : t("past")}
          </button>
        ))}
      </div>

      {isLoading ? (
        <p style={{ color: "var(--text-muted)" }}>{t("loading")}</p>
      ) : isError ? (
        <p style={{ color: "var(--text-muted)" }}>{t("error")}</p>
      ) : events.length === 0 ? (
        <p style={{ color: "var(--text-muted)" }}>{t("noEvents")}</p>
      ) : (
        <div style={{ display: "grid", gap: 16 }}>
          {events.map((ev) => {
            const img =
              ev.imageUrl || ev.image || ev.images?.[0]?.url || ev.images?.[0];
            return (
              <article
                key={ev._id}
                style={{
                  display: "flex",
                  gap: 16,
                  background: "var(--card)",
                  border: "1px solid var(--card-border)",
                  borderRadius: 12,
                  overflow: "hidden",
                  boxShadow: "var(--shadow)",
                }}
              >
                {img && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={img}
                    alt=""
                    style={{
                      width: 140,
                      objectFit: "cover",
                      flexShrink: 0,
                    }}
                  />
                )}
                <div style={{ padding: "16px 18px", flex: 1 }}>
                  <div
                    style={{
                      fontSize: 12,
                      color: "var(--accent)",
                      fontWeight: 600,
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                    }}
                  >
                    {formatDate(ev.startDate || ev.date, lang)}
                  </div>
                  <h2 style={{ fontSize: 19, margin: "6px 0 4px" }}>
                    {ev.title}
                  </h2>
                  {ev.location && (
                    <div style={{ fontSize: 14, color: "var(--text-muted)" }}>
                      {ev.location}
                    </div>
                  )}
                  {ev.description && (
                    <p
                      style={{
                        fontSize: 14,
                        lineHeight: 1.5,
                        marginTop: 8,
                        marginBottom: 0,
                      }}
                    >
                      {ev.description.length > 180
                        ? ev.description.slice(0, 180) + "…"
                        : ev.description}
                    </p>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
