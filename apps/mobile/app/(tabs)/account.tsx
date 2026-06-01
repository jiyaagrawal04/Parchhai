import { FlatList, Pressable, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "@/store/auth";
import { useOrders } from "@/lib/hooks";
import { Button, Divider, Loader } from "@/components/ui";
import { colors, formatINR, serif, space } from "@/lib/theme";

export default function Account() {
  const router = useRouter();
  const { user, logout, ready } = useAuth();

  if (!ready) return <Loader />;

  if (!user)
    return (
      <View style={{ flex: 1, backgroundColor: colors.surface, alignItems: "center", justifyContent: "center", padding: space(3) }}>
        <Text style={{ fontFamily: serif, fontSize: 26, color: colors.indigo, marginBottom: space(1) }}>Parchhai</Text>
        <Text style={{ color: colors.muted, marginBottom: space(3) }}>Sign in to see your orders & wishlist.</Text>
        <Button label="Sign in" onPress={() => router.push("/login")} style={{ width: 220 }} />
      </View>
    );

  return <AccountInner name={user.name} email={user.email} onLogout={logout} />;
}

function AccountInner({ name, email, onLogout }: { name: string; email: string | null; onLogout: () => Promise<void> }) {
  const router = useRouter();
  const { data: orders, isLoading } = useOrders();

  return (
    <View style={{ flex: 1, backgroundColor: colors.surface, paddingTop: space(7), paddingHorizontal: space(2.5) }}>
      <Text style={{ fontFamily: serif, fontSize: 30, color: colors.indigo }}>{name}</Text>
      <Text style={{ color: colors.muted }}>{email}</Text>
      <Divider />
      <Text style={{ fontSize: 11, letterSpacing: 1.4, textTransform: "uppercase", color: colors.gold, marginBottom: space(1) }}>Your orders</Text>
      {isLoading ? (
        <Loader />
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(o) => o.id}
          contentContainerStyle={{ gap: space(1.5), paddingBottom: space(3) }}
          ListEmptyComponent={<Text style={{ color: colors.muted }}>No orders yet.</Text>}
          renderItem={({ item }) => (
            <Pressable onPress={() => router.push(`/orders/${item.id}`)} style={{ borderWidth: 1, borderColor: colors.line, backgroundColor: colors.paper, padding: space(2), borderRadius: 4, flexDirection: "row", justifyContent: "space-between" }}>
              <View>
                <Text style={{ fontWeight: "700", color: colors.ink }}>{item.orderNumber}</Text>
                <Text style={{ color: colors.muted, fontSize: 12 }}>{item.status.replace(/_/g, " ")} · {item.items.length} item(s)</Text>
              </View>
              <Text style={{ fontWeight: "700" }}>{formatINR(item.total)}</Text>
            </Pressable>
          )}
          ListFooterComponent={<Button label="Sign out" variant="outline" onPress={onLogout} style={{ marginTop: space(2) }} />}
        />
      )}
    </View>
  );
}
