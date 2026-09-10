import { useState } from "react";
import { track } from "../../lib/analytics";
import { EVENTS } from "../../constants/analytics";
import { View, Text, Pressable, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { signUp } from "../../supabase/auth";
import { SCREENS } from "../../constants/screens";
import { useC } from "../../contexts/ThemeContext";
import { TYPOGRAPHY, STEP, GUTTER } from "../../themes/tokens";
import { AuthInput } from "./components/AuthInput";
import { PasswordStrength } from "./components/PasswordStrength";
import { TermsCheckbox } from "./components/TermsCheckbox";
import { Icon, Button } from "../../components/design";
import { SocialAuthButtons } from "./components/SocialAuthButtons";
import { useAlert } from "../../contexts/AlertContext";
import * as H from "../../lib/haptics";
import { registerSchema, validate } from "../../validations/auth";
import { authErrorMessage } from "../../supabase/authErrors";

export default function RegisterScreen() {
  const navigation = useNavigation();
  const C = useC();
  const showAlert = useAlert();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState({});

  const submit = async () => {
    const { ok, errors: fieldErrors } = validate(registerSchema, {
      name: name.trim(),
      email: email.trim(),
      password,
    });
    setErrors(fieldErrors);
    if (!ok) return;
    if (!agreed) {
      showAlert("Onay gerekli", "Devam etmek için Kullanım Şartları ve Gizlilik Politikası'nı onaylamalısın.");
      return;
    }

    setBusy(true);
    try {
      await signUp({ email, password, name });
      track(EVENTS.AUTH_REGISTER);
      H.success();
      showAlert("Hoş geldin!", "Hesabın oluşturuldu, e-postanı doğrulamayı unutma.");
    } catch (err) {
      H.error();
      showAlert("Kayıt başarısız", authErrorMessage(err));
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
              Hesap oluştur.
            </Text>
            <Text style={[TYPOGRAPHY.body, { fontSize: 13.5, color: C.text3, marginTop: STEP.s2, maxWidth: 302 }]}>
              Rotan hazır. Hesap yalnızca onu buluta almak için — hangi telefondan girersen aynı yerden devam eder.
            </Text>
          </Animated.View>

          <View style={{ marginTop: STEP.s4 }}>
            <Animated.View entering={FadeInDown.delay(140).duration(350)}>
              <AuthInput label="AD SOYAD" value={name} onChangeText={setName} placeholder="Arda Karaca" autoCapitalize="words" error={errors.name} />
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(190).duration(350)}>
              <AuthInput label="E-POSTA" value={email} onChangeText={setEmail} placeholder="ornek@mail.com" keyboardType="email-address" error={errors.email} />
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(240).duration(350)}>
              <AuthInput label="ŞİFRE" value={password} onChangeText={setPassword} placeholder="••••••••••" secureTextEntry error={errors.password} />
              <PasswordStrength password={password} />
            </Animated.View>
          </View>

          <Animated.View entering={FadeInDown.delay(290).duration(350)} style={{ marginTop: STEP.s2 }}>
            <TermsCheckbox
              checked={agreed}
              onToggle={() => setAgreed((v) => !v)}
              onOpenTerms={() => navigation.navigate(SCREENS.TERMS)}
              onOpenPrivacy={() => navigation.navigate(SCREENS.PRIVACY)}
            />
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(330).duration(350)}>
            <Button onPress={submit} loading={busy} size="lg" fullWidth style={{ marginTop: STEP.s3 }}>
              {busy ? "Hesap açılıyor..." : "Hesabı oluştur"}
            </Button>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(370).duration(350)}>
            <View style={{ flexDirection: "row", alignItems: "center", marginVertical: STEP.s3, gap: STEP.s2 }}>
              <View style={{ flex: 1, height: 1, backgroundColor: C.line }} />
              <Text style={[TYPOGRAPHY.label, { color: C.text3, letterSpacing: 2 }]}>VEYA</Text>
              <View style={{ flex: 1, height: 1, backgroundColor: C.line }} />
            </View>
            <SocialAuthButtons />
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(410).duration(350)}>
            <Pressable onPress={() => navigation.navigate(SCREENS.LOGIN)} style={{ marginTop: STEP.s4, alignItems: "center", minHeight: 44, justifyContent: "center", flexDirection: "row", gap: STEP.s1 / 2 }} hitSlop={6}>
              <Text style={[TYPOGRAPHY.body, { fontSize: 13, color: C.text3 }]}>Hesabın var mı?</Text>
              <Text style={[TYPOGRAPHY.bodySemiBold, { fontSize: 13, color: C.accentBright }]}>Giriş yap</Text>
            </Pressable>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
