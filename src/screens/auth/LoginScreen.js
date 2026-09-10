import { useState } from "react";
import { View, Text, Pressable, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Icon, Button } from "../../components/design";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { signIn } from "../../supabase/auth";
import { SCREENS } from "../../constants/screens";
import { useC } from "../../contexts/ThemeContext";
import { TYPOGRAPHY, STEP, GUTTER } from "../../themes/tokens";
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
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: C.bg }}>
      <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: GUTTER, paddingTop: STEP.s1 }}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12} accessibilityLabel="Geri" accessibilityRole="button" style={{ padding: STEP.s1, minWidth: 44, minHeight: 44, justifyContent: "center" }}>
          <Icon name="arrowL" size={18} color={C.text2} />
        </Pressable>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ paddingHorizontal: GUTTER, paddingTop: STEP.s3, paddingBottom: STEP.s3 }} keyboardShouldPersistTaps="handled">
          <Animated.View entering={FadeInDown.delay(80).duration(350)}>
            <Text style={[TYPOGRAPHY.heading, { fontSize: 28, color: C.text, maxWidth: 280 }]}>
              Hesabına gir.
            </Text>
            <Text style={[TYPOGRAPHY.body, { fontSize: 13.5, color: C.text3, marginTop: STEP.s2, maxWidth: 302 }]}>
              Rotan, denemelerin ve yanlış defterin hesabında duruyor. Hangi telefondan girersen aynı yerden devam eder.
            </Text>
          </Animated.View>

          <View style={{ marginTop: STEP.s4 }}>
            <Animated.View entering={FadeInDown.delay(150).duration(350)}>
              <AuthInput label="E-POSTA" value={email} onChangeText={setEmail} placeholder="ornek@mail.com" keyboardType="email-address" error={errors.email} />
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(210).duration(350)}>
              <AuthInput label="ŞİFRE" value={password} onChangeText={setPassword} placeholder="••••••••" secureTextEntry error={errors.password} />
              <Pressable onPress={() => navigation.navigate(SCREENS.FORGOT_PASSWORD)} style={{ alignSelf: "flex-end", minHeight: 44, justifyContent: "center", marginTop: -STEP.s1 }} hitSlop={6}>
                <Text style={[TYPOGRAPHY.captionMedium, { color: C.text2 }]}>Şifremi unuttum</Text>
              </Pressable>
            </Animated.View>
          </View>

          <Animated.View entering={FadeInDown.delay(280).duration(350)}>
            <Button onPress={submit} loading={busy} size="lg" fullWidth style={{ marginTop: STEP.s1 }}>
              {busy ? "Giriş yapılıyor..." : "Giriş yap"}
            </Button>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(340).duration(350)}>
            <View style={{ flexDirection: "row", alignItems: "center", marginVertical: STEP.s3, gap: STEP.s2 }}>
              <View style={{ flex: 1, height: 1, backgroundColor: C.line }} />
              <Text style={[TYPOGRAPHY.label, { color: C.text3, letterSpacing: 2 }]}>VEYA</Text>
              <View style={{ flex: 1, height: 1, backgroundColor: C.line }} />
            </View>

            <SocialAuthButtons />

            <Pressable onPress={() => navigation.navigate(SCREENS.REGISTER)} style={{ marginTop: STEP.s4, alignItems: "center", minHeight: 44, justifyContent: "center", flexDirection: "row", gap: STEP.s1 / 2 }} hitSlop={6}>
              <Text style={[TYPOGRAPHY.body, { fontSize: 13, color: C.text3 }]}>Hesabın yok mu?</Text>
              <Text style={[TYPOGRAPHY.bodySemiBold, { fontSize: 13, color: C.accentBright }]}>Kayıt ol</Text>
            </Pressable>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
