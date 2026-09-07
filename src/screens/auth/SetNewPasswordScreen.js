import { useCallback, useEffect, useMemo, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button, Input, Icon } from "../../components/design";
import { TYPOGRAPHY, SPACING } from "../../themes/tokens";
import { useC } from "../../contexts/ThemeContext";
import { updatePassword, establishRecoverySession, signOut } from "../../supabase/auth";
import * as Linking from "expo-linking";
import { authErrorMessage } from "../../supabase/authErrors";
import { useAlert } from "../../contexts/AlertContext";
import { useAuth } from "../../contexts/AuthContext";
import * as H from "../../lib/haptics";

const MIN_LENGTH = 6;

/**
 * Şifre sıfırlama linkiyle gelinen ekran.
 *
 * Bu ekran YOKTU ve zincir burada kopuyordu: kullanıcı "şifremi unuttum"
 * diyor, e-posta gidiyor, linke basıyor — ve gidecek bir yer olmadığı için
 * şifresini asla değiştiremiyordu. Hesabına kalıcı olarak kilitleniyordu.
 *
 * Supabase link açıldığında oturumu kendisi kuruyor (recovery token),
 * bu yüzden burada yalnızca updateUser({ password }) çağırmak yeterli.
 *
 * TASARIM NOTU: yeni tasarımda AKIŞ 12'de "Şifre Sıfırla → Bağlantı
 * Gönderildi" var; bu ekran o zincirin son halkası.
 */
export default function SetNewPasswordScreen() {
  const C = useC();
  const s = useMemo(() => makeStyles(C), [C]);
  const showAlert = useAlert();
  const { recoveryUrl, endRecovery } = useAuth();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState({});
  // Sıfırlama linkindeki token'la oturum kuruluyor mu.
  const [sessionState, setSessionState] = useState("checking"); // checking | ready | invalid

  // OTURUM KURMA ADIMI — bu olmadan updateUser "Auth session missing" verir.
  //
  // client.js'te detectSessionInUrl: false (React Native'de doğru ayar), yani
  // Supabase linkteki token'ı kendisi tüketmiyor. Ekran açıldığında URL'den
  // alıp elle oturum kurmamız gerekiyor. Bu adım yoktu: ekran vardı, form
  // vardı, ama kaydet dendiğinde hep hata alınıyordu.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      // Link öncelikle AuthContext'in yakaladığı URL'den gelir; uygulama
      // açıkken gelen linklerde getInitialURL eski değeri döndürebiliyor.
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
      // Kurtarma linki bir oturum kurmuştu. Şifre değiştikten sonra o oturumu
      // kapatıp temiz girişe yönlendiriyoruz; kullanıcı yeni şifresini
      // gerçekten kullansın ve eski oturum ortada kalmasın.
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

  // Link geçersiz/süresi dolmuşsa form GÖSTERME — kullanıcı boşuna doldurup
  // anlamsız bir hata almasın, ne yapması gerektiğini söyle.
  if (sessionState === "invalid") {
    return (
      <SafeAreaView edges={["top"]} style={s.safe}>
        <View style={s.content}>
          <Icon name="alertCircle" size={32} color={C.warn} />
          <Text style={s.title}>Bağlantı geçersiz</Text>
          <Text style={s.desc}>
            Şifre sıfırlama bağlantısının süresi dolmuş ya da daha önce
            kullanılmış olabilir. Yeni bir bağlantı isteyebilirsin.
          </Text>
          {/* Kurtarma yığınında BU EKRAN TEK BAŞINA. navigate/replace ile
              başka bir ekrana gidilemez; kurtarma modundan çıkmak doğru
              hareket — navigasyon normal akışına (giriş) geri döner. */}
          <Button onPress={endRecovery} size="lg" fullWidth>
            Yeni bağlantı iste
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={["top"]} style={s.safe}>
      <View style={s.content}>
        <Icon name="lock" size={32} color={C.accent} />
        <Text style={s.title}>Yeni şifreni belirle</Text>
        <Text style={s.desc}>
          Hesabına yeni bir şifre seç. En az {MIN_LENGTH} karakter olmalı.
        </Text>

        <Input
          value={password}
          onChangeText={(t) => { setPassword(t); if (errors.password) setErrors((p) => ({ ...p, password: null })); }}
          label="Yeni şifre"
          placeholder="En az 6 karakter"
          secureTextEntry
          error={errors.password}
          accessibilityLabel="Yeni şifre"
        />
        <Input
          value={confirm}
          onChangeText={(t) => { setConfirm(t); if (errors.confirm) setErrors((p) => ({ ...p, confirm: null })); }}
          label="Yeni şifre (tekrar)"
          placeholder="Aynı şifreyi tekrar yaz"
          secureTextEntry
          error={errors.confirm}
          accessibilityLabel="Yeni şifre tekrar"
        />

        <Button onPress={submit} disabled={busy || sessionState !== "ready"} loading={busy || sessionState === "checking"} size="lg" fullWidth>
          {sessionState === "checking" ? "Bağlantı doğrulanıyor…" : busy ? "Kaydediliyor…" : "Şifreyi güncelle"}
        </Button>
      </View>
    </SafeAreaView>
  );
}

function makeStyles(C) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: C.bg },
    content: { flex: 1, padding: SPACING.xxl, gap: SPACING.lg, justifyContent: "center" },
    title: { ...TYPOGRAPHY.heading, color: C.text },
    desc: { ...TYPOGRAPHY.body, color: C.sec, marginBottom: SPACING.sm },
  });
}
