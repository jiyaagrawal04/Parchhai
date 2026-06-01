import axios, { type AxiosInstance } from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";

const BASE_URL =
  (Constants.expoConfig?.extra?.apiUrl as string | undefined) ?? "http://localhost:4000/api/v1";

const ACCESS_KEY = "parchhai.access";
const REFRESH_KEY = "parchhai.refresh";
const CART_KEY = "parchhai.cartSession";

// In-memory mirror so interceptors stay synchronous after hydration.
let accessToken: string | null = null;
let refreshToken: string | null = null;
let cartSession: string | null = null;

export const tokens = {
  async hydrate() {
    accessToken = await AsyncStorage.getItem(ACCESS_KEY);
    refreshToken = await AsyncStorage.getItem(REFRESH_KEY);
    cartSession = await AsyncStorage.getItem(CART_KEY);
    if (!cartSession) {
      cartSession = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      await AsyncStorage.setItem(CART_KEY, cartSession);
    }
  },
  get access() {
    return accessToken;
  },
  get refresh() {
    return refreshToken;
  },
  async set(access: string, refresh: string) {
    accessToken = access;
    refreshToken = refresh;
    await AsyncStorage.multiSet([
      [ACCESS_KEY, access],
      [REFRESH_KEY, refresh],
    ]);
  },
  async clear() {
    accessToken = null;
    refreshToken = null;
    await AsyncStorage.multiRemove([ACCESS_KEY, REFRESH_KEY]);
  },
};

export const api: AxiosInstance = axios.create({ baseURL: BASE_URL });

api.interceptors.request.use((config) => {
  if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;
  if (cartSession) config.headers["X-Cart-Session"] = cartSession;
  return config;
});

api.interceptors.response.use(
  (r) => r,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry && refreshToken) {
      original._retry = true;
      try {
        const { data } = await axios.post(`${BASE_URL}/auth/refresh`, { refreshToken });
        await tokens.set(data.data.accessToken, data.data.refreshToken);
        original.headers.Authorization = `Bearer ${data.data.accessToken}`;
        return api(original);
      } catch {
        await tokens.clear();
      }
    }
    return Promise.reject(error);
  },
);

export const unwrap = <T>(res: { data: { data: T } }): T => res.data.data;
export const apiError = (e: unknown): string => {
  if (axios.isAxiosError(e)) return e.response?.data?.error?.message ?? e.message;
  return e instanceof Error ? e.message : "Something went wrong";
};
