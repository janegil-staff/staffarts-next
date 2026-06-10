// src/app/events/new/page.js
"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useT } from "../../../i18n/index";
import { useAuthStore } from "../../../store/authStore";
import { createEvent } from "../../../api/event";
import { uploadEventImage } from "../../../lib/uploadEventImage";

const CATEGORIES = ["exhibition", "show", "workshop", "talk", "other"];
const CURRENCIES = ["NOK", "EUR", "USD", "GBP", "SEK", "DKK"];

export default function NewEventPage() {
  const { t } = useT();
  const router = useRouter();
  const qc = useQueryClient();
  const authed = useAuthStore((s) => s.status === "authed");
  const fileRef = useRef(null);

  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "exhibition",
    date: "",
    location: "",
    isFree: false,
    price: "",
    currency: "NOK",
  });
  const [coverImage, setCoverImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [err, setErr] = useState(null);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const mutation = useMutation({
    mutationFn: () => {
      const payload = {
        title: form.title.trim(),
        description: form.description.trim() || undefined,
        category: form.category,
        date: form.date ? new Date(form.date).toISOString() : undefined,
        location: form.location.trim() || "",
        isFree: form.isFree,
        coverImage: coverImage || undefined,
      };
      // Only attach price/currency for paid events.
      if (!form.isFree && form.price) {
        payload.price = Number(form.price);
        payload.currency = form.currency;
      }
      return createEvent(payload);
    },
    onSuccess: (created) => {
      qc.invalidateQueries({ queryKey: ["events"] });
      router.push(created?._id ? `/events/${created._id}` : "/events");
    },
    onError: (e) => setErr(e?.response?.data?.message || t("error")),
  });

  async function onPickImage(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setErr(null);
    setUploading(true);
    try {
      const url = await uploadEventImage(file);
      setCoverImage(url);
    } catch (e2) {
      setErr(e2?.message || t("error"));
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
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
        href="/events"
        style={{ color: "var(--text-muted)", fontSize: 14, display: "inline-block", marginBottom: 18 }}
      >
        ‹ {t("eventsTitle")}
      </Link>

      <h1 style={{ fontSize: "clamp(26px,5vw,36px)", margin: "0 0 24px" }}>
        {t("addEvent")}
      </h1>

      {/* Cover image */}
      <div style={{ marginBottom: 20 }}>
        <span style={fieldLabel}>{t("addImage")}</span>
        <div
          onClick={() => fileRef.current?.click()}
          style={{
            width: "100%",
            maxWidth: 360,
            aspectRatio: "16 / 9",
            borderRadius: 14,
            border: "2px dashed var(--card-border)",
            background: "var(--bg-secondary)",
            overflow: "hidden",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--text-muted)",
            fontSize: 14,
          }}
        >
          {coverImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={coverImage}
              alt=""
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : uploading ? (
            t("loading")
          ) : (
            "+"
          )}
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
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

      <div style={{ display: "flex", gap: 12 }}>
        <div style={{ flex: 1 }}>
          <span style={fieldLabel}>{t("eventTag")}</span>
          <select value={form.category} onChange={set("category")} style={inputStyle}>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div style={{ flex: 1 }}>
          <span style={fieldLabel}>{t("upcoming")}</span>
          <input
            type="datetime-local"
            value={form.date}
            onChange={set("date")}
            style={inputStyle}
          />
        </div>
      </div>

      <Field label={t("eventsSubtitle")} value={form.location} onChange={set("location")} />

      <label
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginBottom: 20,
          fontSize: 15,
          color: "var(--text)",
          cursor: "pointer",
        }}
      >
        <input
          type="checkbox"
          checked={form.isFree}
          onChange={(e) => setForm((f) => ({ ...f, isFree: e.target.checked }))}
        />
        {t("freeEvent")}
      </label>

      {/* Price — only for paid events */}
      {!form.isFree && (
        <div style={{ marginBottom: 20 }}>
          <span style={fieldLabel}>{t("price")}</span>
          <div style={{ display: "flex", gap: 8 }}>
            <input
              type="number"
              placeholder="0"
              value={form.price}
              onChange={set("price")}
              style={{ ...inputStyle, flex: 1, minWidth: 0 }}
            />
            <select
              value={form.currency}
              onChange={set("currency")}
              style={{ ...inputStyle, width: 100 }}
            >
              {CURRENCIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      {err && <p style={{ color: "var(--accent)", fontSize: 14 }}>{err}</p>}

      <button
        onClick={() => mutation.mutate()}
        disabled={!canSave}
        style={{ ...primaryBtn, width: "100%", opacity: canSave ? 1 : 0.6 }}
      >
        {mutation.isPending ? t("loading") : t("addEvent")}
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
