import { ScrollView, Image, Text, View, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useCrafts, useProducts } from "@/lib/hooks";
import { Loader } from "@/components/ui";
import { colors, formatINR, radius, serif, space } from "@/lib/theme";

const COLLECTIONS: { label: string; category: string; seed: string; full?: boolean; tint: string }[] = [
  { label: "KURTIS", category: "kurtis", seed: "coll-kurtis", full: true, tint: "rgba(4,21,52,0.25)" },
  { label: "CORSETS", category: "corsets", seed: "coll-corsets", tint: "rgba(162,62,48,0.35)" },
  { label: "DRESSES", category: "dresses", seed: "coll-dresses", tint: "rgba(184,137,59,0.4)" },
];

export default function Home() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { data: crafts } = useCrafts();
  const { data: products, isLoading } = useProducts({ pageSize: 8 });
  if (isLoading) return <Loader />;

  return (
    <View style={{ flex: 1, backgroundColor: colors.surface }}>
      {/* Top app bar */}
      <View style={{ paddingTop: insets.top, backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.line }}>
        <View style={{ height: 52, flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: space(2.5) }}>
          <View style={{ width: 24 }} />
          <Text style={{ fontFamily: serif, fontSize: 24, letterSpacing: 1, color: colors.indigo }}>PARCHHAI</Text>
          <Pressable onPress={() => router.push("/cart")}><Text style={{ fontSize: 20 }}>🛍️</Text></Pressable>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Editorial hero */}
        <View style={{ height: 460 }}>
          <Image source={{ uri: "https://picsum.photos/seed/parchhai-hero/900/1200" }} style={{ width: "100%", height: "100%" }} />
          <View style={{ position: "absolute", top: 0, bottom: 0, left: 0, right: 0, backgroundColor: "rgba(0,0,0,0.3)" }} />
          <View style={{ position: "absolute", bottom: 40, left: space(2.5), right: space(2.5) }}>
            <Text style={{ color: "rgba(255,255,255,0.8)", fontSize: 12, letterSpacing: 2, marginBottom: 6 }}>CURATED COLLECTION</Text>
            <Text style={{ fontFamily: serif, fontSize: 34, color: "#fff", marginBottom: 16 }}>The Summer Edit</Text>
            <Pressable onPress={() => router.push("/shop")} style={{ backgroundColor: colors.indigo, alignSelf: "flex-start", paddingVertical: 14, paddingHorizontal: 28 }}>
              <Text style={{ color: colors.onIndigo, fontSize: 12, letterSpacing: 2 }}>EXPLORE NOW</Text>
            </Pressable>
          </View>
        </View>

        {/* Shop by craft chips */}
        <View style={{ marginTop: space(4) }}>
          <Text style={{ fontFamily: serif, fontSize: 22, color: colors.indigo, paddingHorizontal: space(2.5), marginBottom: space(1.5) }}>Shop by Craft</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: space(2.5), gap: space(1) }}>
            {crafts?.map((c) => (
              <Pressable key={c.id} onPress={() => router.push(`/shop?craft=${c.slug}`)} style={{ borderWidth: 1, borderColor: colors.muted, borderRadius: radius.pill, paddingVertical: 8, paddingHorizontal: 24 }}>
                <Text style={{ color: colors.indigo, fontSize: 12, letterSpacing: 0.5 }}>{c.name}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* New drops rail */}
        <View style={{ marginTop: space(4) }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", paddingHorizontal: space(2.5), marginBottom: space(1.5) }}>
            <Text style={{ fontFamily: serif, fontSize: 22, color: colors.indigo }}>New Drops</Text>
            <Pressable onPress={() => router.push("/shop")}><Text style={{ color: colors.rust, fontSize: 12, borderBottomWidth: 1, borderBottomColor: colors.rust }}>View All</Text></Pressable>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: space(2.5), gap: space(2) }}>
            {products?.map((p) => (
              <Pressable key={p.id} onPress={() => router.push(`/product/${p.slug}`)} style={{ width: 220 }}>
                <Image source={{ uri: p.image ?? undefined }} style={{ width: "100%", aspectRatio: 3 / 4, backgroundColor: colors.surfaceAlt }} />
                <Text style={{ fontFamily: serif, fontSize: 16, color: colors.indigo, marginTop: 8 }} numberOfLines={1}>{p.name}</Text>
                <Text style={{ color: colors.muted, marginTop: 2 }}>{formatINR(p.basePrice)}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* Collections asymmetric grid */}
        <View style={{ marginTop: space(4), paddingHorizontal: space(2.5) }}>
          <Text style={{ fontFamily: serif, fontSize: 22, color: colors.indigo, marginBottom: space(1.5) }}>Collections</Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: space(1.5) }}>
            {COLLECTIONS.map((c) => (
              <Pressable
                key={c.label}
                onPress={() => router.push(`/shop?category=${c.category}`)}
                style={{ width: c.full ? "100%" : "48%", aspectRatio: c.full ? 16 / 9 : 1, overflow: "hidden" }}
              >
                <Image source={{ uri: `https://picsum.photos/seed/${c.seed}/800/600` }} style={{ width: "100%", height: "100%" }} />
                <View style={{ position: "absolute", top: 0, bottom: 0, left: 0, right: 0, backgroundColor: c.tint, alignItems: "center", justifyContent: "center" }}>
                  <Text style={{ color: "#fff", fontFamily: serif, fontSize: 20, letterSpacing: 3 }}>{c.label}</Text>
                </View>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Journal teaser */}
        <View style={{ marginTop: space(4), marginHorizontal: space(2.5), padding: space(3), borderWidth: 1, borderColor: colors.line, backgroundColor: colors.surfaceAlt }}>
          <Text style={{ fontSize: 12, letterSpacing: 2, color: colors.rust, marginBottom: space(1) }}>THE JOURNAL</Text>
          <Text style={{ fontFamily: serif, fontSize: 20, color: colors.indigo, marginBottom: space(1) }}>The Story of Indigo: From Soil to Soul</Text>
          <Text style={{ color: colors.muted, lineHeight: 22 }} numberOfLines={3}>
            Explore the ancient art of natural indigo dyeing — a process that takes weeks of patient craftsmanship and a deep connection with the earth.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
