// src/app/messages/page.js
"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  useQuery,
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import { useT } from "../../i18n/index";
import { useAuthStore } from "../../store/authStore";
import {
  listConversations,
  listThreadPaged,
  sendMessage,
  markConversationRead,
} from "../../api/messages";
import {
  connectSocket,
  setActiveConversation,
  emitTyping,
} from "../../lib/socket";

export default function MessagesPageWrapper() {
  return (
    <Suspense fallback={null}>
      <MessagesPage />
    </Suspense>
  );
}

function MessagesPage() {
  const { t, lang } = useT();
  const router = useRouter();
  const search = useSearchParams();
  const qc = useQueryClient();

  const authed = useAuthStore((s) => s.status === "authed");
  const me = useAuthStore((s) => s.user);

  const urlConv = search.get("c");
  const composeTo = search.get("to"); // start a new thread with this user
  const artworkRef = search.get("artwork");

  const [activeId, setActiveId] = useState(urlConv || null);

  // Ensure the socket is live whenever this screen is mounted & authed.
  useEffect(() => {
    if (authed) connectSocket();
  }, [authed]);

  // Tell the socket which thread is open (controls live-append behaviour).
  useEffect(() => {
    setActiveConversation(activeId);
    return () => setActiveConversation(null);
  }, [activeId]);

  const { data: conversations = [] } = useQuery({
    queryKey: ["conversations"],
    queryFn: listConversations,
    enabled: authed,
  });

  if (!authed) {
    return (
      <Centered>
        <p style={{ color: "var(--text-muted)" }}>{t("signInTitle")}</p>
        <button onClick={() => router.push("/login")} style={ctaBtn}>
          {t("signIn")}
        </button>
      </Centered>
    );
  }

  return (
    <div
      style={{
        maxWidth: 1000,
        margin: "0 auto",
        height: "calc(100dvh - 64px)",
        display: "grid",
        gridTemplateColumns: "300px 1fr",
      }}
      className="msg-grid"
    >
      {/* Conversation list */}
      <aside
        style={{
          borderRight: "1px solid var(--card-border)",
          overflowY: "auto",
        }}
      >
        <h1 style={{ fontSize: 18, padding: "18px 18px 10px", margin: 0 }}>
          {t("messagesTitle")}
        </h1>
        {conversations.length === 0 && !composeTo ? (
          <p style={{ color: "var(--text-muted)", padding: "0 18px", fontSize: 14 }}>
            {t("noConversations")}
          </p>
        ) : (
          conversations.map((c) => (
            <button
              key={c._id}
              onClick={() => setActiveId(c._id)}
              style={{
                width: "100%",
                textAlign: "left",
                background: activeId === c._id ? "var(--accent-soft)" : "transparent",
                border: "none",
                borderBottom: "1px solid var(--card-border)",
                padding: "14px 18px",
                display: "flex",
                flexDirection: "column",
                gap: 3,
              }}
            >
              <span style={{ fontWeight: 600, fontSize: 14, color: "var(--text)" }}>
                {c.participant?.displayName || "—"}
                {c.unread > 0 && (
                  <span
                    style={{
                      marginLeft: 8,
                      fontSize: 11,
                      background: "var(--accent)",
                      color: "#fff",
                      borderRadius: 8,
                      padding: "1px 6px",
                    }}
                  >
                    {c.unread}
                  </span>
                )}
              </span>
              <span
                style={{
                  fontSize: 13,
                  color: "var(--text-muted)",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {c.lastMessage?.body || ""}
              </span>
            </button>
          ))
        )}
      </aside>

      {/* Thread */}
      <section style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
        {activeId ? (
          <Thread
            conversationId={activeId}
            meId={me?._id}
            t={t}
            lang={lang}
            qc={qc}
          />
        ) : composeTo ? (
          <Compose
            toUserId={composeTo}
            artworkRef={artworkRef}
            t={t}
            onSent={(convId) => {
              qc.invalidateQueries({ queryKey: ["conversations"] });
              if (convId) {
                setActiveId(convId);
                router.replace(`/messages?c=${convId}`);
              }
            }}
          />
        ) : (
          <Centered>
            <p style={{ color: "var(--text-muted)" }}>{t("startConversation")}</p>
          </Centered>
        )}
      </section>

      <style>{`
        @media (max-width: 720px) {
          .msg-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}

function Thread({ conversationId, meId, t, lang, qc }) {
  const bottomRef = useRef(null);

  const { data, isLoading } = useInfiniteQuery({
    queryKey: ["thread", String(conversationId)],
    queryFn: ({ pageParam }) =>
      listThreadPaged({ conversationId, before: pageParam, limit: 30 }),
    getNextPageParam: (lastPage) =>
      lastPage?.hasMore ? lastPage.nextBefore : undefined,
    initialPageParam: undefined,
  });

  // Newest-first pages → flatten then reverse for chronological display.
  const messages = (data?.pages.flatMap((p) => p.data ?? []) ?? []).slice().reverse();

  // Mark read on open / when new messages land.
  useEffect(() => {
    markConversationRead(conversationId)
      .then(() => {
        qc.invalidateQueries({ queryKey: ["conversations"] });
        qc.invalidateQueries({ queryKey: ["unreadTotal"] });
      })
      .catch(() => {});
  }, [conversationId, messages.length, qc]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const otherId = messages.find((m) => String(m.sender) !== String(meId))?.sender;

  return (
    <>
      <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px" }}>
        {isLoading ? (
          <p style={{ color: "var(--text-muted)" }}>{t("loading")}</p>
        ) : (
          messages.map((m) => {
            const mine = String(m.sender) === String(meId);
            return (
              <div
                key={m._id}
                style={{
                  display: "flex",
                  justifyContent: mine ? "flex-end" : "flex-start",
                  marginBottom: 8,
                }}
              >
                <div
                  style={{
                    maxWidth: "72%",
                    padding: "9px 13px",
                    borderRadius: 14,
                    fontSize: 14,
                    lineHeight: 1.4,
                    background: mine ? "var(--accent)" : "var(--card)",
                    color: mine ? "#fff" : "var(--text)",
                    border: mine ? "none" : "1px solid var(--card-border)",
                  }}
                >
                  {m.body}
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>
      <Composer
        conversationId={conversationId}
        toUserId={otherId}
        t={t}
        qc={qc}
      />
    </>
  );
}

function Composer({ conversationId, toUserId, t, qc }) {
  const [text, setText] = useState("");

  const mutation = useMutation({
    mutationFn: (body) => sendMessage({ toUserId, body }),
    onSuccess: () => {
      setText("");
      qc.invalidateQueries({ queryKey: ["thread", String(conversationId)] });
      qc.invalidateQueries({ queryKey: ["conversations"] });
    },
  });

  function onChange(v) {
    setText(v);
    emitTyping(conversationId, toUserId, v.length > 0);
  }

  function submit() {
    const body = text.trim();
    if (!body || !toUserId) return;
    emitTyping(conversationId, toUserId, false);
    mutation.mutate(body);
  }

  return (
    <div
      style={{
        borderTop: "1px solid var(--card-border)",
        padding: 12,
        display: "flex",
        gap: 8,
      }}
    >
      <input
        value={text}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && submit()}
        placeholder={t("typeMessage")}
        style={{
          flex: 1,
          background: "var(--card)",
          border: "1px solid var(--card-border)",
          borderRadius: 10,
          padding: "10px 14px",
          color: "var(--text)",
          fontSize: 14,
        }}
      />
      <button
        onClick={submit}
        disabled={mutation.isPending || !text.trim()}
        style={ctaBtn}
      >
        {t("send")}
      </button>
    </div>
  );
}

// First message to a user with no existing thread.
function Compose({ toUserId, artworkRef, t, onSent }) {
  const [text, setText] = useState("");
  const mutation = useMutation({
    mutationFn: (body) => sendMessage({ toUserId, body, artworkRef }),
    onSuccess: (msg) => {
      setText("");
      onSent(msg?.conversation ? String(msg.conversation) : null);
    },
  });

  return (
    <>
      <div style={{ flex: 1 }} />
      <div
        style={{
          borderTop: "1px solid var(--card-border)",
          padding: 12,
          display: "flex",
          gap: 8,
        }}
      >
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && text.trim() && mutation.mutate(text.trim())}
          placeholder={t("typeMessage")}
          style={{
            flex: 1,
            background: "var(--card)",
            border: "1px solid var(--card-border)",
            borderRadius: 10,
            padding: "10px 14px",
            color: "var(--text)",
            fontSize: 14,
          }}
        />
        <button
          onClick={() => text.trim() && mutation.mutate(text.trim())}
          disabled={mutation.isPending || !text.trim()}
          style={ctaBtn}
        >
          {t("send")}
        </button>
      </div>
    </>
  );
}

const ctaBtn = {
  background: "var(--accent)",
  color: "#fff",
  border: "none",
  borderRadius: 10,
  padding: "10px 18px",
  fontSize: 14,
};

function Centered({ children }) {
  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        gap: 14,
        alignItems: "center",
        justifyContent: "center",
        padding: 60,
      }}
    >
      {children}
    </div>
  );
}
