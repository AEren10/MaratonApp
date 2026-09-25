import { useState, useCallback } from "react";
import { View, Text, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import Animated from "react-native-reanimated";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
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
import { Press } from "../../components/design/Press";

export default function ForgotPasswordScreen() {
  const C = useC();
  const insets = useSafeAreaInsets();
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
              onPress={goBack}
              hitSlop={12}
              accessibilityLabel="Geri"
              accessibilityRole="button"
              style={{ minWidth: 44, minHeight: 44, justifyContent: "center" }}
            >
              <Icon name="arrowL" size={18} color={C.text2} />
            </Press>
          </View>

          {sent ? (
            <EmailSentPanel email={email.trim()} onResend={submit} />
          ) : (
            <>
              <Animated.View style={{ marginTop: STEP.s2 }}>
                <Text style={[TYPOGRAPHY.heading, { fontSize: 28, color: C.text, maxWidth: 270 }]}>
                  Şifreni sıfırlayalım.
                </Text>
                <Text style={[TYPOGRAPHY.body, { fontSize: 13.5, color: C.text3, marginTop: STEP.s2, maxWidth: 302 }]}>
                  Hesabının e-posta adresini yaz, sıfırlama bağlantısını göndeririz.
                </Text>
              </Animated.View>

              <Animated.View style={{ marginTop: STEP.s4 }}>
                <AuthInput label="E-POSTA" value={email} onChangeText={setEmail} placeholder="ornek@mail.com" keyboardType="email-address" error={error} />
              </Animated.View>

              <Animated.View>
                <Button onPress={submit} loading={busy} size="lg" fullWidth style={{ marginTop: STEP.s1 }}>
                  {busy ? "Gönderiliyor..." : "Bağlantıyı gönder"}
                </Button>
                <Press haptic="none" onPress={goBack} style={{ alignItems: "center", justifyContent: "center", minHeight: 44, marginTop: STEP.s2 }} hitSlop={6}>
                  <Text style={[TYPOGRAPHY.captionMedium, { color: C.text3 }]}>Giriş ekranına dön</Text>
                </Press>
              </Animated.View>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
