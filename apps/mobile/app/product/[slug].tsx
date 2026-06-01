import { useMemo, useState } from "react";
import { Image, Pressable, ScrollView, Text, View, useWindowDimensions } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useAddToCart, useProduct } from "@/lib/hooks";
import { apiError } from "@/lib/api";
import { Button, Eyebrow, Loader } from "@/components/ui";
import { colors, formatINR, radius, serif, space } from "@/lib/theme";

export default function ProductScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const { data: p, isLoading } = useProduct(slug ?? "");
  const addToCart = useAddToCart();
  const [color, setColor] = useState("");
  const [size, setSize] = useState("");
  const [msg, setMsg] = useState("");

  const selColor = color || p?.colors[0] || "";
  const variant = useMemo(() => p?.variants.find((v) => v.color === selColor && v.size === size), [p, selColor, size]);

  if (isLoading || !p) return <Loader />;

  const add = async () => {
    if (!variant) return setMsg("Please select a size.");
    try {
      await addToCart.mutateAsync({ variantId: variant.id, qty: 1 });
      setMsg("Added to bag ✓");
    } catch (e) { setMsg(apiError(e)); }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.surface }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
        <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false}>
          {p.images.map((im) => (
            <Image key={im.id} source={{ uri: im.url }} style={{ width, height: width * 1.25, backgroundColor: colors.line }} />
          ))}
        </ScrollView>

        <View style={{ padding: space(2.5) }}>
          {p.craft && <Eyebrow>{p.craft.name} · Hand-blocked</Eyebrow>}
          <Text style={{ fontFamily: serif, fontSize: 28, color: colors.indigo, marginTop: 6 }}>{p.name}</Text>
          <Text style={{ fontSize: 20, fontWeight: "700", marginTop: 6 }}>{formatINR(variant?.price ?? p.basePrice)}</Text>
          <Text style={{ color: colors.ink, marginTop: space(2), lineHeight: 22 }}>{p.description}</Text>

          {p.colors.length > 1 && (
            <View style={{ marginTop: space(2) }}>
              <Text style={{ color: colors.muted, marginBottom: 6 }}>Colour: {selColor}</Text>
              <View style={{ flexDirection: "row", gap: 8 }}>
                {p.colors.map((c) => (
                  <Pressable key={c} onPress={() => { setColor(c); setSize(""); }} style={{ borderWidth: 1, borderColor: c === selColor ? colors.indigo : colors.line, backgroundColor: c === selColor ? colors.indigo : "transparent", paddingVertical: 8, paddingHorizontal: 16, borderRadius: radius.sm }}>
                    <Text style={{ color: c === selColor ? colors.onIndigo : colors.ink }}>{c}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
          )}

          <View style={{ marginTop: space(2) }}>
            <Text style={{ color: colors.muted, marginBottom: 6 }}>Size</Text>
            <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
              {p.sizes.map((s) => {
                const v = p.variants.find((x) => x.color === selColor && x.size === s);
                const disabled = !v || v.stock === 0;
                return (
                  <Pressable key={s} disabled={disabled} onPress={() => setSize(s)} style={{ borderWidth: 1, borderColor: size === s ? colors.indigo : colors.line, backgroundColor: size === s ? colors.indigo : "transparent", width: 48, height: 44, borderRadius: radius.sm, alignItems: "center", justifyContent: "center", opacity: disabled ? 0.4 : 1 }}>
                    <Text style={{ color: size === s ? colors.onIndigo : colors.ink }}>{s}</Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {msg ? <Text style={{ color: colors.rust, marginTop: space(2) }}>{msg}</Text> : null}
        </View>
      </ScrollView>

      {/* Sticky CTA */}
      <View style={{ position: "absolute", bottom: 0, left: 0, right: 0, flexDirection: "row", gap: space(1.5), padding: space(2), backgroundColor: colors.surface, borderTopWidth: 1, borderTopColor: colors.line }}>
        <Button label="Add to bag" onPress={add} style={{ flex: 1 }} />
        <Button label="View bag" variant="outline" onPress={() => router.push("/cart")} />
      </View>
    </View>
  );
}
