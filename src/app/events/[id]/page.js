// src/app/events/[id]/page.js
"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { useT } from "../../../i18n/index";
import { fetchEvent, deleteEvent } from "../../../api/event";
import { useAuthStore } from "../../../store/authStore";

function formatDateTime(d, lang) {
  if (!d) return "";
  try {
    return new Date(d).toLocaleString(lang, {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  } catch {
    return String(d);
  }
}

function formatDateOnly(d, lang) {
  if (!d) return "";
  try {
    return new Date(d).toLocaleDateString(lang, {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return String(d);
  }
}

export default function EventDetailPage({ params }) {
  const { id } = use(params);
  const { t, lang } = useT();

  const { data: ev, isLoading, isError } = useQuery({
    queryKey: ["event", id],
    queryFn: () => fetchEvent(id),
    enabled: !!id,
  });

  const router = useRouter();
  const qc = useQueryClient();
  const me = useAuthStore((s) => s.user);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const deleteMutation = useMutation({
    mutationFn: () => deleteEvent(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["events"] });
      router.push("/events");
    },
  });

  if (isLoading)
    return <Centered>{t("loading")}</Centered>;
  if (isError || !ev)
    return <Centered>{t("error")}</Centered>;

  const img =
    ev.coverImage || ev.imageUrl || ev.image || ev.images?.[0]?.url || ev.images?.[0] || null;
  const start = ev.startDate || ev.date;
  const end = ev.endDate || null;

  return (
    <div style={{ maxWidth: 760, margin: "0 auto", padding: "clamp(20px,4vw,40px)" }}>
      <Link
        href="/events"
        style={{
          color: "var(--text-muted)",
          fontSize: 14,
          display: "inline-block",
          marginBottom: 18,
        }}
      >
        ‹ {t("eventsTitle")}
      </Link>

      {img && (
        <div
          style={{
            width: "100%",
            borderRadius: 18,
            overflow: "hidden",
            marginBottom: 24,
            background: "var(--bg-secondary)",
            border: "1px solid var(--card-border)",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={img}
            alt={ev.title || ""}
            style={{ width: "100%", display: "block" }}
          />
        </div>
      )}

      {ev.category && (
        <div
          style={{
            fontSize: 12,
            fontWeight: 700,
            color: "var(--accent)",
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            marginBottom: 6,
          }}
        >
          {ev.category}
        </div>
      )}

      <h1 style={{ fontSize: "clamp(28px,5vw,42px)", margin: "0 0 16px" }}>
        {ev.title}
      </h1>

      <dl style={{ display: "grid", gap: 12, margin: "0 0 24px" }}>
        <Detail
          label={t("upcoming")}
          value={
            end
              ? `${formatDateOnly(start, lang)} – ${formatDateOnly(end, lang)}`
              : formatDateTime(start, lang)
          }
        />
        <Detail label={t("eventsSubtitle")} value={ev.location} />
        {ev.createdBy?.displayName &&
          (() => {
            const creatorId = ev.createdBy?._id || ev.createdBy?.id;
            const name = ev.createdBy.displayName;
            return (
              <div style={{ display: "flex", gap: 12, fontSize: 15 }}>
                <dt
                  style={{
                    color: "var(--text-muted)",
                    minWidth: 110,
                    fontSize: 13,
                    textTransform: "uppercase",
                    letterSpacing: "0.04em",
                    paddingTop: 1,
                  }}
                >
                  {t("navProfile")}
                </dt>
                <dd style={{ margin: 0 }}>
                  {creatorId ? (
                    <Link href={`/users/${creatorId}`} style={{ color: "var(--accent)" }}>
                      {name}
                    </Link>
                  ) : (
                    <span style={{ color: "var(--text)" }}>{name}</span>
                  )}
                </dd>
              </div>
            );
          })()}
      </dl>

      {ev.description && (
        <div style={{ lineHeight: 1.7, fontSize: 16, color: "var(--text)" }}>
          {ev.description.split("\n").map((para, i) =>
            para.trim() ? <p key={i} style={{ margin: "0 0 14px" }}>{para}</p> : null,
          )}
        </div>
      )}

      {ev.url && (
        <a
          href={ev.url}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "inline-block",
            marginTop: 12,
            background: "var(--accent)",
            color: "#fff",
            padding: "12px 22px",
            borderRadius: 10,
            fontSize: 15,
          }}
        >
          {t("viewEvent")}
        </a>
      )}

      {/* Owner-only delete */}
      {(() => {
        const creatorId = ev.createdBy?._id || ev.createdBy?.id || ev.createdBy;
        const myId = me?._id || me?.id;
        const isMine = myId && creatorId && String(myId) === String(creatorId);
        if (!isMine) return null;
        return confirmDelete ? (
          <div style={{ marginTop: 28 }}>
            <p style={{ fontSize: 14, color: "var(--text)", marginTop: 0 }}>
              {t("deleteEventConfirm")}
            </p>
            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={() => deleteMutation.mutate()}
                disabled={deleteMutation.isPending}
                style={{
                  background: "#C0392B",
                  color: "#fff",
                  border: "none",
                  borderRadius: 10,
                  padding: "11px 20px",
                  fontSize: 15,
                }}
              >
                {deleteMutation.isPending ? t("loading") : t("deleteEvent")}
              </button>
              <button
                onClick={() => setConfirmDelete(false)}
                style={{
                  background: "transparent",
                  border: "1px solid var(--card-border)",
                  borderRadius: 10,
                  padding: "11px 20px",
                  fontSize: 15,
                  color: "var(--text)",
                }}
              >
                {t("cancel")}
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setConfirmDelete(true)}
            style={{
              marginTop: 28,
              display: "block",
              background: "transparent",
              color: "#C0392B",
              border: "1px solid #C0392B",
              borderRadius: 10,
              padding: "11px 20px",
              fontSize: 15,
            }}
          >
            {t("deleteEvent")}
          </button>
        );
      })()}
    </div>
  );
}

function Detail({ label, value }) {
  if (value == null || value === "") return null;
  const display = typeof value === "object" ? JSON.stringify(value) : value;
  return (
    <div style={{ display: "flex", gap: 12, fontSize: 15 }}>
      <dt
        style={{
          color: "var(--text-muted)",
          minWidth: 110,
          fontSize: 13,
          textTransform: "uppercase",
          letterSpacing: "0.04em",
          paddingTop: 1,
        }}
      >
        {label}
      </dt>
      <dd style={{ margin: 0, color: "var(--text)" }}>{display}</dd>
    </div>
  );
}

function Centered({ children }) {
  return (
    <div style={{ textAlign: "center", padding: 80, color: "var(--text-muted)" }}>
      {children}
    </div>
  );
}
