// src/components/ExploreCard.jsx
// Full-bleed feed card matching the mobile Explore page: one work per row at its
// real aspect ratio, with title/artist/price overlaid on a bottom gradient and
// an availability chip top-right.
"use client";

import Link from "next/link";

import { useT } from "../i18n/index";

// Aspect ratio from dimensions { width, height } when numeric; otherwise null
// so the image's own natural ratio is used (the <img> just flows at its size).
function ratioFromDimensions(dim) {
  if (dim && typeof dim === "object") {
    const w = Number(dim.width);
    const h = Number(dim.height);
    if (w > 0 && h > 0) return w / h;
  }
  return null;
}

export default function ExploreCard({ artwork }) {
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

  const ratio = ratioFromDimensions(artwork.dimensions);

  return (
    <Link
      href={`/artwork/${artwork._id}`}
      style={{
        display: "block",
        position: "relative",
        borderRadius: 20,
        overflow: "hidden",
        marginBottom: "clamp(16px, 3vw, 24px)",
        background: "var(--bg-secondary)",
        boxShadow: "var(--shadow)",
      }}
    >
      {/* Image — real aspect ratio; taller works take more vertical space */}
      {img ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={img}
          alt={artwork.title || ""}
          loading="lazy"
          style={{
            width: "100%",
            height: "auto",
            display: "block",
            ...(ratio ? { aspectRatio: String(ratio), objectFit: "cover" } : {}),
          }}
        />
      ) : (
        <div style={{ width: "100%", aspectRatio: "3 / 4" }} />
      )}

      {/* Availability chip */}
      <div
        style={{
          position: "absolute",
          top: 16,
          right: 16,
          display: "flex",
          alignItems: "center",
          gap: 7,
          padding: "6px 12px",
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
            background: isAvailable ? "#27C28A" : "#C9A227",
          }}
        />
        {isAvailable
          ? t("available")
          : status === "sold"
            ? t("sold")
            : t("reserved")}
      </div>

      {/* Bottom gradient + info overlay */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          padding: "48px 22px 20px",
          background:
            "linear-gradient(to top, rgba(0,0,0,0.78) 0%, rgba(0,0,0,0.35) 55%, rgba(0,0,0,0) 100%)",
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
              fontSize: "clamp(24px, 5vw, 30px)",
              fontWeight: 700,
              color: "#fff",
              lineHeight: 1.1,
              marginBottom: 4,
              textShadow: "0 1px 6px rgba(0,0,0,0.4)",
            }}
          >
            {artwork.title || "Untitled"}
          </div>
          {artist && (
            <div
              style={{
                fontSize: 16,
                color: "rgba(255,255,255,0.88)",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
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
              textShadow: "0 1px 6px rgba(0,0,0,0.4)",
            }}
          >
            {Number(artwork.price).toLocaleString()} {artwork.currency || "NOK"}
          </div>
        )}
      </div>
    </Link>
  );
}
