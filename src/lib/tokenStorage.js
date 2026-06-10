// src/lib/tokenStorage.js
// Web replacement for expo-secure-store. The mobile app stores tokens in the
// device keychain; on the web the practical equivalent (for a SPA hitting the
// API directly from the browser) is localStorage. All access is async to keep
// the same call shape as the mobile tokenStorage, and guarded for SSR where
// `window` does not exist.

const TOKEN_KEY = "accessToken";
const REFRESH_KEY = "refreshToken";

const hasWindow = () => typeof window !== "undefined";

export const tokenStorage = {
  async getAccessToken() {
    if (!hasWindow()) return null;
    return window.localStorage.getItem(TOKEN_KEY);
  },
  async getRefreshToken() {
    if (!hasWindow()) return null;
    return window.localStorage.getItem(REFRESH_KEY);
  },
  async setTokens(accessToken, refreshToken) {
    if (!hasWindow()) return;
    window.localStorage.setItem(TOKEN_KEY, accessToken);
    window.localStorage.setItem(REFRESH_KEY, refreshToken);
  },
  async clearTokens() {
    if (!hasWindow()) return;
    window.localStorage.removeItem(TOKEN_KEY);
    window.localStorage.removeItem(REFRESH_KEY);
  },
};
