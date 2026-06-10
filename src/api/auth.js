// src/api/auth.js
import client, { tokenStorage } from "./client";

export async function register({ displayName, email, pin, language }) {
  const res = await client.post("/api/auth/register", {
    displayName,
    email,
    pin,
    language,
  });
  return res.data.data; // { user, accessToken, refreshToken }
}

export async function login({ email, pin }) {
  const res = await client.post("/api/auth/login", { email, pin });
  return res.data.data;
}

export async function forgotPin({ email }) {
  const res = await client.post("/api/auth/forgot-pin", { email });
  return res.data.data;
}

export async function resetPin({ email, code, newPin }) {
  const res = await client.post("/api/auth/reset-pin", {
    email,
    code,
    newPin,
  });
  return res.data.data;
}

export async function fetchMe() {
  const res = await client.get("/api/auth/me");
  return res.data.data.user;
}

export async function logout() {
  try {
    const refreshToken = await tokenStorage.getRefreshToken();
    await client.post(
      "/api/auth/logout",
      { refreshToken: refreshToken ?? null },
      { timeout: 3000 },
    );
  } catch {
    // Server logout is best-effort; local tokens are cleared by the store.
  }
}
