// src/components/EventsListSection.jsx (exported as default; filename kept as
// EventsStrip.jsx for drop-in compatibility with the existing import in page.js)
//
// Vertical "SHOWS & MUSIC" list matching the mobile landing page: rounded-square
// thumbnail, title, and a "● Event · Date · Location" meta row, divided by hair
// lines, each row tappable through to /events.
"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";

import { useT } from "../i18n/index";
import { listEventsPaged } from "../api/event";

function formatDate(d, lang) {
  if (!d) return "";
  try {
    return new Date(d).toLocaleDateString(lang, { day: "numeric", month: "short" });
  } catch {
    return "";
  }
}

export default function EventsStrip() {
  const { t, lang } = useT();

  const { data, isLoading } = useQuery({
    queryKey: ["events", { upcoming: true, strip: true }],
    queryFn: () => listEventsPaged({ page: 1, limit: 5, upcoming: true }),
  });

  const events = (data?.data ?? []).slice(0, 2);
  if (isLoading || events.length === 0) return null;

  return (
    <section style={{ marginBottom: "clamp(28px, 5vw, 40px)" }}>
      <SectionLabel>{t("showsAndMusic")}</SectionLabel>

      <div>
        {events.map((ev, i) => {
          const img =
            ev.coverImage || ev.imageUrl || ev.image || ev.images?.[0]?.url || ev.images?.[0];
          const meta = [
            t("eventTag"),
            formatDate(ev.startDate || ev.date, lang),
            ev.location,
          ].filter(Boolean);

          return (
            <Link
              key={ev._id}
              href={`/events/${ev._id}`}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 16,
                padding: "16px 0",
                borderTop: i === 0 ? "none" : "1px solid var(--card-border)",
              }}
            >
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 14,
                  overflow: "hidden",
                  background: "var(--bg-secondary)",
                  flexShrink: 0,
                }}
              >
                {img && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={img}
                    alt=""
                    loading="lazy"
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                )}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: 21,
                    color: "var(--text)",
                    marginBottom: 4,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {ev.title}
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    fontSize: 14,
                    color: "var(--text-muted)",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  <span
                    style={{
                      width: 9,
                      height: 9,
                      borderRadius: 5,
                      background: "#27C28A",
                      flexShrink: 0,
                    }}
                  />
                  {meta.join("  ·  ")}
                </div>
              </div>

              <span style={{ color: "var(--text-muted)", fontSize: 20, flexShrink: 0 }}>
                ›
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

export function SectionLabel({ children }) {
  return (
    <div
      style={{
        fontSize: 13,
        fontWeight: 700,
        color: "var(--accent)",
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        marginBottom: 6,
      }}
    >
      {children}
    </div>
  );
}