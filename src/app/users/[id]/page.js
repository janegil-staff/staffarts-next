// src/app/users/[id]/page.js
"use client";

import { use } from "react";
import { useQuery } from "@tanstack/react-query";

import { useT } from "../../../i18n/index";
import { fetchPublicProfile } from "../../../api/user";
import { useAuthStore } from "../../../store/authStore";
import ProfileView from "../../../components/ProfileView";

export default function PublicProfilePage({ params }) {
  const { id } = use(params);
  const { t } = useT();
  const me = useAuthStore((s) => s.user);

  const { data: user, isLoading, isError } = useQuery({
    queryKey: ["public-profile", id],
    queryFn: () => fetchPublicProfile(id),
    enabled: !!id,
  });

  if (isLoading)
    return (
      <div style={{ textAlign: "center", padding: 80, color: "var(--text-muted)" }}>
        {t("loading")}
      </div>
    );
  if (isError || !user)
    return (
      <div style={{ textAlign: "center", padding: 80, color: "var(--text-muted)" }}>
        {t("error")}
      </div>
    );

  // If you navigate to your own public URL, allow editing.
  const isMe = me && (me._id === user._id || me.id === user._id);

  return <ProfileView user={user} editable={!!isMe} />;
}
