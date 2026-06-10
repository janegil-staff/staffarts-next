// src/lib/socket.js
// Ported from the mobile app's src/services/socket.js. Same discipline:
// the server is the source of truth for unread counts; on an incoming message
// we invalidate the unread + conversation-list queries rather than incrementing
// any local counter. The only direct mutation is appending to the open thread.

import { io } from "socket.io-client";

import { API_BASE_URL } from "./config";
import { tokenStorage } from "../api/client";
import { SOCKET_EVENTS } from "./socketEvents";

const isDev = process.env.NODE_ENV !== "production";

let socket = null;
let queryClientRef = null;
let activeConversationId = null;

export function setActiveConversation(id) {
  activeConversationId = id ? String(id) : null;
}

export function configureSocket({ queryClient } = {}) {
  queryClientRef = queryClient ?? null;
}

export function getSocket() {
  return socket;
}

export function isSocketConnected() {
  return !!socket?.connected;
}

export async function connectSocket() {
  if (socket?.connected) return socket;

  const token = await tokenStorage.getAccessToken();
  if (!token) return null;

  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
  }

  socket = io(API_BASE_URL, {
    transports: ["websocket"],
    auth: { token },
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
  });

  bindHandlers(socket);
  return socket;
}

export async function reconnectWithFreshToken() {
  const token = await tokenStorage.getAccessToken();
  if (!token || !socket) return;
  socket.auth = { token };
  socket.disconnect().connect();
}

export function disconnectSocket() {
  activeConversationId = null;
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
  }
}

export function emitTyping(conversationId, toUserId, typing) {
  if (!socket?.connected || !toUserId) return;
  socket.emit(
    typing ? SOCKET_EVENTS.TYPING_START : SOCKET_EVENTS.TYPING_STOP,
    { conversationId, toUserId },
  );
}

function bindHandlers(s) {
  s.on("connect_error", async (err) => {
    if (isDev) console.log("[socket] connect_error:", err?.message);
    if (err?.message === "unauthorized") {
      const token = await tokenStorage.getAccessToken();
      if (token && socket) {
        socket.auth = { token };
      }
    }
  });

  s.on(SOCKET_EVENTS.MESSAGE_NEW, ({ message, conversation } = {}) => {
    const qc = queryClientRef;
    if (!qc || !message) return;

    const convId = String(message.conversation || conversation?._id || "");

    if (convId && convId === activeConversationId) {
      qc.setQueryData(["thread", convId], (old) => {
        if (!old?.pages?.length) return old;
        const first = old.pages[0];
        const exists = first?.data?.some(
          (m) => String(m._id) === String(message._id),
        );
        if (exists) return old;
        const pages = [...old.pages];
        pages[0] = { ...first, data: [message, ...(first.data ?? [])] };
        return { ...old, pages };
      });
      qc.invalidateQueries({ queryKey: ["conversations"] });
    }

    qc.invalidateQueries({ queryKey: ["conversations"] });
    qc.invalidateQueries({ queryKey: ["unreadTotal"] });
  });

  s.on(SOCKET_EVENTS.CONVERSATION_READ, ({ conversationId } = {}) => {
    const qc = queryClientRef;
    if (!qc || !conversationId) return;
    qc.invalidateQueries({ queryKey: ["thread", String(conversationId)] });
  });
}
