// src/api/client.js
// Ported from the mobile app's src/api/client.js. Same envelope conventions,
// same coalesced-refresh logic. Differences from mobile:
//   - tokenStorage is the localStorage adapter (src/lib/tokenStorage), not
//     expo-secure-store.
//   - __DEV__ is replaced with a NODE_ENV check.

import axios from "axios";

import { API_BASE_URL } from "../lib/config";
import { tokenStorage } from "../lib/tokenStorage";

export { tokenStorage };

const isDev = process.env.NODE_ENV !== "production";

const client = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10_000,
  headers: { "Content-Type": "application/json" },
});

// Attach the access token to every request except /refresh.
client.interceptors.request.use(async (config) => {
  if (!config.url?.includes("/auth/refresh")) {
    const token = await tokenStorage.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Coalesced refresh — when one refresh is in flight, all other 401 retries
// await the same promise instead of firing duplicates.
let refreshPromise = null;

// Subscribers for "logged out" so the auth store can react.
const logoutSubscribers = new Set();
export function onLogout(cb) {
  logoutSubscribers.add(cb);
  return () => logoutSubscribers.delete(cb);
}

async function performRefresh() {
  const refreshToken = await tokenStorage.getRefreshToken();
  if (!refreshToken) return false;
  try {
    const res = await axios.post(`${API_BASE_URL}/api/auth/refresh`, {
      refreshToken,
    });
    if (res.data?.success) {
      const { accessToken, refreshToken: newRefresh } = res.data.data;
      await tokenStorage.setTokens(accessToken, newRefresh);
      return true;
    }
  } catch (e) {
    if (isDev) console.log("Refresh failed:", e?.response?.data || e.message);
  }
  return false;
}

client.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    const isRefreshCall = original?.url?.includes("/auth/refresh");

    if (
      error.response?.status === 401 &&
      !isRefreshCall &&
      !original._retried
    ) {
      original._retried = true;

      if (!refreshPromise) {
        refreshPromise = performRefresh().finally(() => {
          refreshPromise = null;
        });
      }
      const refreshed = await refreshPromise;

      if (refreshed) {
        const token = await tokenStorage.getAccessToken();
        original.headers.Authorization = `Bearer ${token}`;
        return client(original);
      }

      await tokenStorage.clearTokens();
      logoutSubscribers.forEach((cb) => cb());
    }

    return Promise.reject(error);
  },
);

export default client;
