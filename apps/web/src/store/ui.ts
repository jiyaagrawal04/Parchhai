import { create } from "zustand";

interface UIState {
  cartOpen: boolean;
  searchOpen: boolean;
  quickViewSlug: string | null;
  toast: { id: number; msg: string } | null;
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
  cartOpen: false,
  searchOpen: false,
  quickViewSlug: null,
  toast: null,
  openCart: () => set({ cartOpen: true }),
  closeCart: () => set({ cartOpen: false }),
  openSearch: () => set({ searchOpen: true }),
  closeSearch: () => set({ searchOpen: false }),
  openQuickView: (slug) => set({ quickViewSlug: slug }),
  closeQuickView: () => set({ quickViewSlug: null }),
  showToast: (msg) => set({ toast: { id: ++toastId, msg } }),
  clearToast: () => set({ toast: null }),
}));
