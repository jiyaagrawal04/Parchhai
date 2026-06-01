import { create } from "zustand";
import type { PublicUser } from "@parchhai/types";
import { api, tokens, unwrap } from "@/lib/api";

interface AuthState {
  user: PublicUser | null;
  ready: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  hydrate: () => Promise<void>;
}

export const useAuth = create<AuthState>((set) => ({
  user: null,
  ready: false,

  login: async (email, password) => {
    const data = unwrap<{ accessToken: string; refreshToken: string; user: PublicUser }>(
      await api.post("/auth/login", { email, password }),
    );
    await tokens.set(data.accessToken, data.refreshToken);
    set({ user: data.user });
  },

  signup: async (name, email, password) => {
    const data = unwrap<{ accessToken: string; refreshToken: string; user: PublicUser }>(
      await api.post("/auth/signup", { name, email, password }),
    );
    await tokens.set(data.accessToken, data.refreshToken);
    set({ user: data.user });
  },

  logout: async () => {
    if (tokens.refresh) await api.post("/auth/logout", { refreshToken: tokens.refresh }).catch(() => {});
    await tokens.clear();
    set({ user: null });
  },

  hydrate: async () => {
    await tokens.hydrate();
    if (tokens.access) {
      try {
        const user = unwrap<PublicUser>(await api.get("/auth/me"));
        set({ user });
      } catch {
        await tokens.clear();
      }
    }
    set({ ready: true });
  },
}));
