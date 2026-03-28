import { create } from "zustand";
import { persist } from "zustand/middleware";
import axios from "axios";
import { UNICORE_PREFIX } from "../constants/config";

type UserInfo = {
  id: string;
  name: string;
  code: string;
  role: string;
};

type AuthState = {
  user: UserInfo | null;
  hasHydrated: boolean;
  authReady: boolean;
  setUser: (user: UserInfo) => void;
  setHasHydrated: (value: boolean) => void;
  fetchMe: () => Promise<UserInfo | null>;
  initializeAuth: () => Promise<UserInfo | null>;
  logout: () => void;
};

let authInitPromise: Promise<UserInfo | null> | null = null;

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      hasHydrated: false,
      authReady: false,

      setUser: (user) => set({ user }),
      setHasHydrated: (value) => set({ hasHydrated: value }),

      fetchMe: async () => {
        try {
          const res = await axios.get(`${import.meta.env.VITE_UNICORE_API_URL}/${UNICORE_PREFIX}/auth/me`, {
            withCredentials: true,
          });
          set({ user: res.data });
          return res.data;
        } catch (err) {
          console.error("Fetch /me failed:", err);
          set({ user: null });
          return null;
        }
      },

      initializeAuth: async () => {
        if (!authInitPromise) {
          authInitPromise = get()
            .fetchMe()
            .finally(() => {
              set({ authReady: true });
              authInitPromise = null;
            });
        }

        return authInitPromise;
      },

      logout: async () => {
        try {
          await axios.post(`${import.meta.env.VITE_UNICORE_API_URL}/${UNICORE_PREFIX}/auth/logout`, {}, { withCredentials: true });
        } catch (e) {
          console.error("Logout failed:", e);
        }
        set({ user: null });
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({ user: state.user }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
