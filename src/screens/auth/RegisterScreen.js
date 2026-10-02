import { useState } from "react";
import { View, Text, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import Animated from "react-native-reanimated";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";

import { track } from "../../lib/analytics";
import { EVENTS } from "../../constants/analytics";
import { signUp } from "../../supabase/auth";
import { SCREENS } from "../../constants/screens";
import { useC } from "../../contexts/ThemeContext";
import { TYPOGRAPHY, STEP, GUTTER, NAV_ICON } from "../../themes/tokens";
import { AuthInput } from "./components/AuthInput";
import { PasswordStrength } from "./components/PasswordStrength";
import { TermsCheckbox } from "./components/TermsCheckbox";
import { Icon, Button, Press } from "../../components/design";
import { SocialAuthButtons } from "./components/SocialAuthButtons";
import { useAlert } from "../../contexts/AlertContext";
import * as H from "../../lib/haptics";
import { registerSchema, validate } from "../../validations/auth";
import { authErrorMessage } from "../../supabase/authErrors";
import { SIGN_UP_OUTCOME, signUpOutcome } from "../../lib/signUpOutcome";
import { registerLeadCopy } from "../../lib/routePreviewStore";

export default function RegisterScreen() {
  const navigation = useNavigation();
  const C = useC();
  const insets = useSafeAreaInsets();
  const showAlert = useAlert();
  const [name, setName] = useState(""); const [email, setEmail] = useState("");
  const [password, setPassword] = useState(""); const [agreed, setAgreed] = useState(false);
  const [busy, setBusy] = useState(false); const [errors, setErrors] = useState({});

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
      // Oturum geldiyse AppNavigator kuruluma geciyor; gelmediyse dogrulama.
      const data = await signUp({ email: email.trim(), password, name: name.trim() });
      track(EVENTS.AUTH_REGISTER);
      H.success();
      if (signUpOutcome(data) === SIGN_UP_OUTCOME.CONFIRM_EMAIL) {
        showAlert("E-postanı doğrula", "Sana bir bağlantı gönderdik. Bağlantıya dokunduktan sonra buradan giriş yap.");
        navigation.navigate(SCREENS.LOGIN);
      }
    } catch (err) {
      H.error();
      showAlert("Kayıt başarısız", authErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: C.bg }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? insets.top : 0}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{ paddingHorizontal: GUTTER, paddingTop: STEP.s1, paddingBottom: STEP.s4 }}
          keyboardShouldPersistTaps="handled"
          automaticallyAdjustKeyboardInsets={Platform.OS === "ios"}
          showsVerticalScrollIndicator={false}
        >
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Press haptic="none"
              onPress={() => navigation.goBack()}
              hitSlop={12}
              accessibilityLabel="Geri"
              accessibilityRole="button"
              style={{ minWidth: 44, minHeight: 44, justifyContent: "center" }}
            >
              <Icon name="arrowL" size={NAV_ICON.back} color={C.text2} />
            </Press>
          </View>

          <Animated.View style={{ marginTop: STEP.s2 }}>
            <Text style={[TYPOGRAPHY.heading, { fontSize: 28, color: C.text, maxWidth: 280 }]}>
              Hesap oluştur.
            </Text>
            <Text style={[TYPOGRAPHY.body, { fontSize: 13.5, color: C.text3, marginTop: STEP.s2, maxWidth: 302 }]}>
              {registerLeadCopy()}
            </Text>
          </Animated.View>

          <View style={{ marginTop: STEP.s4 }}>
            <Animated.View>
              <AuthInput label="AD SOYAD" value={name} onChangeText={setName} placeholder="Arda Karaca" autoCapitalize="words" error={errors.name} />
            </Animated.View>

            <Animated.View>
              <AuthInput label="E-POSTA" value={email} onChangeText={setEmail} placeholder="ornek@mail.com" keyboardType="email-address" error={errors.email} />
            </Animated.View>

            <Animated.View>
              <AuthInput label="ŞİFRE" value={password} onChangeText={setPassword} placeholder="••••••••••" secureTextEntry error={errors.password} />
              <PasswordStrength password={password} />
            </Animated.View>
          </View>

          <Animated.View style={{ marginTop: STEP.s2 }}>
            <TermsCheckbox
              checked={agreed}
              onToggle={() => setAgreed((v) => !v)}
              onOpenTerms={() => navigation.navigate(SCREENS.TERMS)}
              onOpenPrivacy={() => navigation.navigate(SCREENS.PRIVACY)}
            />
          </Animated.View>

          <Animated.View>
            <Button onPress={submit} loading={busy} size="lg" fullWidth style={{ marginTop: STEP.s3 }}>
              {busy ? "Hesap açılıyor..." : "Hesabı oluştur"}
            </Button>
          </Animated.View>

          <Animated.View>
            <View style={{ flexDirection: "row", alignItems: "center", marginVertical: STEP.s3, gap: STEP.s2 }}>
              <View style={{ flex: 1, height: 1, backgroundColor: C.line }} />
              <Text style={[TYPOGRAPHY.label, { color: C.text3, letterSpacing: 2 }]}>VEYA</Text>
              <View style={{ flex: 1, height: 1, backgroundColor: C.line }} />
            </View>
            <SocialAuthButtons />
          </Animated.View>

          <Animated.View>
            <Press haptic="none" onPress={() => navigation.navigate(SCREENS.LOGIN)} style={{ marginTop: STEP.s4, alignItems: "center", minHeight: 44, justifyContent: "center", flexDirection: "row", gap: STEP.s1 / 2 }} hitSlop={6}>
              <Text style={[TYPOGRAPHY.body, { fontSize: 13, color: C.text3 }]}>Hesabın var mı?</Text>
              <Text style={[TYPOGRAPHY.bodySemiBold, { fontSize: 13, color: C.accentBright }]}>Giriş yap</Text>
            </Press>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
