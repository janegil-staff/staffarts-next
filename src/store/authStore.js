// src/store/authStore.js
import { create } from "zustand";

import client, { tokenStorage, onLogout } from "../api/client";
import { login as apiLogin, register as apiRegister, fetchMe, logout as apiLogout } from "../api/auth";

export const useAuthStore = create((set, get) => ({
  user: null,
  status: "idle", // idle | loading | authed | guest
  error: null,

  // Called once on app mount. Reads stored tokens, fetches the current user.
  async bootstrap() {
    set({ status: "loading" });
    const token = await tokenStorage.getAccessToken();
    if (!token) {
      set({ status: "guest", user: null });
      return;
    }
    try {
      const user = await fetchMe();
      set({ status: "authed", user });
      import("../lib/socket").then((m) => m.connectSocket());
    } catch {
      await tokenStorage.clearTokens();
      set({ status: "guest", user: null });
    }
  },

  async login({ email, pin }) {
    set({ error: null });
    const { user, accessToken, refreshToken } = await apiLogin({ email, pin });
    await tokenStorage.setTokens(accessToken, refreshToken);
    set({ status: "authed", user });
    import("../lib/socket").then((m) => m.connectSocket());
    return user;
  },

  async register(payload) {
    set({ error: null });
    const { user, accessToken, refreshToken } = await apiRegister(payload);
    await tokenStorage.setTokens(accessToken, refreshToken);
    set({ status: "authed", user });
    import("../lib/socket").then((m) => m.connectSocket());
    return user;
  },

  async logout() {
    await apiLogout();
    await tokenStorage.clearTokens();
    import("../lib/socket").then((m) => m.disconnectSocket());
    set({ status: "guest", user: null });
  },

  setUser(user) {
    set({ user });
  },
}));

// When the axios interceptor gives up on refresh, force the store to guest.
onLogout(() => {
  import("../lib/socket").then((m) => m.disconnectSocket());
  useAuthStore.setState({ status: "guest", user: null });
});
