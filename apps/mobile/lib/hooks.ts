import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { CartDTO, CraftDTO, OrderDTO, ProductDetailDTO, ProductListItemDTO } from "@parchhai/types";
import { api, unwrap } from "./api";

export const useProducts = (params: Record<string, unknown>) =>
  useQuery({
    queryKey: ["products", params],
    queryFn: async () => (await api.get("/catalog/products", { params })).data.data as ProductListItemDTO[],
  });

export const useProduct = (slug: string) =>
  useQuery({
    queryKey: ["product", slug],
    queryFn: async () => unwrap<ProductDetailDTO>(await api.get(`/catalog/products/${slug}`)),
    enabled: Boolean(slug),
  });

export const useCrafts = () =>
  useQuery({ queryKey: ["crafts"], queryFn: async () => unwrap<CraftDTO[]>(await api.get("/catalog/crafts")) });

export const useCart = () =>
  useQuery({ queryKey: ["cart"], queryFn: async () => unwrap<CartDTO>(await api.get("/cart")) });

export const useAddToCart = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (v: { variantId: string; qty: number }) => unwrap<CartDTO>(await api.post("/cart/items", v)),
    onSuccess: (d) => qc.setQueryData(["cart"], d),
  });
};

export const useUpdateCartItem = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (v: { id: string; qty: number }) => unwrap<CartDTO>(await api.patch(`/cart/items/${v.id}`, { qty: v.qty })),
    onSuccess: (d) => qc.setQueryData(["cart"], d),
  });
};

export const useOrders = () =>
  useQuery({ queryKey: ["orders"], queryFn: async () => unwrap<OrderDTO[]>(await api.get("/orders")) });

export const useOrder = (id: string) =>
  useQuery({ queryKey: ["order", id], queryFn: async () => unwrap<OrderDTO>(await api.get(`/orders/${id}`)), enabled: Boolean(id) });

export const useWishlist = () =>
  useQuery({
    queryKey: ["wishlist"],
    queryFn: async () =>
      (await api.get("/wishlist")).data.data as { id: string; variantId: string; productName: string; slug: string; image: string | null; price: number; size: string; color: string }[],
  });
