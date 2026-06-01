import { create } from "zustand";
import type { PublicUser } from "@parchhai/types";
import { api, tokenStore, unwrap } from "@/lib/api";

interface AuthState {
  user: PublicUser | null;
  loading: boolean;
  isStaff: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string, phone?: string) => Promise<void>;
  logout: () => Promise<void>;
  hydrate: () => Promise<void>;
}

const computeStaff = (u: PublicUser | null) => Boolean(u && u.role !== "CUSTOMER");

export const useAuth = create<AuthState>((set) => ({
  user: null,
  loading: true,
  isStaff: false,

  login: async (email, password) => {
    const res = await api.post("/auth/login", { email, password });
    const data = unwrap<{ accessToken: string; refreshToken: string; user: PublicUser }>(res);
    tokenStore.set(data.accessToken, data.refreshToken);
    set({ user: data.user, isStaff: computeStaff(data.user) });
  },

  signup: async (name, email, password, phone) => {
    const res = await api.post("/auth/signup", { name, email, password, phone });
    const data = unwrap<{ accessToken: string; refreshToken: string; user: PublicUser }>(res);
    tokenStore.set(data.accessToken, data.refreshToken);
    set({ user: data.user, isStaff: computeStaff(data.user) });
  },

  logout: async () => {
    const refresh = tokenStore.refresh();
    if (refresh) await api.post("/auth/logout", { refreshToken: refresh }).catch(() => {});
    tokenStore.clear();
    set({ user: null, isStaff: false });
  },

  hydrate: async () => {
    if (!tokenStore.access()) return set({ loading: false });
    try {
      const user = unwrap<PublicUser>(await api.get("/auth/me"));
      set({ user, isStaff: computeStaff(user), loading: false });
    } catch {
      tokenStore.clear();
      set({ user: null, loading: false });
    }
  },
}));
