import { create } from "zustand";

interface UIState {
  loginOpen: boolean;
  loginRedirect: string | null;
  cartOpen: boolean;
  searchOpen: boolean;
  quickViewSlug: string | null;
  toast: { id: number; msg: string } | null;
  openLogin: (redirect?: string) => void;
  closeLogin: () => void;
  openCart: () => void;
  closeCart: () => void;
  openSearch: () => void;
  closeSearch: () => void;
  openQuickView: (slug: string) => void;
  closeQuickView: () => void;
  showToast: (msg: string) => void;
  clearToast: () => void;
}

let toastId = 0;

export const useUI = create<UIState>((set) => ({
  loginOpen: false,
  loginRedirect: null,
  cartOpen: false,
  searchOpen: false,
  quickViewSlug: null,
  toast: null,
  openLogin: (redirect) => set({ loginOpen: true, loginRedirect: redirect ?? null }),
  closeLogin: () => set({ loginOpen: false, loginRedirect: null }),
  openCart: () => set({ cartOpen: true }),
  closeCart: () => set({ cartOpen: false }),
  openSearch: () => set({ searchOpen: true }),
  closeSearch: () => set({ searchOpen: false }),
  openQuickView: (slug) => set({ quickViewSlug: slug }),
  closeQuickView: () => set({ quickViewSlug: null }),
  showToast: (msg) => set({ toast: { id: ++toastId, msg } }),
  clearToast: () => set({ toast: null }),
}));
