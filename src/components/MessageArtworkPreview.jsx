// src/components/MessageArtworkPreview.jsx
// Renders the small artwork card embedded in a chat message when the message
// references an art piece (artworkRef). Handles two shapes from the API:
//   - populated object: { _id, title, imageUrl|images, price, currency }
//   - bare id string: we fetch the artwork to show its image/title.
"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";

import { fetchArtwork } from "../api/artwork";

function imageOf(a) {
  return (
    a?.imageUrl || a?.image || a?.images?.[0]?.url || a?.images?.[0] || null
  );
}

export default function MessageArtworkPreview({ artworkRef, mine }) {
  // Determine whether we already have a populated object or just an id.
  const isPopulated =
    artworkRef && typeof artworkRef === "object" && (artworkRef.title || imageOf(artworkRef));
  const id =
    typeof artworkRef === "string"
      ? artworkRef
      : artworkRef?._id || artworkRef?.id || null;

  // Only fetch when we have an id but no populated data.
  const { data: fetched } = useQuery({
    queryKey: ["artwork", id],
    queryFn: () => fetchArtwork(id),
    enabled: !!id && !isPopulated,
    staleTime: 5 * 60_000,
  });

  const art = isPopulated ? artworkRef : fetched;
  if (!art) return null;

  const img = imageOf(art);
  const border = mine ? "rgba(255,255,255,0.35)" : "var(--card-border)";
  const subColor = mine ? "rgba(255,255,255,0.8)" : "var(--text-muted)";

  return (
    <Link
      href={`/artwork/${art._id || id}`}
      style={{
        display: "flex",
        gap: 10,
        alignItems: "center",
        marginBottom: 8,
        padding: 8,
        borderRadius: 10,
        border: `1px solid ${border}`,
        background: mine ? "rgba(255,255,255,0.12)" : "var(--bg-secondary)",
        textDecoration: "none",
      }}
    >
      <div
        style={{
          width: 46,
          height: 46,
          borderRadius: 8,
          overflow: "hidden",
          flexShrink: 0,
          background: "var(--bg-secondary)",
        }}
      >
        {img && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={img}
            alt=""
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        )}
      </div>
      <div style={{ minWidth: 0 }}>
        <div
          style={{
            fontSize: 13,
            fontWeight: 700,
            color: mine ? "#fff" : "var(--text)",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {art.title || "Untitled"}
        </div>
        {art.price != null && (
          <div style={{ fontSize: 12, color: subColor }}>
            {Number(art.price).toLocaleString()} {art.currency || "NOK"}
          </div>
        )}
      </div>
    </Link>
  );
}
