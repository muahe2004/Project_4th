import { create } from "zustand";
import { persist } from "zustand/middleware";
import axios from "axios";

type UserInfo = {
  id: string;
  name: string;
  code: string;
  role: string;
};

type AuthState = {
  user: UserInfo | null;
  setUser: (user: UserInfo) => void;
  fetchMe: () => Promise<UserInfo | null>;
  logout: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,

      setUser: (user) => set({ user }),

      fetchMe: async () => {
        try {
          const res = await axios.get(`${import.meta.env.VITE_UNICORE_API_URL}/auth/me`, {
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

      logout: async () => {
        try {
          await axios.post(`${import.meta.env.VITE_UNICORE_API_URL}/auth/logout`, {}, { withCredentials: true });
        } catch (e) {
          console.error("Logout failed:", e);
        }
        set({ user: null });
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({ user: state.user }),
    }
  )
);
