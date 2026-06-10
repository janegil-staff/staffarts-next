// src/components/ArtworkGridCard.jsx (exported default; filename kept as
// ArtworkFeedCard.jsx for drop-in compatibility).
//
// Grid tile matching the mobile "JUST ADDED" section: square rounded thumbnail
// with a green availability dot, then title / artist / price below.
"use client";

import Link from "next/link";

import { useT } from "../i18n/index";

export default function ArtworkFeedCard({ artwork }) {
  const { t } = useT();

  const img =
    artwork.imageUrl ||
    artwork.image ||
    artwork.images?.[0]?.url ||
    artwork.images?.[0] ||
    null;

  const status = artwork.status || (artwork.available ? "available" : null);
  const isAvailable = status === "available" || status == null;
  const artist =
    artwork.artist?.displayName ||
    artwork.createdBy?.displayName ||
    artwork.artistName ||
    null;

  return (
    <Link href={`/artwork/${artwork._id}`} style={{ display: "block" }}>
      <div
        style={{
          position: "relative",
          width: "100%",
          aspectRatio: "1 / 1",
          borderRadius: 14,
          overflow: "hidden",
          background: "var(--bg-secondary)",
          marginBottom: 8,
        }}
      >
        {img ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={img}
            alt={artwork.title || ""}
            loading="lazy"
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
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
              fontSize: 12,
            }}
          >
            {t("appName")}
          </div>
        )}

        {/* Availability dot — green when available, muted when not */}
        <span
          style={{
            position: "absolute",
            top: 10,
            right: 10,
            width: 22,
            height: 22,
            borderRadius: 11,
            background: "rgba(255,255,255,0.92)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          title={isAvailable ? t("available") : status === "sold" ? t("sold") : t("reserved")}
        >
          <span
            style={{
              width: 11,
              height: 11,
              borderRadius: 6,
              background: isAvailable ? "#27C28A" : "#B6AEA3",
            }}
          />
        </span>
      </div>

      <div
        style={{
          fontFamily: "var(--font-display)",
          fontSize: 17,
          color: "var(--text)",
          lineHeight: 1.2,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {artwork.title || "Untitled"}
      </div>
      {artist && (
        <div
          style={{
            fontSize: 14,
            color: "var(--text-muted)",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {artist}
        </div>
      )}
      {artwork.price != null && (
        <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text)", marginTop: 2 }}>
          {Number(artwork.price).toLocaleString()} {artwork.currency || "NOK"}
        </div>
      )}
    </Link>
  );
}