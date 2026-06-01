import axios, { type AxiosInstance } from "axios";

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000/api/v1";

// Guest cart session id, persisted so anonymous carts survive reloads.
const CART_KEY = "parchhai.cartSession";
export const getCartSession = (): string => {
  let id = localStorage.getItem(CART_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(CART_KEY, id);
  }
  return id;
};

const ACCESS_KEY = "parchhai.access";
const REFRESH_KEY = "parchhai.refresh";

export const tokenStore = {
  access: () => localStorage.getItem(ACCESS_KEY),
  refresh: () => localStorage.getItem(REFRESH_KEY),
  set: (access: string, refresh: string) => {
    localStorage.setItem(ACCESS_KEY, access);
    localStorage.setItem(REFRESH_KEY, refresh);
  },
  clear: () => {
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
  },
};

export const api: AxiosInstance = axios.create({ baseURL: BASE_URL });

api.interceptors.request.use((config) => {
  const token = tokenStore.access();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  config.headers["X-Cart-Session"] = getCartSession();
  return config;
});

let refreshing: Promise<string | null> | null = null;
const doRefresh = async (): Promise<string | null> => {
  const refresh = tokenStore.refresh();
  if (!refresh) return null;
  try {
    const { data } = await axios.post(`${BASE_URL}/auth/refresh`, { refreshToken: refresh });
    tokenStore.set(data.data.accessToken, data.data.refreshToken);
    return data.data.accessToken;
  } catch {
    tokenStore.clear();
    return null;
  }
};

api.interceptors.response.use(
  (r) => r,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry && tokenStore.refresh()) {
      original._retry = true;
      refreshing ??= doRefresh().finally(() => (refreshing = null));
      const token = await refreshing;
      if (token) {
        original.headers.Authorization = `Bearer ${token}`;
        return api(original);
      }
    }
    return Promise.reject(error);
  },
);

/** Unwrap the { data } envelope. */
export const unwrap = <T>(res: { data: { data: T } }): T => res.data.data;

export const apiError = (e: unknown): string => {
  if (axios.isAxiosError(e)) return e.response?.data?.error?.message ?? e.message;
  return e instanceof Error ? e.message : "Something went wrong";
};
