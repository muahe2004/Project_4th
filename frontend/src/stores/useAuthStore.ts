import { create } from "zustand";

interface User {
  id: string;
  name: string;
}

interface AuthState {
  user: User | null;
  setUser: (user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: {
    id: "123",
    name: "Minh",
  },
  setUser: (user) => set({ user }),
  logout: () => set({ user: null }),
}));
