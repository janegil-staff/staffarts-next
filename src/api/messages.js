// src/api/messages.js
// Each function returns the unwrapped payload (res.data.data); paginated calls
// return the full envelope so the infinite-query hook can read hasMore/nextBefore.

import client from "./client";

// List my conversations (newest activity first). Array of:
//   { _id, participant, lastMessage, unread, updatedAt, createdAt }
export async function listConversations() {
  const res = await client.get("/api/conversations");
  return res.data.data;
}

// Total unread across all threads — the badge's source of truth. Number.
export async function fetchUnreadTotal() {
  const res = await client.get("/api/conversations/unread");
  return res.data.data.total;
}

// Find my existing conversation with a given user. Returns id string or null.
export async function findConversationWith(userId) {
  const res = await client.get(`/api/conversations/with/${userId}`);
  return res.data.data.conversationId;
}

// One page of a thread, newest first:
//   { success, data: [...messages], limit, hasMore, nextBefore }
export async function listThreadPaged({ conversationId, before, limit = 30 }) {
  const params = { limit };
  if (before) params.before = before;
  const res = await client.get(
    `/api/conversations/${conversationId}/messages`,
    { params },
  );
  return res.data;
}

// Send a message — the single creation path. Returns the saved message.
export async function sendMessage({ toUserId, body, artworkRef }) {
  const payload = { toUserId, body };
  if (artworkRef) payload.artworkRef = artworkRef;
  const res = await client.post("/api/messages", payload);
  return res.data.data;
}

// Mark a conversation read (clears my unread). Returns { ok, unread }.
export async function markConversationRead(conversationId) {
  const res = await client.post(`/api/conversations/${conversationId}/read`);
  return res.data.data;
}
