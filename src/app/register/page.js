// src/app/register/page.js
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { useT } from "../../i18n/index";
import { useAuthStore } from "../../store/authStore";
import { AuthShell, Field, primaryBtn } from "../login/page";

export default function RegisterPage() {
  const { t, lang } = useT();
  const router = useRouter();
  const register = useAuthStore((s) => s.register);

  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [pin, setPin] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);

  async function submit() {
    setErr(null);
    setBusy(true);
    try {
      await register({
        displayName: displayName.trim(),
        email: email.trim(),
        pin,
        language: lang,
      });
      router.push("/");
    } catch (e) {
      setErr(e?.response?.data?.message || t("error"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthShell title={t("signUpTitle")}>
      <Field label={t("displayName")} value={displayName} onChange={setDisplayName} />
      <Field label={t("email")} type="email" value={email} onChange={setEmail} />
      <Field label={t("pin")} type="password" value={pin} onChange={setPin} />
      {err && <p style={{ color: "var(--accent)", fontSize: 14 }}>{err}</p>}
      <button onClick={submit} disabled={busy} style={primaryBtn}>
        {busy ? t("loading") : t("signUp")}
      </button>
      <div style={{ marginTop: 14, fontSize: 14 }}>
        <Link href="/login" style={{ color: "var(--text-muted)" }}>
          {t("haveAccount")} {t("signIn")}
        </Link>
      </div>
    </AuthShell>
  );
}
