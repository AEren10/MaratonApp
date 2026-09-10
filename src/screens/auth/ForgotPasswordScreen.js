import { useState, useCallback } from "react";
import { View, Text, Pressable, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Icon, Button } from "../../components/design";
import { TYPOGRAPHY, STEP, GUTTER } from "../../themes/tokens";
import { useC } from "../../contexts/ThemeContext";
import { resetPassword } from "../../supabase/auth";
import { AuthInput } from "./components/AuthInput";
import { EmailSentPanel } from "./components/EmailSentPanel";
import { useAlert } from "../../contexts/AlertContext";
import * as H from "../../lib/haptics";
import { authErrorMessage } from "../../supabase/authErrors";
import { emailSchema, validate } from "../../validations/auth";

export default function ForgotPasswordScreen() {
  const C = useC();
  const showAlert = useAlert();
  const navigation = useNavigation();
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const goBack = useCallback(() => navigation.goBack(), [navigation]);

  const submit = async () => {
    const check = validate(emailSchema, { email: email.trim() });
    if (!check.ok) {
      setError(check.errors.email);
      return;
    }
    setError("");
    setBusy(true);
    try {
      await resetPassword(email);
      H.success();
      setSent(true);
    } catch (err) {
      H.error();
      showAlert("Hata", authErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: C.bg }}>
      <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: GUTTER, paddingTop: STEP.s1 }}>
        <Pressable onPress={goBack} hitSlop={12} accessibilityLabel="Geri" accessibilityRole="button" style={{ padding: STEP.s1, minWidth: 44, minHeight: 44, justifyContent: "center" }}>
          <Icon name="arrowL" size={18} color={C.text2} />
        </Pressable>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ paddingHorizontal: GUTTER, paddingTop: STEP.s3, paddingBottom: STEP.s3 }} keyboardShouldPersistTaps="handled">
          {sent ? (
            <EmailSentPanel email={email.trim()} onResend={submit} />
          ) : (
            <>
              <Animated.View entering={FadeInDown.delay(80).duration(350)}>
                <Text style={[TYPOGRAPHY.heading, { fontSize: 28, color: C.text, maxWidth: 270 }]}>
                  Şifreni sıfırlayalım.
                </Text>
                <Text style={[TYPOGRAPHY.body, { fontSize: 13.5, color: C.text3, marginTop: STEP.s2, maxWidth: 302 }]}>
                  Hesabının e-posta adresini yaz, sıfırlama bağlantısını göndeririz.
                </Text>
              </Animated.View>

              <Animated.View entering={FadeInDown.delay(150).duration(350)} style={{ marginTop: STEP.s4 }}>
                <AuthInput label="E-POSTA" value={email} onChangeText={setEmail} placeholder="ornek@mail.com" keyboardType="email-address" error={error} />
              </Animated.View>

              <Animated.View entering={FadeInDown.delay(210).duration(350)}>
                <Button onPress={submit} loading={busy} size="lg" fullWidth style={{ marginTop: STEP.s1 }}>
                  {busy ? "Gönderiliyor..." : "Bağlantıyı gönder"}
                </Button>
                <Pressable onPress={goBack} style={{ alignItems: "center", justifyContent: "center", minHeight: 44, marginTop: STEP.s2 }} hitSlop={6}>
                  <Text style={[TYPOGRAPHY.captionMedium, { color: C.text3 }]}>Giriş ekranına dön</Text>
                </Pressable>
              </Animated.View>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
