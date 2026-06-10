// src/app/profile/page.js
"use client";

import { useRouter } from "next/navigation";

import { useT } from "../../i18n/index";
import { useAuthStore } from "../../store/authStore";
import ProfileView from "../../components/ProfileView";

export default function MyProfilePage() {
  const { t } = useT();
  const router = useRouter();
  const status = useAuthStore((s) => s.status);
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);

  if (status === "loading") {
    return (
      <div style={{ textAlign: "center", padding: 80, color: "var(--text-muted)" }}>
        {t("loading")}
      </div>
    );
  }

  if (status !== "authed" || !user) {
    return (
      <div style={{ textAlign: "center", padding: 80 }}>
        <p style={{ color: "var(--text-muted)", marginBottom: 16 }}>
          {t("signInTitle")}
        </p>
        <button
          onClick={() => router.push("/login")}
          style={{
            background: "var(--accent)",
            color: "#fff",
            border: "none",
            borderRadius: 10,
            padding: "10px 20px",
            fontSize: 15,
          }}
        >
          {t("signIn")}
        </button>
      </div>
    );
  }

  return <ProfileView user={user} editable onUserUpdate={setUser} />;
}
