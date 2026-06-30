import { useState } from "react";
import { View, Text, Pressable, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { signUp } from "../../supabase/auth";
import { SCREENS } from "../../constants/screens";
import { useC } from "../../contexts/ThemeContext";
import { TYPOGRAPHY, SPACING, SHADOWS } from "../../themes/tokens";
import { AuthInput } from "./components/AuthInput";
import { Icon, Button } from "../../components/design";
import { SocialAuthButtons } from "./components/SocialAuthButtons";
import { useAlert } from "../../contexts/AlertContext";
import * as H from "../../lib/haptics";

export default function RegisterScreen() {
  const navigation = useNavigation();
  const C = useC();
  const insets = useSafeAreaInsets();
  const showAlert = useAlert();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState({});

  const submit = async () => {
    const e = {};
    if (name.trim().length < 2) e.name = "Adın en az 2 karakter olmalı";
    if (!email.includes("@")) e.email = "Geçerli bir e-posta gir";
    if (password.length < 6) e.password = "Şifre en az 6 karakter";
    setErrors(e);
    if (Object.keys(e).length) return;

    setBusy(true);
    try {
      await signUp({ email, password, name });
      H.success();
      showAlert("Hoş geldin!", "Hesabın oluşturuldu, e-postanı doğrulamayı unutma.");
    } catch (err) {
      H.error();
      showAlert("Kayıt başarısız", err.message ?? "Bir sorun oldu");
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <LinearGradient
        colors={[C.accent, C.orange + "80"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          paddingTop: insets.top + SPACING.md,
          paddingBottom: 50,
          paddingHorizontal: SPACING.xxl,
          borderBottomLeftRadius: 40,
          borderBottomRightRadius: 40,
        }}
      >
        <View style={{
          position: "absolute", top: -30, right: -30,
          width: 150, height: 150, borderRadius: 75,
          backgroundColor: "rgba(255,255,255,0.12)",
        }} />
        <View style={{
          position: "absolute", bottom: -40, left: -40,
          width: 120, height: 120, borderRadius: 60,
          backgroundColor: "rgba(255,255,255,0.08)",
        }} />

        <Pressable
          onPress={() => navigation.goBack()}
          hitSlop={10}
          style={({ pressed }) => ({
            width: 40, height: 40, borderRadius: 14,
            backgroundColor: "rgba(255,255,255,0.22)",
            alignItems: "center", justifyContent: "center",
            marginBottom: SPACING.xxl,
            opacity: pressed ? 0.7 : 1,
          })}
        >
          <Icon name="arrowL" size={18} color={C.textOnFill} sw={2.5} />
        </Pressable>

        <View style={{
          width: 56, height: 56, borderRadius: 18,
          backgroundColor: "rgba(255,255,255,0.22)",
          alignItems: "center", justifyContent: "center",
          marginBottom: SPACING.md,
        }}>
          <Icon name="user" size={26} color={C.textOnFill} sw={2.4} />
        </View>

        <Text style={{
          ...TYPOGRAPHY.heading,
          fontSize: 30,
          color: C.textOnFill,
          letterSpacing: -0.7,
        }}>
          Aramıza katıl
        </Text>
        <Text style={{
          ...TYPOGRAPHY.captionMedium,
          fontSize: 14,
          color: "rgba(255,255,255,0.92)",
          marginTop: SPACING.sm,
        }}>
          Bugün başla, sınava hazır gel.
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
            <AuthInput
              label="Ad"
              value={name}
              onChangeText={setName}
              placeholder="Eren"
              autoCapitalize="words"
              error={errors.name}
              icon="user"
            />
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(170).duration(400).springify()}>
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
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(320).duration(400).springify()}>
            <Button
              onPress={submit}
              loading={busy}
              iconRight={busy ? undefined : "arrowR"}
              size="lg"
              fullWidth
              style={{ marginTop: 12, ...SHADOWS.accent }}
            >
              {busy ? "Hesap açılıyor..." : "Kayıt Ol"}
            </Button>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(360).duration(400).springify()}>
            <View style={{ flexDirection: "row", alignItems: "center", marginVertical: 18, gap: 12 }}>
              <View style={{ flex: 1, height: 1, backgroundColor: C.border }} />
              <Text style={{ fontFamily: "Inter_500Medium", fontSize: 12, color: C.muted }}>veya</Text>
              <View style={{ flex: 1, height: 1, backgroundColor: C.border }} />
            </View>
            <SocialAuthButtons />
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(420).duration(400).springify()}>
            <Pressable
              onPress={() => navigation.navigate(SCREENS.LOGIN)}
              style={{ marginTop: 20, alignItems: "center" }}
              hitSlop={6}
            >
              <Text style={{ fontFamily: "Inter_500Medium", fontSize: 14, color: C.sec }}>
                Zaten hesabın var mı?{" "}
                <Text style={{ color: C.brandLight, fontFamily: "Inter_600SemiBold" }}>Giriş Yap</Text>
              </Text>
            </Pressable>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
