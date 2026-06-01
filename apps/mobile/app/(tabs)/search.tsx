import { useState } from "react";
import { FlatList, TextInput, Text, View, useWindowDimensions } from "react-native";
import { useProducts } from "@/lib/hooks";
import { ProductCard } from "@/components/ProductCard";
import { colors, radius, space } from "@/lib/theme";

export default function Search() {
  const [q, setQ] = useState("");
  const { width } = useWindowDimensions();
  const { data } = useProducts(q.length >= 2 ? { q, pageSize: 40 } : { pageSize: 0 });
  const cardW = (width - space(2) * 2 - space(2)) / 2;

  return (
    <View style={{ flex: 1, backgroundColor: colors.surface, paddingTop: space(7), paddingHorizontal: space(2.5) }}>
      <TextInput
        value={q}
        onChangeText={setQ}
        placeholder="Search kurtis, Ajrakh, corsets…"
        placeholderTextColor={colors.muted}
        style={{ borderWidth: 1, borderColor: colors.line, backgroundColor: colors.paper, borderRadius: radius.sm, paddingHorizontal: 16, paddingVertical: 12, fontSize: 16 }}
      />
      {q.length < 2 ? (
        <Text style={{ color: colors.muted, marginTop: space(3) }}>Type at least 2 characters.</Text>
      ) : (
        <FlatList
          data={data}
          keyExtractor={(p) => p.id}
          numColumns={2}
          columnWrapperStyle={{ gap: space(2) }}
          contentContainerStyle={{ gap: space(3), paddingVertical: space(2) }}
          renderItem={({ item }) => <ProductCard p={item} width={cardW} />}
          ListEmptyComponent={<Text style={{ color: colors.muted, marginTop: space(3) }}>No results for “{q}”.</Text>}
        />
      )}
    </View>
  );
}
