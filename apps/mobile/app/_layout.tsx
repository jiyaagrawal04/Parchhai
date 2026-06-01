import { useEffect } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useAuth } from "@/store/auth";
import { colors } from "@/lib/theme";

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 30_000, retry: 1 } },
});

export default function RootLayout() {
  const hydrate = useAuth((s) => s.hydrate);
  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <StatusBar style="dark" />
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.surface } }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="product/[slug]" options={{ headerShown: true, title: "", headerTintColor: colors.indigo, headerStyle: { backgroundColor: colors.surface } }} />
          <Stack.Screen name="cart" options={{ headerShown: true, title: "Your Bag", headerTintColor: colors.indigo, headerStyle: { backgroundColor: colors.surface } }} />
          <Stack.Screen name="checkout" options={{ headerShown: true, title: "Checkout", headerTintColor: colors.indigo, headerStyle: { backgroundColor: colors.surface } }} />
          <Stack.Screen name="orders/[id]" options={{ headerShown: true, title: "Order", headerTintColor: colors.indigo, headerStyle: { backgroundColor: colors.surface } }} />
          <Stack.Screen name="login" options={{ headerShown: true, title: "Sign in", headerTintColor: colors.indigo, headerStyle: { backgroundColor: colors.surface } }} />
        </Stack>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
