// src/lib/socketEvents.js
//
// CLIENT copy of the socket event names — verified against the mobile app's
// src/constants/socketEvents.js and the backend. Must stay identical to the
// server's copy. Every event name is snake_case. No exceptions.

export const SOCKET_EVENTS = Object.freeze({
  // ── Server → client ───────────────────────────────────────────────────
  MESSAGE_NEW: "message_new",
  CONVERSATION_READ: "conversation_read",
  USER_TYPING: "user_typing",

  // ── Client → server ───────────────────────────────────────────────────
  TYPING_START: "typing_start",
  TYPING_STOP: "typing_stop",

  // ── Connection lifecycle (Socket.io built-ins, named here for clarity) ─
  CONNECT: "connection",
  DISCONNECT: "disconnect",
});

export default SOCKET_EVENTS;
