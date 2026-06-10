// src/components/ArtworkExploreCard.jsx
"use client";

import { useState } from "react";
import Link from "next/link";

import { useT } from "../i18n/index";

// Dimensions may be a string or { width, height, depth, unit }.
// Returns the aspect ratio (width/height) when numeric, else null.
function aspectFromDimensions(dim) {
  if (dim && typeof dim === "object") {
    const w = Number(dim.width);
    const h = Number(dim.height);
    if (w > 0 && h > 0) return w / h;
  }
  return null;
}

export default function ArtworkExploreCard({ artwork }) {
  const { t } = useT();

  // The image's true ratio, measured when it loads. This is the most reliable
  // source — it works for every image regardless of whether the artwork has
  // numeric `dimensions`, and matches what the viewer actually sees.
  const [naturalRatio, setNaturalRatio] = useState(null);

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

  // Prefer the image's measured ratio; fall back to the artwork's physical
  // dimensions; finally a portrait default until the image loads.
  const dimRatio = aspectFromDimensions(artwork.dimensions);
  const ratio = naturalRatio || dimRatio;
  const aspectRatio = ratio && isFinite(ratio) ? String(ratio) : "3 / 4";

  return (
    <Link
      href={`/artwork/${artwork._id}`}
      style={{
        display: "block",
        position: "relative",
        width: "100%",
        borderRadius: 22,
        overflow: "hidden",
        background: "var(--bg-secondary)",
        marginBottom: "clamp(16px, 3vw, 24px)",
        aspectRatio,
      }}
    >
      {img ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={img}
          alt={artwork.title || ""}
          loading="lazy"
          onLoad={(e) => {
            const { naturalWidth: w, naturalHeight: h } = e.currentTarget;
            if (w > 0 && h > 0) setNaturalRatio(w / h);
          }}
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
          }}
        >
          {t("appName")}
        </div>
      )}

      {/* Availability pill (top-right) */}
      <div
        style={{
          position: "absolute",
          top: 16,
          right: 16,
          display: "flex",
          alignItems: "center",
          gap: 7,
          padding: "7px 13px",
          borderRadius: 20,
          background: "rgba(0,0,0,0.55)",
          backdropFilter: "blur(6px)",
          color: "#fff",
          fontSize: 14,
          fontWeight: 600,
        }}
      >
        <span
          style={{
            width: 9,
            height: 9,
            borderRadius: 5,
            background: isAvailable ? "#27C28A" : "#B6AEA3",
          }}
        />
        {isAvailable
          ? t("available")
          : status === "sold"
            ? t("sold")
            : t("reserved")}
      </div>

      {/* Bottom gradient with title / artist / price */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          padding: "60px 22px 22px",
          background:
            "linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.35) 55%, rgba(0,0,0,0) 100%)",
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          gap: 16,
        }}
      >
        <div style={{ minWidth: 0 }}>
          <div
            style={{
              fontFamily: "var(--font-display)",
              fontSize: 28,
              color: "#fff",
              lineHeight: 1.1,
              marginBottom: 4,
            }}
          >
            {artwork.title || "Untitled"}
          </div>
          {artist && (
            <div style={{ fontSize: 16, color: "rgba(255,255,255,0.85)" }}>
              {artist}
            </div>
          )}
        </div>

        {artwork.price != null && (
          <div
            style={{
              fontSize: 18,
              fontWeight: 800,
              color: "#fff",
              whiteSpace: "nowrap",
            }}
          >
            {Number(artwork.price).toLocaleString()} {artwork.currency || "NOK"}
          </div>
        )}
      </div>
    </Link>
  );
}
