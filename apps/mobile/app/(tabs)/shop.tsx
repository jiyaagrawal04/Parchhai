import { useState } from "react";
import { FlatList, Pressable, Text, View, useWindowDimensions } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useCrafts, useProducts } from "@/lib/hooks";
import { ProductCard } from "@/components/ProductCard";
import { Loader } from "@/components/ui";
import { colors, radius, serif, space } from "@/lib/theme";

export default function Shop() {
  const params = useLocalSearchParams<{ craft?: string }>();
  const { width } = useWindowDimensions();
  const [craft, setCraft] = useState<string | undefined>(params.craft);
  const { data: crafts } = useCrafts();
  const { data: products, isLoading } = useProducts({ craft, pageSize: 40 });
  const cardW = (width - space(2) * 2 - space(2)) / 2;

  return (
    <View style={{ flex: 1, backgroundColor: colors.surface, paddingTop: space(7) }}>
      <Text style={{ fontFamily: serif, fontSize: 30, color: colors.indigo, paddingHorizontal: space(2.5) }}>Shop</Text>

      <View style={{ paddingVertical: space(1.5) }}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: space(2.5), gap: space(1) }}
          data={[{ slug: undefined, name: "All" }, ...(crafts ?? [])]}
          keyExtractor={(c) => c.slug ?? "all"}
          renderItem={({ item }) => {
            const active = craft === item.slug;
            return (
              <Pressable
                onPress={() => setCraft(item.slug)}
                style={{ borderWidth: 1, borderColor: active ? colors.indigo : colors.line, backgroundColor: active ? colors.indigo : "transparent", borderRadius: radius.pill, paddingVertical: 8, paddingHorizontal: 16 }}
              >
                <Text style={{ color: active ? colors.onIndigo : colors.ink, fontSize: 13 }}>{item.name}</Text>
              </Pressable>
            );
          }}
        />
      </View>

      {isLoading ? (
        <Loader />
      ) : (
        <FlatList
          data={products}
          keyExtractor={(p) => p.id}
          numColumns={2}
          columnWrapperStyle={{ gap: space(2), paddingHorizontal: space(2.5) }}
          contentContainerStyle={{ gap: space(3), paddingVertical: space(2) }}
          renderItem={({ item }) => <ProductCard p={item} width={cardW} />}
        />
      )}
    </View>
  );
}
