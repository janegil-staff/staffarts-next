// src/app/artwork/[id]/page.js
"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { useT } from "../../../i18n/index";
import { fetchArtwork, deleteArtwork } from "../../../api/artwork";
import { findConversationWith } from "../../../api/messages";
import { useAuthStore } from "../../../store/authStore";

export default function ArtworkDetailPage({ params }) {
  const { id } = use(params);
  const { t } = useT();
  const router = useRouter();
  const qc = useQueryClient();
  const authed = useAuthStore((s) => s.status === "authed");
  const me = useAuthStore((s) => s.user);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const { data: art, isLoading, isError } = useQuery({
    queryKey: ["artwork", id],
    queryFn: () => fetchArtwork(id),
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteArtwork(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["artworks"] });
      qc.invalidateQueries({ queryKey: ["artworks", "by-artist"] });
      router.push("/profile");
    },
  });

  async function handleContact() {
    if (!authed) {
      router.push("/login");
      return;
    }
    const artistId = art?.artist?._id || art?.artist || art?.createdBy?._id;
    if (!artistId) return;
    // Reuse an existing thread if one exists; otherwise the messages page
    // opens a fresh compose against this user.
    let convId = null;
    try {
      convId = await findConversationWith(artistId);
    } catch {}
    // Always carry the artwork id so the first message in the thread can attach
    // the artwork preview, whether the thread is new or already exists.
    const qs = new URLSearchParams({ to: String(artistId), artwork: String(id) });
    router.push(
      convId
        ? `/messages?c=${convId}&artwork=${encodeURIComponent(String(id))}`
        : `/messages?${qs.toString()}`,
    );
  }

  if (isLoading)
    return <Centered>{t("loading")}</Centered>;
  if (isError || !art)
    return <Centered>{t("error")}</Centered>;

  const img =
    art.imageUrl || art.image || art.images?.[0]?.url || art.images?.[0] || null;
  const status = art.status || (art.available ? "available" : null);

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "clamp(20px,4vw,40px)" }}>
      <Link
        href="/"
        style={{ color: "var(--text-muted)", fontSize: 14, display: "inline-block", marginBottom: 20 }}
      >
        ‹ {t("backToGallery")}
      </Link>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "clamp(20px, 4vw, 32px)",
        }}
        className="art-detail-grid"
      >
        <div
          style={{
            background: "var(--bg-secondary)",
            borderRadius: 14,
            overflow: "hidden",
            border: "1px solid var(--card-border)",
          }}
        >
          {img ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={img}
              alt={art.title || ""}
              style={{
                width: "100%",
                height: "auto",
                display: "block",
              }}
            />
          ) : (
            <div style={{ aspectRatio: "4/5" }} />
          )}
        </div>

        <div>
          {status && (
            <span
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: status === "sold" ? "var(--text-muted)" : "var(--accent)",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
              }}
            >
              {status === "sold" ? t("sold") : status === "reserved" ? t("reserved") : t("available")}
            </span>
          )}
          <h1 style={{ fontSize: "clamp(26px,4vw,38px)", margin: "8px 0 4px" }}>
            {art.title || "Untitled"}
          </h1>
          {(art.artist?.displayName || art.createdBy?.displayName) &&
            (() => {
              const artistId =
                art.artist?._id ||
                (typeof art.artist === "string" ? art.artist : null) ||
                art.createdBy?._id;
              const artistName =
                art.artist?.displayName || art.createdBy?.displayName;
              const style = { color: "var(--text-muted)", margin: "0 0 18px" };
              return artistId ? (
                <p style={style}>
                  <Link
                    href={`/users/${artistId}`}
                    style={{ color: "var(--accent)" }}
                  >
                    {artistName}
                  </Link>
                </p>
              ) : (
                <p style={style}>{artistName}</p>
              );
            })()}

          {art.price != null ? (
            <p style={{ fontSize: 20, color: "var(--navy)", margin: "0 0 20px" }}>
              {art.currency || "kr"} {Number(art.price).toLocaleString()}
            </p>
          ) : (
            <p style={{ color: "var(--text-muted)", margin: "0 0 20px" }}>
              {t("priceOnRequest")}
            </p>
          )}

          {(() => {
            const artistId =
              art.artist?._id ||
              (typeof art.artist === "string" ? art.artist : null) ||
              art.createdBy?._id ||
              art.createdBy;
            const myId = me?._id || me?.id;
            const isMine = myId && artistId && String(myId) === String(artistId);

            if (isMine) {
              return confirmDelete ? (
                <div style={{ marginBottom: 28 }}>
                  <p style={{ fontSize: 14, color: "var(--text)", marginTop: 0 }}>
                    {t("deleteConfirm")}
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
                      {deleteMutation.isPending ? t("loading") : t("deleteArtwork")}
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
                    background: "transparent",
                    color: "#C0392B",
                    border: "1px solid #C0392B",
                    borderRadius: 10,
                    padding: "12px 22px",
                    fontSize: 15,
                    marginBottom: 28,
                  }}
                >
                  {t("deleteArtwork")}
                </button>
              );
            }

            return (
              <button
                onClick={handleContact}
                style={{
                  background: "var(--accent)",
                  color: "#fff",
                  border: "none",
                  borderRadius: 10,
                  padding: "12px 22px",
                  fontSize: 15,
                  marginBottom: 28,
                }}
              >
                {t("contactArtist")}
              </button>
            );
          })()}

          {art.description && (
            <section style={{ marginBottom: 20 }}>
              <h2 style={{ fontSize: 15, marginBottom: 8 }}>{t("aboutWork")}</h2>
              <p
                style={{
                  lineHeight: 1.6,
                  color: "var(--text)",
                  margin: 0,
                  whiteSpace: "pre-wrap",
                }}
              >
                {art.description}
              </p>
            </section>
          )}

          <dl style={{ display: "grid", gap: 8, margin: 0 }}>
            <Detail label={t("medium")} value={art.medium} />
            <Detail label={t("dimensions")} value={formatDimensions(art.dimensions)} />
            <Detail label={t("year")} value={art.year} />
          </dl>
        </div>
      </div>

      <style>{`
        @media (max-width: 720px) {
          .art-detail-grid { gap: 16px !important; }
        }
      `}</style>
    </div>
  );
}

// Dimensions may arrive as a string or as { width, height, depth, unit }.
// Render a compact "W × H × D unit" string; omit missing parts.
function formatDimensions(dim) {
  if (dim == null) return null;
  if (typeof dim === "string") return dim;
  if (typeof dim === "object") {
    const { width, height, depth, unit } = dim;
    const parts = [width, height, depth].filter((n) => n != null && n !== "");
    if (parts.length === 0) return null;
    return parts.join(" × ") + (unit ? ` ${unit}` : "");
  }
  return String(dim);
}

function Detail({ label, value }) {
  if (value == null || value === "") return null;
  // Never render a raw object — coerce defensively in case an API field shape
  // differs from what's expected.
  const display = typeof value === "object" ? JSON.stringify(value) : value;
  return (
    <div style={{ display: "flex", gap: 10, fontSize: 14 }}>
      <dt style={{ color: "var(--text-muted)", minWidth: 96 }}>{label}</dt>
      <dd style={{ margin: 0 }}>{display}</dd>
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
