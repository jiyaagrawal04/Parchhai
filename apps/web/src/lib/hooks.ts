import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  AddressDTO,
  CartDTO,
  CategoryDTO,
  CollectionDTO,
  CraftDTO,
  JournalPostDTO,
  OrderDTO,
  ProductDetailDTO,
  ProductListItemDTO,
  ReviewDTO,
} from "@parchhai/types";
import { api, unwrap } from "./api";

// ── Catalog ──
export const useProducts = (params: Record<string, unknown>) =>
  useQuery({
    queryKey: ["products", params],
    queryFn: async () => {
      const res = await api.get("/catalog/products", { params });
      return { items: res.data.data as ProductListItemDTO[], meta: res.data.meta };
    },
  });

export const useProduct = (slug: string) =>
  useQuery({
    queryKey: ["product", slug],
    queryFn: async () => unwrap<ProductDetailDTO>(await api.get(`/catalog/products/${slug}`)),
    enabled: Boolean(slug),
  });

export const useProductReviews = (slug: string) =>
  useQuery({
    queryKey: ["reviews", slug],
    queryFn: async () => unwrap<ReviewDTO[]>(await api.get(`/catalog/products/${slug}/reviews`)),
    enabled: Boolean(slug),
  });

export const useCrafts = () =>
  useQuery({ queryKey: ["crafts"], queryFn: async () => unwrap<CraftDTO[]>(await api.get("/catalog/crafts")) });

export const useCraft = (slug: string) =>
  useQuery({
    queryKey: ["craft", slug],
    queryFn: async () => unwrap<CraftDTO>(await api.get(`/catalog/crafts/${slug}`)),
    enabled: Boolean(slug),
  });

export const useCategories = () =>
  useQuery({ queryKey: ["categories"], queryFn: async () => unwrap<CategoryDTO[]>(await api.get("/catalog/categories")) });

export const useCollections = () =>
  useQuery({ queryKey: ["collections"], queryFn: async () => unwrap<CollectionDTO[]>(await api.get("/catalog/collections")) });

export const useJournal = () =>
  useQuery({ queryKey: ["journal"], queryFn: async () => unwrap<JournalPostDTO[]>(await api.get("/catalog/journal")) });

export const useJournalPost = (slug: string) =>
  useQuery({
    queryKey: ["journal", slug],
    queryFn: async () => unwrap<JournalPostDTO>(await api.get(`/catalog/journal/${slug}`)),
    enabled: Boolean(slug),
  });

export const useBanners = () =>
  useQuery({ queryKey: ["banners"], queryFn: async () => unwrap<{ id: string; title: string; subtitle: string | null; image: string; ctaLabel: string | null; ctaHref: string | null; placement: string }[]>(await api.get("/catalog/banners")) });

// ── Cart ──
export const useCart = () =>
  useQuery({ queryKey: ["cart"], queryFn: async () => unwrap<CartDTO>(await api.get("/cart")) });

export const useAddToCart = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (v: { variantId: string; qty: number }) => unwrap<CartDTO>(await api.post("/cart/items", v)),
    onSuccess: (data) => qc.setQueryData(["cart"], data),
  });
};

export const useUpdateCartItem = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (v: { id: string; qty: number }) => unwrap<CartDTO>(await api.patch(`/cart/items/${v.id}`, { qty: v.qty })),
    onSuccess: (data) => qc.setQueryData(["cart"], data),
  });
};

export const useRemoveCartItem = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => unwrap<CartDTO>(await api.delete(`/cart/items/${id}`)),
    onSuccess: (data) => qc.setQueryData(["cart"], data),
  });
};

// ── Orders ──
export const useOrders = () =>
  useQuery({ queryKey: ["orders"], queryFn: async () => unwrap<OrderDTO[]>(await api.get("/orders")) });

export const useOrder = (id: string) =>
  useQuery({
    queryKey: ["order", id],
    queryFn: async () => unwrap<OrderDTO>(await api.get(`/orders/${id}`)),
    enabled: Boolean(id),
  });

// ── Addresses ──
export const useAddresses = () =>
  useQuery({ queryKey: ["addresses"], queryFn: async () => unwrap<AddressDTO[]>(await api.get("/me/addresses")) });

// ── Wishlist ──
export const useWishlist = () =>
  useQuery({
    queryKey: ["wishlist"],
    queryFn: async () =>
      unwrap<{ id: string; variantId: string; productName: string; slug: string; image: string | null; price: number; size: string; color: string }[]>(
        await api.get("/wishlist"),
      ),
  });

export const useToggleWishlist = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (variantId: string) => api.post("/wishlist/toggle", { variantId }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["wishlist"] }),
  });
};
