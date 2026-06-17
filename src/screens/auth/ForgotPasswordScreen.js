import { useState, useCallback, useMemo } from "react";
import {
  View, Text, Pressable,
  KeyboardAvoidingView, Platform, ScrollView, StyleSheet,
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Icon } from "../../components/design";
import { TYPOGRAPHY, SPACING, RADIUS, SHADOWS } from "../../themes/tokens";
import { useC } from "../../contexts/ThemeContext";
import { resetPassword } from "../../supabase/auth";
import { AuthInput } from "./components/AuthInput";
import { useAlert } from "../../contexts/AlertContext";
import * as H from "../../lib/haptics";

export default function ForgotPasswordScreen() {
  const C = useC();
  const showAlert = useAlert();
  const s = useMemo(() => makeStyles(C), [C]);
  const navigation = useNavigation();
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const goBack = useCallback(() => navigation.goBack(), [navigation]);

  const submit = async () => {
    if (!email.includes("@")) {
      setError("Gecerli bir e-posta gir");
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
      showAlert("Hata", err.message ?? "Bir sorun oldu");
    } finally {
      setBusy(false);
    }
  };

  return (
    <SafeAreaView edges={["top"]} style={s.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={s.scroll}
          keyboardShouldPersistTaps="handled"
        >
          <Pressable onPress={goBack} hitSlop={12} style={s.back}>
            <Icon name="arrowL" size={22} color={C.text} />
          </Pressable>

          <Animated.View entering={FadeInDown.delay(100).duration(400).springify()}>
            <View style={s.iconWrap}>
              <Icon name="lock" size={56} color={C.amber} />
            </View>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(180).duration(400).springify()}>
            <Text style={s.title}>Sifreni Sifirla</Text>
            <Text style={s.subtitle}>
              E-posta adresini gir, sifre sifirlama baglantisi gonderelim.
            </Text>
          </Animated.View>

          {sent ? (
            <Animated.View entering={FadeInDown.delay(260).duration(400).springify()}>
              <View style={s.successBox}>
                <Icon name="checkCircle" size={28} color={C.green} />
                <Text style={s.successText}>
                  E-posta gonderildi! Gelen kutunu kontrol et.
                </Text>
              </View>
            </Animated.View>
          ) : (
            <>
              <Animated.View entering={FadeInDown.delay(260).duration(400).springify()}>
                <AuthInput
                  label="E-posta"
                  value={email}
                  onChangeText={setEmail}
                  placeholder="ornek@mail.com"
                  keyboardType="email-address"
                  error={error}
                />
              </Animated.View>
              <Animated.View entering={FadeInDown.delay(340).duration(400).springify()}>
                <Pressable
                  onPress={submit}
                  disabled={busy}
                  style={({ pressed }) => [
                    s.btn,
                    { opacity: busy ? 0.6 : pressed ? 0.85 : 1 },
                  ]}
                >
                  <Text style={s.btnText}>
                    {busy ? "Gonderiliyor..." : "Sifirlama Linki Gonder"}
                  </Text>
                </Pressable>
              </Animated.View>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function makeStyles(C) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: C.bg },
    scroll: { padding: SPACING.xxl, flexGrow: 1 },
    back: { marginBottom: SPACING.xxxl },
    iconWrap: { alignItems: "center", marginBottom: SPACING.xxl },
    title: { ...TYPOGRAPHY.heading, color: C.text, textAlign: "center" },
    subtitle: {
      ...TYPOGRAPHY.body, color: C.sec,
      textAlign: "center", marginTop: SPACING.sm, marginBottom: SPACING.xxxl,
    },
    btn: {
      backgroundColor: C.amber, borderRadius: RADIUS.lg,
      paddingVertical: SPACING.lg, alignItems: "center", marginTop: SPACING.sm,
      ...SHADOWS.amber,
    },
    btnText: { ...TYPOGRAPHY.button, color: C.bg },
    successBox: {
      alignItems: "center", gap: SPACING.md,
      backgroundColor: C.green + "18", borderWidth: 1, borderColor: C.green + "40",
      borderRadius: RADIUS.xl, padding: SPACING.xxl, marginTop: SPACING.lg,
    },
    successText: { ...TYPOGRAPHY.bodySemiBold, color: C.green, textAlign: "center" },
  });
}
