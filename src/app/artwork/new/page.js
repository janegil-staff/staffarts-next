// src/app/artwork/new/page.js
"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useT } from "../../../i18n/index";
import { useAuthStore } from "../../../store/authStore";
import { createArtwork } from "../../../api/artwork";
import { uploadArtworkImage } from "../../../lib/uploadArtworkImage";

const CURRENCIES = ["NOK", "EUR", "USD", "GBP", "SEK", "DKK"];
const UNITS = ["cm", "in", "mm"];
const STATUSES = ["available", "reserved", "sold"];

export default function NewArtworkPage() {
  const { t } = useT();
  const router = useRouter();
  const qc = useQueryClient();
  const authed = useAuthStore((s) => s.status === "authed");
  const fileRef = useRef(null);

  const [form, setForm] = useState({
    title: "",
    description: "",
    medium: "",
    year: "",
    width: "",
    height: "",
    depth: "",
    unit: "cm",
    price: "",
    currency: "NOK",
    status: "available",
  });
  const [images, setImages] = useState([]); // array of uploaded URLs
  const [uploading, setUploading] = useState(false);
  const [err, setErr] = useState(null);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const mutation = useMutation({
    mutationFn: () => {
      const payload = {
        title: form.title.trim(),
        description: form.description.trim() || undefined,
        medium: form.medium.trim() || undefined,
        year: form.year ? Number(form.year) : undefined,
        price: form.price ? Number(form.price) : undefined,
        currency: form.currency,
        status: form.status,
        images: images,
        dimensions: {
          width: form.width ? Number(form.width) : null,
          height: form.height ? Number(form.height) : null,
          depth: form.depth ? Number(form.depth) : null,
          unit: form.unit,
        },
      };
      return createArtwork(payload);
    },
    onSuccess: (created) => {
      qc.invalidateQueries({ queryKey: ["artworks"] });
      qc.invalidateQueries({ queryKey: ["artworks", "by-artist"] });
      router.push(created?._id ? `/artwork/${created._id}` : "/profile");
    },
    onError: (e) => setErr(e?.response?.data?.message || t("error")),
  });

  async function onPickImage(e) {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setErr(null);
    setUploading(true);
    try {
      // Upload sequentially so each gets its own signed request.
      for (const file of files) {
        const url = await uploadArtworkImage(file);
        setImages((prev) => [...prev, url]);
      }
    } catch (e2) {
      setErr(e2?.message || t("error"));
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  function removeImage(idx) {
    setImages((prev) => prev.filter((_, i) => i !== idx));
  }

  if (!authed) {
    return (
      <div style={{ textAlign: "center", padding: 80 }}>
        <p style={{ color: "var(--text-muted)", marginBottom: 16 }}>
          {t("signInTitle")}
        </p>
        <button onClick={() => router.push("/login")} style={primaryBtn}>
          {t("signIn")}
        </button>
      </div>
    );
  }

  const canSave = form.title.trim() && !mutation.isPending && !uploading;

  return (
    <div
      style={{
        maxWidth: 600,
        margin: "0 auto",
        padding: "clamp(24px,5vw,44px) clamp(16px,5vw,24px) 60px",
      }}
    >
      <Link
        href="/profile"
        style={{ color: "var(--text-muted)", fontSize: 14, display: "inline-block", marginBottom: 18 }}
      >
        ‹ {t("navProfile")}
      </Link>

      <h1 style={{ fontSize: "clamp(26px,5vw,36px)", margin: "0 0 24px" }}>
        {t("addArtwork")}
      </h1>

      {/* Images */}
      <div style={{ marginBottom: 20 }}>
        <span style={{ ...fieldLabel }}>{t("addImage")}</span>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 12,
            alignItems: "flex-start",
          }}
        >
          {images.map((url, idx) => (
            <div
              key={url + idx}
              style={{
                position: "relative",
                width: "min(240px, 100%)",
                borderRadius: 12,
                overflow: "hidden",
                border: "1px solid var(--card-border)",
                background: "var(--bg-secondary)",
              }}
            >
              {/* Real aspect ratio: fixed width, auto height. The browser sizes
                  the height from the image's intrinsic dimensions, so tall and
                  wide works are shown uncropped. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={url}
                alt=""
                style={{ width: "100%", height: "auto", display: "block" }}
              />
              <button
                onClick={() => removeImage(idx)}
                aria-label={t("cancel")}
                style={{
                  position: "absolute",
                  top: 6,
                  right: 6,
                  width: 26,
                  height: 26,
                  borderRadius: 13,
                  border: "none",
                  background: "rgba(0,0,0,0.6)",
                  color: "#fff",
                  fontSize: 14,
                  lineHeight: 1,
                  cursor: "pointer",
                }}
              >
                ✕
              </button>
              {idx === 0 && (
                <span
                  style={{
                    position: "absolute",
                    top: 6,
                    left: 6,
                    fontSize: 11,
                    fontWeight: 700,
                    padding: "3px 8px",
                    borderRadius: 12,
                    background: "var(--accent)",
                    color: "#fff",
                  }}
                >
                  {t("coverLabel")}
                </span>
              )}
            </div>
          ))}

          {/* Add tile */}
          <button
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            style={{
              width: "min(240px, 100%)",
              height: 64,
              borderRadius: 12,
              border: "2px dashed var(--card-border)",
              background: "var(--bg-secondary)",
              color: "var(--text-muted)",
              fontSize: 22,
              cursor: "pointer",
            }}
          >
            {uploading ? "…" : "+"}
          </button>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          onChange={onPickImage}
          style={{ display: "none" }}
        />
      </div>

      <Field label={t("artworkTitle")} value={form.title} onChange={set("title")} />

      <label style={fieldWrap}>
        <span style={fieldLabel}>{t("aboutWork")}</span>
        <textarea
          value={form.description}
          onChange={set("description")}
          rows={4}
          style={{ ...inputStyle, resize: "vertical" }}
        />
      </label>

      <Field label={t("medium")} value={form.medium} onChange={set("medium")} />

      <div style={{ display: "flex", gap: 12 }}>
        <Field label={t("year")} type="number" value={form.year} onChange={set("year")} />
        <div style={{ flex: 1 }}>
          <span style={fieldLabel}>{t("status")}</span>
          <select value={form.status} onChange={set("status")} style={inputStyle}>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s === "available" ? t("available") : s === "sold" ? t("sold") : t("reserved")}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Dimensions */}
      <span style={{ ...fieldLabel, marginTop: 8 }}>{t("dimensions")}</span>
      <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
        <BareInput placeholder="W" type="number" value={form.width} onChange={set("width")} />
        <BareInput placeholder="H" type="number" value={form.height} onChange={set("height")} />
        <BareInput placeholder="D" type="number" value={form.depth} onChange={set("depth")} />
        <select value={form.unit} onChange={set("unit")} style={{ ...inputStyle, width: 80 }}>
          {UNITS.map((u) => (
            <option key={u} value={u}>{u}</option>
          ))}
        </select>
      </div>

      {/* Price */}
      <span style={fieldLabel}>{t("price")}</span>
      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        <BareInput placeholder="0" type="number" value={form.price} onChange={set("price")} />
        <select value={form.currency} onChange={set("currency")} style={{ ...inputStyle, width: 100 }}>
          {CURRENCIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {err && <p style={{ color: "var(--accent)", fontSize: 14 }}>{err}</p>}

      <button
        onClick={() => mutation.mutate()}
        disabled={!canSave}
        style={{ ...primaryBtn, width: "100%", opacity: canSave ? 1 : 0.6 }}
      >
        {mutation.isPending ? t("loading") : t("addArtwork")}
      </button>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  background: "var(--card)",
  border: "1px solid var(--card-border)",
  borderRadius: 10,
  padding: "11px 14px",
  color: "var(--text)",
  fontSize: 15,
};
const fieldWrap = { display: "block", marginBottom: 14 };
const fieldLabel = {
  display: "block",
  fontSize: 13,
  color: "var(--text-muted)",
  marginBottom: 6,
};
const primaryBtn = {
  background: "var(--accent)",
  color: "#fff",
  border: "none",
  borderRadius: 10,
  padding: "12px 20px",
  fontSize: 15,
};

function Field({ label, type = "text", value, onChange }) {
  return (
    <label style={fieldWrap}>
      <span style={fieldLabel}>{label}</span>
      <input type={type} value={value} onChange={onChange} style={inputStyle} />
    </label>
  );
}

function BareInput({ placeholder, type = "text", value, onChange }) {
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      style={{ ...inputStyle, flex: 1, minWidth: 0 }}
    />
  );
}
