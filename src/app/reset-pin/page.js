// src/app/reset-pin/page.js
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { useT } from "../../i18n/index";
import { forgotPin, resetPin } from "../../api/auth";
import { AuthShell, Field, primaryBtn } from "../login/page";

export default function ResetPinPage() {
  const { t } = useT();
  const router = useRouter();

  const [step, setStep] = useState(1); // 1 = request code, 2 = enter code + new pin
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPin, setNewPin] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);

  async function requestCode() {
    setErr(null);
    setBusy(true);
    try {
      await forgotPin({ email: email.trim() });
      setStep(2);
    } catch (e) {
      setErr(e?.response?.data?.message || t("error"));
    } finally {
      setBusy(false);
    }
  }

  async function doReset() {
    setErr(null);
    setBusy(true);
    try {
      await resetPin({ email: email.trim(), code: code.trim(), newPin });
      router.push("/login");
    } catch (e) {
      setErr(e?.response?.data?.message || t("error"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthShell title={t("resetPin")}>
      {step === 1 ? (
        <>
          <Field label={t("email")} type="email" value={email} onChange={setEmail} />
          {err && <p style={{ color: "var(--accent)", fontSize: 14 }}>{err}</p>}
          <button onClick={requestCode} disabled={busy} style={primaryBtn}>
            {busy ? t("loading") : t("sendResetCode")}
          </button>
        </>
      ) : (
        <>
          <Field label={t("resetCode")} value={code} onChange={setCode} />
          <Field label={t("newPin")} type="password" value={newPin} onChange={setNewPin} />
          {err && <p style={{ color: "var(--accent)", fontSize: 14 }}>{err}</p>}
          <button onClick={doReset} disabled={busy} style={primaryBtn}>
            {busy ? t("loading") : t("resetPin")}
          </button>
        </>
      )}
      <div style={{ marginTop: 14, fontSize: 14 }}>
        <Link href="/login" style={{ color: "var(--text-muted)" }}>
          ‹ {t("signIn")}
        </Link>
      </div>
    </AuthShell>
  );
}
