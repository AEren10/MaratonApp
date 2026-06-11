import { useState } from "react";
import { View, Text, Pressable, KeyboardAvoidingView, Platform, ScrollView, Alert } from "react-native";
import { Icon } from "../../components/design";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { signIn } from "../../supabase/auth";
import { SCREENS } from "../../constants/screens";
import { C, SPACING } from "../../themes/tokens";
import { AuthInput } from "./components/AuthInput";

export default function LoginScreen() {
  const navigation = useNavigation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState({});

  const submit = async () => {
    const e = {};
    if (!email.includes("@")) e.email = "Geçerli bir e-posta gir";
    if (password.length < 6) e.password = "Şifre en az 6 karakter";
    setErrors(e);
    if (Object.keys(e).length) return;

    setBusy(true);
    try {
      await signIn({ email, password });
      // AuthContext will pick up the session and switch to main tabs.
    } catch (err) {
      Alert.alert("Giriş başarısız", err.message ?? "Bir sorun oldu");
    } finally {
      setBusy(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{ padding: 24, flexGrow: 1, justifyContent: "center" }}
          keyboardShouldPersistTaps="handled"
        >
          <View style={{ marginBottom: 8 }}>
            <Icon name="zap" size={48} color={C.amber} />
          </View>
          <Text
            style={{
              fontFamily: "SpaceGrotesk_700Bold",
              fontSize: 32,
              color: C.text,
              letterSpacing: -0.8,
            }}
          >
            Maraton
          </Text>
          <Text
            style={{
              fontFamily: "Inter_400Regular",
              fontSize: 15,
              color: C.muted,
              marginTop: 6,
              marginBottom: 36,
            }}
          >
            YKS yolculuğun burada başlıyor.
          </Text>

          <AuthInput
            label="E-posta"
            value={email}
            onChangeText={setEmail}
            placeholder="ornek@mail.com"
            keyboardType="email-address"
            error={errors.email}
          />
          <AuthInput
            label="Şifre"
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            secureTextEntry
            error={errors.password}
          />

          <Pressable
            onPress={() => navigation.navigate(SCREENS.FORGOT_PASSWORD)}
            style={{ alignSelf: "flex-end", marginBottom: SPACING.md }}
          >
            <Text style={{ fontFamily: "Inter_500Medium", fontSize: 13, color: C.amber }}>
              Sifremi Unuttum
            </Text>
          </Pressable>

          <Pressable
            onPress={submit}
            disabled={busy}
            style={({ pressed }) => ({
              backgroundColor: C.amber,
              borderRadius: 16,
              paddingVertical: 16,
              alignItems: "center",
              marginTop: 8,
              opacity: busy ? 0.6 : pressed ? 0.85 : 1,
              shadowColor: C.amber,
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.4,
              shadowRadius: 16,
              elevation: 6,
            })}
          >
            <Text style={{ fontFamily: "Inter_600SemiBold", fontSize: 15, color: C.bg }}>
              {busy ? "Giriş yapılıyor..." : "Giriş Yap"}
            </Text>
          </Pressable>

          <Pressable
            onPress={() => navigation.navigate(SCREENS.REGISTER)}
            style={{ marginTop: 24, alignItems: "center" }}
          >
            <Text style={{ fontFamily: "Inter_500Medium", fontSize: 14, color: C.sec }}>
              Hesabın yok mu?{" "}
              <Text style={{ color: C.amber, fontFamily: "Inter_600SemiBold" }}>Kayıt Ol</Text>
            </Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
