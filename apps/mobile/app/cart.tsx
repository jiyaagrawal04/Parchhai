import { FlatList, Image, Pressable, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { Minus, Plus, X } from "lucide-react-native";
import { useCart, useUpdateCartItem } from "@/lib/hooks";
import { useAuth } from "@/store/auth";
import { Button, Loader } from "@/components/ui";
import { colors, formatINR, serif, space } from "@/lib/theme";

export default function Cart() {
  const router = useRouter();
  const { user } = useAuth();
  const { data: cart, isLoading } = useCart();
  const update = useUpdateCartItem();

  if (isLoading) return <Loader />;
  if (!cart || cart.items.length === 0)
    return (
      <View style={{ flex: 1, backgroundColor: colors.surface, alignItems: "center", justifyContent: "center", padding: space(3) }}>
        <Text style={{ fontFamily: serif, fontSize: 22, color: colors.indigo, marginBottom: space(2) }}>Your bag is empty</Text>
        <Button label="Shop now" onPress={() => router.push("/shop")} />
      </View>
    );

  const shipping = cart.subtotal >= 149900 ? 0 : 7900;

  return (
    <View style={{ flex: 1, backgroundColor: colors.surface }}>
      <FlatList
        data={cart.items}
        keyExtractor={(i) => i.id}
        contentContainerStyle={{ padding: space(2.5), gap: space(2) }}
        renderItem={({ item }) => (
          <View style={{ flexDirection: "row", gap: space(2) }}>
            <Image source={{ uri: item.image ?? undefined }} style={{ width: 80, height: 104, backgroundColor: colors.line }} />
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <Text style={{ fontFamily: serif, fontSize: 16, color: colors.indigo, flex: 1 }}>{item.productName}</Text>
                <Pressable onPress={() => update.mutate({ id: item.id, qty: 0 })}><X size={18} color={colors.muted} /></Pressable>
              </View>
              <Text style={{ color: colors.muted, fontSize: 12 }}>{item.color} · {item.size}</Text>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 10 }}>
                <View style={{ flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: colors.line }}>
                  <Pressable onPress={() => update.mutate({ id: item.id, qty: item.qty - 1 })} style={{ padding: 8 }}><Minus size={14} color={colors.ink} /></Pressable>
                  <Text style={{ width: 28, textAlign: "center" }}>{item.qty}</Text>
                  <Pressable onPress={() => update.mutate({ id: item.id, qty: item.qty + 1 })} style={{ padding: 8 }}><Plus size={14} color={colors.ink} /></Pressable>
                </View>
                <Text style={{ fontWeight: "700" }}>{formatINR(item.lineTotal)}</Text>
              </View>
            </View>
          </View>
        )}
      />
      <View style={{ padding: space(2.5), borderTopWidth: 1, borderTopColor: colors.line }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 6 }}>
          <Text style={{ color: colors.muted }}>Subtotal</Text><Text>{formatINR(cart.subtotal)}</Text>
        </View>
        <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 10 }}>
          <Text style={{ color: colors.muted }}>Shipping</Text><Text>{shipping === 0 ? "Free" : formatINR(shipping)}</Text>
        </View>
        <Button label={user ? `Checkout · ${formatINR(cart.subtotal + shipping)}` : "Sign in to checkout"} variant="rust" onPress={() => router.push(user ? "/checkout" : "/login")} />
      </View>
    </View>
  );
}
