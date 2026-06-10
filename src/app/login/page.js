// src/app/login/page.js
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { useT } from "../../i18n/index";
import { useAuthStore } from "../../store/authStore";

export default function LoginPage() {
  const { t } = useT();
  const router = useRouter();
  const login = useAuthStore((s) => s.login);

  const [email, setEmail] = useState("");
  const [pin, setPin] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);

  async function submit() {
    setErr(null);
    setBusy(true);
    try {
      await login({ email: email.trim(), pin });
      router.push("/");
    } catch (e) {
      setErr(e?.response?.data?.message || t("error"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthShell title={t("signInTitle")}>
      <Field label={t("email")} type="email" value={email} onChange={setEmail} />
      <Field label={t("pin")} type="password" value={pin} onChange={setPin} />
      {err && <p style={{ color: "var(--accent)", fontSize: 14 }}>{err}</p>}
      <button onClick={submit} disabled={busy} style={primaryBtn}>
        {busy ? t("loading") : t("signIn")}
      </button>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 14, fontSize: 14 }}>
        <Link href="/register" style={{ color: "var(--text-muted)" }}>
          {t("noAccount")} {t("signUp")}
        </Link>
        <Link href="/reset-pin" style={{ color: "var(--text-muted)" }}>
          {t("forgotPin")}
        </Link>
      </div>
    </AuthShell>
  );
}

export const primaryBtn = {
  width: "100%",
  background: "var(--accent)",
  color: "#fff",
  border: "none",
  borderRadius: 10,
  padding: "12px",
  fontSize: 15,
  marginTop: 8,
};

export function AuthShell({ title, children }) {
  return (
    <div
      style={{
        maxWidth: 380,
        margin: "0 auto",
        padding: "clamp(40px,8vh,80px) 24px",
      }}
    >
      <h1 style={{ fontSize: 30, marginBottom: 24 }}>{title}</h1>
      {children}
    </div>
  );
}

export function Field({ label, type = "text", value, onChange }) {
  return (
    <label style={{ display: "block", marginBottom: 14 }}>
      <span style={{ display: "block", fontSize: 13, color: "var(--text-muted)", marginBottom: 6 }}>
        {label}
      </span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: "100%",
          background: "var(--card)",
          border: "1px solid var(--card-border)",
          borderRadius: 10,
          padding: "11px 14px",
          color: "var(--text)",
          fontSize: 15,
        }}
      />
    </label>
  );
}
