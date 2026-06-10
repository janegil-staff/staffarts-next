// src/lib/config.js
// Web client points at the same DigitalOcean API as the mobile app.
// Override via NEXT_PUBLIC_API_BASE_URL in .env.local for local backend dev.

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "https://staff-arts-v2-y3c8h.ondigitalocean.app";
