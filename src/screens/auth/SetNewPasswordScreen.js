import { useCallback, useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Linking from "expo-linking";

import { Button, Input, Icon, Press } from "../../components/design";
import { ScreenErrorBoundary } from "../../components/common/ScreenErrorBoundary";
import { TYPOGRAPHY, STEP, GUTTER, NAV_ICON, CONTROL } from "../../themes/tokens";
import { useC } from "../../contexts/ThemeContext";
import { updatePassword, establishRecoverySession, signOut } from "../../supabase/auth";
import { authErrorMessage } from "../../supabase/authErrors";
import { useAlert } from "../../contexts/AlertContext";
import { useAuth } from "../../contexts/AuthContext";
import * as H from "../../lib/haptics";

const MIN_LENGTH = 6;

function SetNewPasswordContent() {
  const C = useC();
  const showAlert = useAlert();
  const { recoveryUrl, endRecovery } = useAuth();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState({});
  const [sessionState, setSessionState] = useState("checking");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const url = recoveryUrl || (await Linking.getInitialURL().catch(() => null));
      const ok = await establishRecoverySession(url);
      if (!cancelled) setSessionState(ok ? "ready" : "invalid");
    })();
    return () => { cancelled = true; };
  }, [recoveryUrl]);

  const submit = useCallback(async () => {
    const e = {};
    if (password.length < MIN_LENGTH) e.password = `Şifre en az ${MIN_LENGTH} karakter olmalı`;
    if (password !== confirm) e.confirm = "Şifreler eşleşmiyor";
    setErrors(e);
    if (Object.keys(e).length) return;

    setBusy(true);
    try {
      await updatePassword(password);
      H.success();
      await signOut().catch(() => {});
      endRecovery();
      showAlert("Şifren güncellendi", "Yeni şifrenle giriş yapabilirsin.");
    } catch (err) {
      H.error();
      showAlert("Değiştirilemedi", authErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }, [password, confirm, showAlert, endRecovery]);

  const header = (
    <View style={styles.topBar}>
      <Press
        haptic="none"
        onPress={endRecovery}
        hitSlop={12}
        accessibilityRole="button"
        accessibilityLabel="Geri"
        style={styles.backBtn}
      >
        <Icon name="arrowL" size={NAV_ICON.back} color={C.text2} />
      </Press>
    </View>
  );

  if (sessionState === "invalid") {
    return (
      <SafeAreaView edges={["top"]} style={[styles.safe, { backgroundColor: C.bg }]}>
        {header}
        <View style={styles.content}>
          <Icon name="alertCircle" size={32} color={C.warn} />
          <Text style={[TYPOGRAPHY.heading, { color: C.text }]}>Bağlantı geçersiz</Text>
          <Text style={[TYPOGRAPHY.body, { color: C.text2 }]}>
            Şifre sıfırlama bağlantısının süresi dolmuş ya da daha önce kullanılmış olabilir.
          </Text>
          <Button onPress={endRecovery} size="lg" fullWidth>
            Yeni bağlantı iste
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={["top"]} style={[styles.safe, { backgroundColor: C.bg }]}>
      {header}
      <View style={styles.content}>
        <Icon name="lock" size={32} color={C.accent} />
        <Text style={[TYPOGRAPHY.heading, { color: C.text }]}>Yeni şifreni belirle</Text>
        <Text style={[TYPOGRAPHY.body, { color: C.text2 }]}>
          Hesabına yeni bir şifre seç. En az {MIN_LENGTH} karakter olmalı.
        </Text>

        <Input
          value={password}
          onChangeText={(t) => { setPassword(t); if (errors.password) setErrors((p) => ({ ...p, password: null })); }}
          label="Yeni şifre" placeholder="En az 6 karakter" secureTextEntry
          error={errors.password} accessibilityLabel="Yeni şifre"
        />
        <Input
          value={confirm}
          onChangeText={(t) => { setConfirm(t); if (errors.confirm) setErrors((p) => ({ ...p, confirm: null })); }}
          label="Yeni şifre (tekrar)" placeholder="Aynı şifreyi tekrar yaz" secureTextEntry
          error={errors.confirm} accessibilityLabel="Yeni şifre tekrar"
        />

        <Button
          onPress={submit}
          disabled={busy || sessionState !== "ready"}
          loading={busy || sessionState === "checking"}
          size="lg"
          fullWidth
        >
          {sessionState === "checking" ? "Bağlantı doğrulanıyor…" : busy ? "Kaydediliyor…" : "Şifreyi güncelle"}
        </Button>
      </View>
    </SafeAreaView>
  );
}

export default function SetNewPasswordScreen() {
  return (
    <ScreenErrorBoundary>
      <SetNewPasswordContent />
    </ScreenErrorBoundary>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  topBar: { paddingHorizontal: GUTTER, paddingTop: STEP.s1 },
  backBtn: { width: CONTROL.tapMin, height: CONTROL.tapMin, justifyContent: "center" },
  content: { flex: 1, paddingHorizontal: GUTTER, gap: STEP.s3, justifyContent: "center" },
});
