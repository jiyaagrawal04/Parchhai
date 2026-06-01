import { ActivityIndicator, Pressable, Text, View, type ViewStyle } from "react-native";
import { colors, radius, serif, space } from "@/lib/theme";

export const Loader = () => (
  <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
    <ActivityIndicator color={colors.indigo} />
  </View>
);

export const H1 = ({ children }: { children: React.ReactNode }) => (
  <Text style={{ fontFamily: serif, fontSize: 30, color: colors.indigo }}>{children}</Text>
);
export const H2 = ({ children }: { children: React.ReactNode }) => (
  <Text style={{ fontFamily: serif, fontSize: 22, color: colors.indigo }}>{children}</Text>
);

export const Eyebrow = ({ children }: { children: React.ReactNode }) => (
  <Text style={{ fontSize: 11, fontWeight: "600", letterSpacing: 1.6, textTransform: "uppercase", color: colors.gold }}>
    {children}
  </Text>
);

export const Button = ({
  label, onPress, variant = "primary", disabled, style,
}: { label: string; onPress: () => void; variant?: "primary" | "rust" | "outline"; disabled?: boolean; style?: ViewStyle }) => {
  const bg = variant === "rust" ? colors.rust : variant === "outline" ? "transparent" : colors.indigo;
  const fg = variant === "outline" ? colors.indigo : colors.onIndigo;
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={{
        backgroundColor: bg,
        borderWidth: variant === "outline" ? 1 : 0,
        borderColor: colors.indigo,
        paddingVertical: 14,
        paddingHorizontal: 24,
        borderRadius: radius.sm,
        alignItems: "center",
        opacity: disabled ? 0.5 : 1,
        ...style,
      }}
    >
      <Text style={{ color: fg, fontWeight: "700", letterSpacing: 0.5 }}>{label}</Text>
    </Pressable>
  );
};

export const Divider = () => <View style={{ height: 1, backgroundColor: colors.line, marginVertical: space(2) }} />;
