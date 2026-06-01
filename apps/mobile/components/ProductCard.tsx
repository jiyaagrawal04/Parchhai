import { Image, Pressable, Text, View } from "react-native";
import { useRouter } from "expo-router";
import type { ProductListItemDTO } from "@parchhai/types";
import { colors, formatINR, serif } from "@/lib/theme";

export const ProductCard = ({ p, width }: { p: ProductListItemDTO; width: number }) => {
  const router = useRouter();
  return (
    <Pressable style={{ width }} onPress={() => router.push(`/product/${p.slug}`)}>
      <Image
        source={{ uri: p.image ?? undefined }}
        style={{ width: "100%", aspectRatio: 3 / 4, backgroundColor: colors.line }}
      />
      {p.craft && <Text style={{ fontSize: 10, letterSpacing: 1.2, textTransform: "uppercase", color: colors.gold, marginTop: 8 }}>{p.craft.name}</Text>}
      <Text style={{ fontFamily: serif, fontSize: 16, color: colors.indigo, marginTop: 2 }} numberOfLines={1}>{p.name}</Text>
      <Text style={{ fontWeight: "700", color: colors.ink, marginTop: 2 }}>{formatINR(p.basePrice)}</Text>
    </Pressable>
  );
};
