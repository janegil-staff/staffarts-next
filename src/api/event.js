// src/api/event.js
import client from "./client";

// Paginated list. Returns { data, page, limit, total, hasMore }.
export async function listEventsPaged({
  page = 1,
  limit = 20,
  category,
  createdBy,
  q,
  upcoming = true,
  sort,
} = {}) {
  const params = { page, limit };
  if (category) params.category = category;
  if (createdBy) params.createdBy = createdBy;
  if (q) params.q = q;
  if (upcoming === false) params.upcoming = "false";
  if (sort) params.sort = sort;
  const res = await client.get("/api/events", { params });
  return res.data;
}

// Simple array helper (e.g. for the Home feed).
export async function listEvents(opts = {}) {
  const res = await listEventsPaged(opts);
  return res.data; // array (the envelope's .data)
}

export async function fetchEvent(id) {
  const res = await client.get(`/api/events/${id}`);
  return res.data.data;
}

export async function createEvent(payload) {
  const res = await client.post("/api/events", payload);
  return res.data.data;
}

export async function updateEvent(id, payload) {
  const res = await client.patch(`/api/events/${id}`, payload);
  return res.data.data;
}

export async function deleteEvent(id) {
  const res = await client.delete(`/api/events/${id}`);
  return res.data.data;
}

export async function signEventUpload() {
  const res = await client.post("/api/uploads/event/sign");
  return res.data.data;
}
