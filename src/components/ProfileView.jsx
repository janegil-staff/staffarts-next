// src/components/ProfileView.jsx
"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { useT } from "../i18n/index";
import { listArtworks } from "../api/artwork";
import { updateProfile } from "../api/user";
import { uploadAvatar } from "../lib/uploadAvatar";
import ArtworkFeedCard from "./ArtworkFeedCard";

export default function ProfileView({ user, editable = false, onUserUpdate }) {
  const { t } = useT();
  const qc = useQueryClient();
  const fileRef = useRef(null);

  const [editing, setEditing] = useState(false);
  const [displayName, setDisplayName] = useState(user?.displayName || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [uploading, setUploading] = useState(false);
  const [err, setErr] = useState(null);

  const userId = user?._id || user?.id;
  const avatar = user?.profileImage || user?.avatar || user?.avatarUrl || null;

  // This user's artworks.
  const { data: works = [], isLoading } = useQuery({
    queryKey: ["artworks", "by-artist", userId],
    queryFn: () => listArtworks({ artist: userId, sort: "-createdAt" }),
    enabled: !!userId,
  });

  const saveMutation = useMutation({
    mutationFn: () => updateProfile({ displayName, bio }),
    onSuccess: (updated) => {
      setEditing(false);
      onUserUpdate?.(updated);
      qc.invalidateQueries({ queryKey: ["me"] });
    },
    onError: (e) => setErr(e?.response?.data?.message || t("error")),
  });

  async function onPickAvatar(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setErr(null);
    setUploading(true);
    try {
      const updated = await uploadAvatar(file);
      onUserUpdate?.(updated);
      qc.invalidateQueries({ queryKey: ["me"] });
    } catch (e2) {
      setErr(e2?.message || t("error"));
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <div
      style={{
        maxWidth: 720,
        margin: "0 auto",
        padding: "clamp(24px, 5vw, 44px) clamp(16px, 5vw, 28px) 60px",
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", gap: 20, alignItems: "center", marginBottom: 24 }}>
        <div style={{ position: "relative" }}>
          <div
            style={{
              width: 88,
              height: 88,
              borderRadius: 44,
              overflow: "hidden",
              background: "var(--bg-secondary)",
              border: "1px solid var(--card-border)",
            }}
          >
            {avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={avatar}
                alt=""
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : (
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 32,
                  fontFamily: "var(--font-display)",
                  color: "var(--text-muted)",
                }}
              >
                {(user?.displayName || "?").charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          {editable && (
            <>
              <button
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                style={{
                  position: "absolute",
                  bottom: -2,
                  right: -2,
                  width: 30,
                  height: 30,
                  borderRadius: 15,
                  border: "2px solid var(--bg)",
                  background: "var(--accent)",
                  color: "#fff",
                  fontSize: 14,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                title={t("editProfile")}
              >
                {uploading ? "…" : "✎"}
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                onChange={onPickAvatar}
                style={{ display: "none" }}
              />
            </>
          )}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          {editing ? (
            <input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              style={{
                width: "100%",
                fontFamily: "var(--font-display)",
                fontSize: 26,
                background: "var(--card)",
                border: "1px solid var(--card-border)",
                borderRadius: 10,
                padding: "6px 12px",
                color: "var(--text)",
              }}
            />
          ) : (
            <h1 style={{ fontSize: "clamp(26px,5vw,34px)", margin: 0 }}>
              {user?.displayName || "—"}
            </h1>
          )}
          {editable && !editing && (
            <button
              onClick={() => setEditing(true)}
              style={{
                marginTop: 8,
                padding: "6px 14px",
                borderRadius: 16,
                fontSize: 13,
                border: "1px solid var(--card-border)",
                background: "transparent",
                color: "var(--text-muted)",
              }}
            >
              {t("editProfile")}
            </button>
          )}
        </div>
      </div>

      {/* Bio */}
      {editing ? (
        <div style={{ marginBottom: 16 }}>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={3}
            placeholder={t("bio")}
            style={{
              width: "100%",
              background: "var(--card)",
              border: "1px solid var(--card-border)",
              borderRadius: 10,
              padding: "10px 14px",
              color: "var(--text)",
              fontSize: 14,
              resize: "vertical",
            }}
          />
          {err && <p style={{ color: "var(--accent)", fontSize: 14 }}>{err}</p>}
          <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
            <button
              onClick={() => saveMutation.mutate()}
              disabled={saveMutation.isPending}
              style={{
                background: "var(--accent)",
                color: "#fff",
                border: "none",
                borderRadius: 10,
                padding: "9px 18px",
                fontSize: 14,
              }}
            >
              {saveMutation.isPending ? t("loading") : t("saveChanges")}
            </button>
            <button
              onClick={() => {
                setEditing(false);
                setDisplayName(user?.displayName || "");
                setBio(user?.bio || "");
                setErr(null);
              }}
              style={{
                background: "transparent",
                border: "1px solid var(--card-border)",
                borderRadius: 10,
                padding: "9px 18px",
                fontSize: 14,
                color: "var(--text)",
              }}
            >
              {t("cancel")}
            </button>
          </div>
        </div>
      ) : (
        user?.bio && (
          <p style={{ color: "var(--text)", lineHeight: 1.6, marginBottom: 28, whiteSpace: "pre-wrap" }}>
            {user.bio}
          </p>
        )
      )}

      {/* Works */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginTop: 12,
          marginBottom: 16,
        }}
      >
        <h2 style={{ fontSize: 18, margin: 0 }}>{t("myWorks")}</h2>
        {editable && (
          <Link
            href="/artwork/new"
            style={{
              background: "var(--accent)",
              color: "#fff",
              padding: "8px 16px",
              borderRadius: 20,
              fontSize: 14,
              fontWeight: 600,
            }}
          >
            + {t("addArtwork")}
          </Link>
        )}
      </div>
      {isLoading ? (
        <p style={{ color: "var(--text-muted)" }}>{t("loading")}</p>
      ) : works.length === 0 ? (
        <p style={{ color: "var(--text-muted)" }}>{t("noArtworks")}</p>
      ) : (
        <div className="artwork-grid">
          {works.map((a) => (
            <ArtworkFeedCard key={a._id} artwork={a} />
          ))}
        </div>
      )}
    </div>
  );
}
