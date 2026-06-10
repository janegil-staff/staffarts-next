// src/components/ArtworkCard.jsx
"use client";

import Link from "next/link";

import { useT } from "../i18n/index";

function statusLabel(t, status) {
  if (status === "sold") return t("sold");
  if (status === "reserved") return t("reserved");
  return t("available");
}

export default function ArtworkCard({ artwork }) {
  const { t } = useT();
  const img =
    artwork.imageUrl ||
    artwork.image ||
    artwork.images?.[0]?.url ||
    artwork.images?.[0] ||
    null;
  const status = artwork.status || (artwork.available ? "available" : null);

  return (
    <Link
      href={`/artwork/${artwork._id}`}
      style={{
        display: "block",
        background: "var(--card)",
        border: "1px solid var(--card-border)",
        borderRadius: 12,
        overflow: "hidden",
        boxShadow: "var(--shadow)",
      }}
    >
      <div
        style={{
          aspectRatio: "4 / 5",
          background: "var(--bg-secondary)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {img ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={img}
            alt={artwork.title || ""}
            loading="lazy"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
            }}
          />
        ) : (
          <div
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--text-muted)",
              fontSize: 13,
            }}
          >
            {t("appName")}
          </div>
        )}
        {status && (
          <span
            style={{
              position: "absolute",
              top: 10,
              left: 10,
              fontSize: 11,
              fontWeight: 600,
              padding: "3px 8px",
              borderRadius: 20,
              background:
                status === "sold"
                  ? "rgba(0,0,0,0.6)"
                  : "var(--accent)",
              color: "#fff",
            }}
          >
            {statusLabel(t, status)}
          </span>
        )}
      </div>
      <div style={{ padding: "12px 14px 16px" }}>
        <div
          style={{
            fontFamily: "var(--font-display)",
            fontSize: 16,
            marginBottom: 2,
          }}
        >
          {artwork.title || "Untitled"}
        </div>
        {artwork.medium && (
          <div style={{ fontSize: 13, color: "var(--text-muted)" }}>
            {artwork.medium}
          </div>
        )}
        {artwork.price != null && (
          <div style={{ fontSize: 14, marginTop: 6, color: "var(--navy)" }}>
            {artwork.currency || "kr"} {Number(artwork.price).toLocaleString()}
          </div>
        )}
      </div>
    </Link>
  );
}
