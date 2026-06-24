import { useState } from "react";
import { View, Text, Pressable, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { Icon } from "../../components/design";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { signIn } from "../../supabase/auth";
import { SCREENS } from "../../constants/screens";
import { useC } from "../../contexts/ThemeContext";
import { SHADOWS } from "../../themes/tokens";
import { AuthInput } from "./components/AuthInput";
import { SocialAuthButtons } from "./components/SocialAuthButtons";
import { useAlert } from "../../contexts/AlertContext";
import * as H from "../../lib/haptics";

export default function LoginScreen() {
  const navigation = useNavigation();
  const C = useC();
  const showAlert = useAlert();
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
      H.success();
    } catch (err) {
      H.error();
      showAlert("Giriş başarısız", err.message ?? "Bir sorun oldu");
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      {/* === Hero gradient banner === */}
      <LinearGradient
        colors={[C.accent, C.accent + "99"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          paddingTop: 70,
          paddingBottom: 40,
          paddingHorizontal: 28,
          borderBottomLeftRadius: 40,
          borderBottomRightRadius: 40,
        }}
      >
        {/* Decorative blobs */}
        <View style={{
          position: "absolute", top: -30, right: -30,
          width: 160, height: 160, borderRadius: 80,
          backgroundColor: "rgba(255,255,255,0.12)",
        }} />
        <View style={{
          position: "absolute", bottom: -40, left: -40,
          width: 130, height: 130, borderRadius: 65,
          backgroundColor: "rgba(255,255,255,0.08)",
        }} />

        <View style={{
          width: 60, height: 60, borderRadius: 18,
          backgroundColor: "rgba(255,255,255,0.22)",
          alignItems: "center", justifyContent: "center",
          marginBottom: 16,
        }}>
          <Icon name="zap" size={30} color="#FFFFFF" sw={2.5} />
        </View>

        <Text style={{
          fontFamily: "SpaceGrotesk_700Bold",
          fontSize: 38,
          color: "#FFFFFF",
          letterSpacing: -1,
        }}>
          Maraton
        </Text>
        <Text style={{
          fontFamily: "Inter_500Medium",
          fontSize: 15,
          color: "rgba(255,255,255,0.92)",
          marginTop: 6,
        }}>
          YKS yolculuğun burada başlıyor.
        </Text>
      </LinearGradient>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{ padding: 24, paddingTop: 32 }}
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View entering={FadeInDown.delay(100).duration(400).springify()}>
            <Text style={{
              fontFamily: "SpaceGrotesk_700Bold",
              fontSize: 24,
              color: C.text,
              letterSpacing: -0.4,
              marginBottom: 4,
            }}>
              Tekrar Hoş Geldin
            </Text>
            <Text style={{
              fontFamily: "Inter_400Regular",
              fontSize: 14,
              color: C.muted,
              marginBottom: 28,
            }}>
              Hesabınla giriş yap, kaldığın yerden devam et.
            </Text>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(180).duration(400).springify()}>
            <AuthInput
              label="E-posta"
              value={email}
              onChangeText={setEmail}
              placeholder="ornek@mail.com"
              keyboardType="email-address"
              error={errors.email}
              icon="mail"
            />
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(240).duration(400).springify()}>
            <AuthInput
              label="Şifre"
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              secureTextEntry
              error={errors.password}
              icon="lock"
            />
            <Pressable
              onPress={() => navigation.navigate(SCREENS.FORGOT_PASSWORD)}
              style={{ alignSelf: "flex-end", marginBottom: 8, marginTop: -4 }}
              hitSlop={6}
            >
              <Text style={{ fontFamily: "Inter_600SemiBold", fontSize: 13, color: C.brandLight }}>
                Şifremi unuttum
              </Text>
            </Pressable>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(320).duration(400).springify()}>
            <Pressable
              onPress={submit}
              disabled={busy}
              style={({ pressed }) => ({
                backgroundColor: C.accent,
                borderRadius: 999,
                paddingVertical: 17,
                alignItems: "center",
                flexDirection: "row",
                justifyContent: "center",
                gap: 8,
                marginTop: 16,
                opacity: busy ? 0.6 : pressed ? 0.92 : 1,
                ...SHADOWS.accent,
              })}
            >
              <Text style={{ fontFamily: "Inter_600SemiBold", fontSize: 16, color: "#FFFFFF" }}>
                {busy ? "Giriş yapılıyor..." : "Giriş Yap"}
              </Text>
              {!busy && <Icon name="arrowR" size={18} color="#FFFFFF" sw={2.5} />}
            </Pressable>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(380).duration(400).springify()}>
            {/* Divider */}
            <View style={{ flexDirection: "row", alignItems: "center", marginVertical: 22, gap: 12 }}>
              <View style={{ flex: 1, height: 1, backgroundColor: C.border }} />
              <Text style={{ fontFamily: "Inter_500Medium", fontSize: 12, color: C.muted }}>
                veya
              </Text>
              <View style={{ flex: 1, height: 1, backgroundColor: C.border }} />
            </View>

            <SocialAuthButtons />

            <Pressable
              onPress={() => navigation.navigate(SCREENS.REGISTER)}
              style={{ marginTop: 20, alignItems: "center" }}
              hitSlop={6}
            >
              <Text style={{ fontFamily: "Inter_500Medium", fontSize: 14, color: C.sec }}>
                Hesabın yok mu?{" "}
                <Text style={{ color: C.brandLight, fontFamily: "Inter_600SemiBold" }}>Hesap Oluştur</Text>
              </Text>
            </Pressable>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
