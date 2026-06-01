import { useState } from "react";
import { Text, TextInput, View } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "@/store/auth";
import { apiError } from "@/lib/api";
import { Button } from "@/components/ui";
import { colors, radius, serif, space } from "@/lib/theme";

export default function Login() {
  const router = useRouter();
  const { login, signup } = useAuth();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [form, setForm] = useState({ name: "", email: "aanya@example.com", password: "Password123!" });
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setBusy(true); setErr("");
    try {
      if (mode === "signup") await signup(form.name, form.email, form.password);
      else await login(form.email, form.password);
      router.back();
    } catch (e) { setErr(apiError(e)); setBusy(false); }
  };

  const input = (key: keyof typeof form, ph: string, secure = false) => (
    <TextInput value={form[key]} onChangeText={(t) => setForm({ ...form, [key]: t })} placeholder={ph} placeholderTextColor={colors.muted}
      secureTextEntry={secure} autoCapitalize="none"
      style={{ borderWidth: 1, borderColor: colors.line, backgroundColor: colors.paper, borderRadius: radius.sm, paddingHorizontal: 14, paddingVertical: 12, marginBottom: 12 }} />
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.surface, padding: space(3), justifyContent: "center" }}>
      <Text style={{ fontFamily: serif, fontSize: 32, color: colors.indigo, marginBottom: space(1) }}>{mode === "signup" ? "Create account" : "Welcome back"}</Text>
      <Text style={{ color: colors.muted, marginBottom: space(3) }}>Parchhai — hand-block printed fashion.</Text>
      {mode === "signup" && input("name", "Full name")}
      {input("email", "Email")}
      {input("password", "Password", true)}
      {err ? <Text style={{ color: colors.rust, marginBottom: space(1) }}>{err}</Text> : null}
      <Button label={busy ? "Please wait…" : mode === "signup" ? "Create account" : "Sign in"} onPress={submit} disabled={busy} />
      <Text onPress={() => setMode(mode === "signup" ? "login" : "signup")} style={{ color: colors.rust, textAlign: "center", marginTop: space(2) }}>
        {mode === "signup" ? "Already have an account? Sign in" : "New here? Create an account"}
      </Text>
    </View>
  );
}
