import { ScrollView, Text, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useOrder } from "@/lib/hooks";
import { Divider, Loader } from "@/components/ui";
import { colors, formatINR, serif, space } from "@/lib/theme";

const STEPS = ["PLACED", "PACKED", "SHIPPED", "OUT_FOR_DELIVERY", "DELIVERED"];

export default function OrderDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: o, isLoading } = useOrder(id ?? "");
  if (isLoading || !o) return <Loader />;
  const stepIndex = STEPS.indexOf(o.status);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.surface }} contentContainerStyle={{ padding: space(2.5) }}>
      <Text style={{ fontFamily: serif, fontSize: 26, color: colors.indigo }}>{o.orderNumber}</Text>
      <Text style={{ color: colors.muted }}>{o.status.replace(/_/g, " ")} · {o.paymentStatus}</Text>

      {o.status !== "CANCELLED" && (
        <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: space(3) }}>
          {STEPS.map((s, i) => (
            <View key={s} style={{ flex: 1, alignItems: "center" }}>
              <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: i <= stepIndex ? colors.rust : colors.line }} />
              <Text style={{ fontSize: 9, textAlign: "center", marginTop: 4, color: i <= stepIndex ? colors.rust : colors.muted }}>{s.replace(/_/g, " ")}</Text>
            </View>
          ))}
        </View>
      )}

      <Divider />
      {o.items.map((it) => (
        <View key={it.id} style={{ flexDirection: "row", justifyContent: "space-between", paddingVertical: 8 }}>
          <View style={{ flex: 1 }}>
            <Text style={{ fontFamily: serif, fontSize: 16, color: colors.indigo }}>{it.productName}</Text>
            <Text style={{ color: colors.muted, fontSize: 12 }}>{it.color} · {it.size} · Qty {it.qty}</Text>
          </View>
          <Text style={{ fontWeight: "700" }}>{formatINR(it.unitPrice * it.qty)}</Text>
        </View>
      ))}

      <Divider />
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}><Text style={{ color: colors.muted }}>Subtotal</Text><Text>{formatINR(o.subtotal)}</Text></View>
      {o.discount > 0 && <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 4 }}><Text style={{ color: colors.success }}>Discount</Text><Text style={{ color: colors.success }}>−{formatINR(o.discount)}</Text></View>}
      <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 4 }}><Text style={{ color: colors.muted }}>Shipping</Text><Text>{o.shipping === 0 ? "Free" : formatINR(o.shipping)}</Text></View>
      <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 8 }}><Text style={{ fontWeight: "700", fontSize: 16 }}>Total</Text><Text style={{ fontWeight: "700", fontSize: 16 }}>{formatINR(o.total)}</Text></View>

      <Divider />
      <Text style={{ fontSize: 11, letterSpacing: 1.4, textTransform: "uppercase", color: colors.gold }}>Delivery</Text>
      <Text style={{ marginTop: 4 }}>{o.shippingAddress.name} · {o.shippingAddress.phone}</Text>
      <Text style={{ color: colors.muted }}>{o.shippingAddress.line1}, {o.shippingAddress.city}, {o.shippingAddress.state} {o.shippingAddress.pincode}</Text>
    </ScrollView>
  );
}
