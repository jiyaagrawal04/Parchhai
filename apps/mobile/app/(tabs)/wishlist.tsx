import { FlatList, Image, Pressable, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { useWishlist } from "@/lib/hooks";
import { useAuth } from "@/store/auth";
import { Button, Loader } from "@/components/ui";
import { colors, formatINR, serif, space } from "@/lib/theme";

export default function Wishlist() {
  const router = useRouter();
  const { user } = useAuth();
  const { data, isLoading } = useWishlist();

  if (!user)
    return (
      <View style={{ flex: 1, backgroundColor: colors.surface, alignItems: "center", justifyContent: "center", padding: space(3) }}>
        <Text style={{ fontFamily: serif, fontSize: 22, color: colors.indigo, marginBottom: space(2) }}>Sign in to view your wishlist</Text>
        <Button label="Sign in" onPress={() => router.push("/login")} />
      </View>
    );
  if (isLoading) return <Loader />;

  return (
    <View style={{ flex: 1, backgroundColor: colors.surface, paddingTop: space(7) }}>
      <Text style={{ fontFamily: serif, fontSize: 30, color: colors.indigo, paddingHorizontal: space(2.5) }}>Wishlist</Text>
      <FlatList
        data={data}
        keyExtractor={(i) => i.id}
        contentContainerStyle={{ padding: space(2.5), gap: space(2) }}
        ListEmptyComponent={<Text style={{ color: colors.muted }}>Nothing saved yet.</Text>}
        renderItem={({ item }) => (
          <Pressable onPress={() => router.push(`/product/${item.slug}`)} style={{ flexDirection: "row", gap: space(2) }}>
            <Image source={{ uri: item.image ?? undefined }} style={{ width: 80, height: 100, backgroundColor: colors.line }} />
            <View style={{ flex: 1, justifyContent: "center" }}>
              <Text style={{ fontFamily: serif, fontSize: 16, color: colors.indigo }}>{item.productName}</Text>
              <Text style={{ color: colors.muted, fontSize: 12 }}>{item.color} · {item.size}</Text>
              <Text style={{ fontWeight: "700", marginTop: 4 }}>{formatINR(item.price)}</Text>
            </View>
          </Pressable>
        )}
      />
    </View>
  );
}
