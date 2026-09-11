import { useState, useCallback } from "react";
import { View, Text, ScrollView, Pressable, StyleSheet, KeyboardAvoidingView, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";

import { Icon, Button, Input, Card } from "../../components/design";
import { TYPOGRAPHY, STEP, GUTTER } from "../../themes/tokens";
import { useC } from "../../contexts/ThemeContext";
import { useAuth } from "../../contexts/AuthContext";
import { updateEmail } from "../../supabase/auth";
import { useAlert } from "../../contexts/AlertContext";
import { authErrorMessage } from "../../supabase/authErrors";
import { emailSchema, validate } from "../../validations/auth";
import * as H from "../../lib/haptics";

// Tasarimda bu ekranin ayri bir artboard'u yok (akista aniliyor, 4/2).
// Duzen uydurulmadi: tasarim SISTEMI uygulandi.
export default function EditEmailScreen() {
  const navigation = useNavigation();
  const C = useC();
  const { user } = useAuth();
  const showAlert = useAlert();
  const [email, setEmail] = useState("");
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  const save = useCallback(async () => {
    if (saving) return;
    const v = email.trim();
    const check = validate(emailSchema, { email: v });
    if (!check.ok) {
      H.error();
      setError(check.errors.email);
      return;
    }
    if (v === user?.email) {
      H.error();
      setError("Bu zaten mevcut e-postan.");
      return;
    }
    setError(null);
    setSaving(true);
    try {
      await updateEmail(v);
      H.success();
      showAlert(
        "Doğrulama gönderildi",
        `${v} adresine bir doğrulama bağlantısı gönderildi. Onayladığında değişiklik aktifleşecek.`,
      );
      navigation.goBack();
    } catch (e) {
      H.error();
      showAlert("Hata", authErrorMessage(e));
    } finally {
      setSaving(false);
    }
  }, [email, user?.email, navigation, saving, showAlert]);

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: C.bg }}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12} accessibilityRole="button" accessibilityLabel="Geri">
          <Icon name="arrowL" size={18} color={C.text2} />
        </Pressable>
        <Text style={[TYPOGRAPHY.subheading, { color: C.text, flex: 1 }]}>E-posta değiştir</Text>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          {user?.email ? (
            <View style={styles.current}>
              <Text style={[TYPOGRAPHY.label, { color: C.text2 }]}>ŞU ANKİ ADRES</Text>
              <Text style={[TYPOGRAPHY.bodyMedium, { color: C.text, marginTop: STEP.s1 }]}>
                {user.email}
              </Text>
            </View>
          ) : null}

          <Input
            label="YENİ E-POSTA"
            value={email}
            onChangeText={setEmail}
            placeholder="ornek@eposta.com"
            keyboardType="email-address"
            error={error}
            textContentType="emailAddress"
            style={styles.field}
          />

          <Card tone="surface" radius="panel" style={styles.note}>
            <Text style={[TYPOGRAPHY.meta, { color: C.text2, lineHeight: 21 }]}>
              Yeni adrese bir doğrulama bağlantısı gönderilir. Bağlantıyı
              onaylayana kadar girişte eski adresin geçerli kalır.
            </Text>
          </Card>

          <Button
            variant="primary"
            size="lg"
            fullWidth
            onPress={save}
            loading={saving}
            disabled={!email.trim()}
            style={styles.cta}
          >
            Doğrulama gönder
          </Button>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingHorizontal: GUTTER,
    paddingVertical: STEP.s2,
  },
  scroll: { paddingHorizontal: GUTTER, paddingTop: STEP.s3, paddingBottom: 60 },
  current: { marginBottom: STEP.s4 },
  field: { marginTop: 0 },
  note: { marginTop: STEP.s3 },
  cta: { marginTop: STEP.s4 },
});
