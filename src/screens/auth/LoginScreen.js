import { useState } from "react";
import { View, Text, Pressable, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { Icon, Button } from "../../components/design";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { signIn } from "../../supabase/auth";
import { SCREENS } from "../../constants/screens";
import { useC } from "../../contexts/ThemeContext";
import { TYPOGRAPHY, SPACING, SHADOWS } from "../../themes/tokens";
import { AuthInput } from "./components/AuthInput";
import { SocialAuthButtons } from "./components/SocialAuthButtons";
import { useAlert } from "../../contexts/AlertContext";
import * as H from "../../lib/haptics";
import { loginSchema, validate } from "../../validations/auth";
import { authErrorMessage } from "../../supabase/authErrors";

export default function LoginScreen() {
  const navigation = useNavigation();
  const C = useC();
  const showAlert = useAlert();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState({});

  const submit = async () => {
    // Zod ile doğrula. Önce elle kontrol vardı ve `email.includes("@")`
    // "a@" gibi girdileri geçiriyordu.
    const { ok, errors: fieldErrors } = validate(loginSchema, { email: email.trim(), password });
    setErrors(fieldErrors);
    if (!ok) return;

    setBusy(true);
    try {
      await signIn({ email, password });
      H.success();
    } catch (err) {
      H.error();
      showAlert("Giriş başarısız", authErrorMessage(err));
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
          <Icon name="zap" size={30} color={C.textOnFill} sw={2.5} />
        </View>

        <Text style={{
          ...TYPOGRAPHY.display,
          fontSize: 38,
          color: C.textOnFill,
          letterSpacing: -1,
        }}>
          Maraton
        </Text>
        <Text style={{
          ...TYPOGRAPHY.bodyMedium,
          color: "rgba(255,255,255,0.92)",
          marginTop: SPACING.sm,
        }}>
          Sınav yolculuğun burada başlıyor.
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
              ...TYPOGRAPHY.heading,
              fontSize: 24,
              color: C.text,
              letterSpacing: -0.4,
              marginBottom: SPACING.xs,
            }}>
              Tekrar Hoş Geldin
            </Text>
            <Text style={{
              ...TYPOGRAPHY.caption,
              fontSize: 14,
              color: C.muted,
              marginBottom: SPACING.xxl + SPACING.xs,
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
              <Text style={{ fontFamily: "Archivo_600", fontSize: 13, color: C.brandLight }}>
                Şifremi unuttum
              </Text>
            </Pressable>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(320).duration(400).springify()}>
            <Button
              onPress={submit}
              loading={busy}
              iconRight={busy ? undefined : "arrowR"}
              size="lg"
              fullWidth
              style={{ marginTop: 16, ...SHADOWS.accent }}
            >
              {busy ? "Giriş yapılıyor..." : "Giriş Yap"}
            </Button>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(380).duration(400).springify()}>
            {/* Divider */}
            <View style={{ flexDirection: "row", alignItems: "center", marginVertical: 22, gap: 12 }}>
              <View style={{ flex: 1, height: 1, backgroundColor: C.border }} />
              <Text style={{ fontFamily: "Archivo_500", fontSize: 12, color: C.muted }}>
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
              <Text style={{ fontFamily: "Archivo_500", fontSize: 14, color: C.sec }}>
                Hesabın yok mu?{" "}
                <Text style={{ color: C.brandLight, fontFamily: "Archivo_600" }}>Hesap Oluştur</Text>
              </Text>
            </Pressable>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
