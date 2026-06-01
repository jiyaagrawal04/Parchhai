import { useState } from "react";
import { ScrollView, Text, TextInput, View, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { AddressDTO, OrderDTO, PaymentInitDTO } from "@parchhai/types";
import { api, apiError, unwrap } from "@/lib/api";
import { useCart } from "@/lib/hooks";
import { Button, Loader } from "@/components/ui";
import { colors, formatINR, radius, serif, space } from "@/lib/theme";

const empty = { name: "", phone: "", line1: "", city: "", state: "", pincode: "" };

export default function Checkout() {
  const router = useRouter();
  const qc = useQueryClient();
  const { data: cart, isLoading } = useCart();
  const { data: addresses } = useQuery({ queryKey: ["addresses"], queryFn: async () => unwrap<AddressDTO[]>(await api.get("/me/addresses")) });
  const [addr, setAddr] = useState(empty);
  const [useExisting, setUseExisting] = useState(true);
  const [method, setMethod] = useState<"RAZORPAY" | "COD">("RAZORPAY");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  if (isLoading || !cart) return <Loader />;
  const defaultAddr = addresses?.find((a) => a.isDefault) ?? addresses?.[0];
  const shipping = cart.subtotal >= 149900 ? 0 : 7900;

  const place = async () => {
    setBusy(true); setMsg("");
    try {
      const payload: Record<string, unknown> = { paymentMethod: method };
      if (useExisting && defaultAddr) payload.addressId = defaultAddr.id;
      else payload.address = { ...addr, type: "HOME", isDefault: true };
      const { order, payment } = (await api.post("/orders", payload)).data.data as { order: OrderDTO; payment: PaymentInitDTO | null };
      if (payment && payment.provider === "stub") {
        await api.post("/orders/payment/verify", { orderId: order.id, razorpayOrderId: payment.razorpayOrderId, razorpayPaymentId: `pay_stub_${order.id}`, razorpaySignature: "stub" });
      }
      await qc.invalidateQueries({ queryKey: ["cart"] });
      await qc.invalidateQueries({ queryKey: ["orders"] });
      router.replace(`/orders/${order.id}`);
    } catch (e) { setMsg(apiError(e)); setBusy(false); }
  };

  const field = (key: keyof typeof addr, ph: string) => (
    <TextInput value={addr[key]} onChangeText={(t) => setAddr({ ...addr, [key]: t })} placeholder={ph} placeholderTextColor={colors.muted}
      style={{ borderWidth: 1, borderColor: colors.line, backgroundColor: colors.paper, borderRadius: radius.sm, paddingHorizontal: 14, paddingVertical: 10, marginBottom: 10 }} />
  );

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.surface }} contentContainerStyle={{ padding: space(2.5) }}>
      <Text style={{ fontFamily: serif, fontSize: 22, color: colors.indigo, marginBottom: space(1) }}>Shipping address</Text>

      {defaultAddr && (
        <Pressable onPress={() => setUseExisting(true)} style={{ borderWidth: 1, borderColor: useExisting ? colors.indigo : colors.line, padding: space(2), borderRadius: radius.sm, marginBottom: 10 }}>
          <Text style={{ fontWeight: "700" }}>{defaultAddr.name} · {defaultAddr.phone}</Text>
          <Text style={{ color: colors.muted }}>{defaultAddr.line1}, {defaultAddr.city}, {defaultAddr.state} {defaultAddr.pincode}</Text>
        </Pressable>
      )}
      <Pressable onPress={() => setUseExisting(false)} style={{ borderWidth: 1, borderColor: !useExisting ? colors.indigo : colors.line, padding: space(2), borderRadius: radius.sm, marginBottom: space(2) }}>
        <Text style={{ fontWeight: "700" }}>Use a new address</Text>
      </Pressable>

      {!useExisting && (
        <View>
          {field("name", "Full name")}
          {field("phone", "Phone")}
          {field("line1", "Address")}
          {field("city", "City")}
          {field("state", "State")}
          {field("pincode", "Pincode")}
        </View>
      )}

      <Text style={{ fontFamily: serif, fontSize: 22, color: colors.indigo, marginVertical: space(1.5) }}>Payment</Text>
      {(["RAZORPAY", "COD"] as const).map((m) => (
        <Pressable key={m} onPress={() => setMethod(m)} style={{ borderWidth: 1, borderColor: method === m ? colors.indigo : colors.line, padding: space(2), borderRadius: radius.sm, marginBottom: 10 }}>
          <Text>{m === "RAZORPAY" ? "Pay online (UPI / Card)" : "Cash on delivery"}</Text>
        </Pressable>
      ))}

      <View style={{ marginTop: space(2), borderTopWidth: 1, borderTopColor: colors.line, paddingTop: space(2) }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}><Text style={{ color: colors.muted }}>Subtotal</Text><Text>{formatINR(cart.subtotal)}</Text></View>
        <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 4 }}><Text style={{ color: colors.muted }}>Shipping</Text><Text>{shipping === 0 ? "Free" : formatINR(shipping)}</Text></View>
        <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 8 }}><Text style={{ fontWeight: "700", fontSize: 16 }}>Total</Text><Text style={{ fontWeight: "700", fontSize: 16 }}>{formatINR(cart.subtotal + shipping)}</Text></View>
      </View>

      {msg ? <Text style={{ color: colors.rust, marginTop: space(1.5) }}>{msg}</Text> : null}
      <Button label={busy ? "Placing…" : "Place order"} variant="rust" onPress={place} disabled={busy} style={{ marginTop: space(2) }} />
    </ScrollView>
  );
}
