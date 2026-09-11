import { useState, useCallback } from "react";
import { View, Text, ScrollView, Pressable, StyleSheet, KeyboardAvoidingView, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";

import { Icon, Button, Input, Card } from "../../components/design";
import { TYPOGRAPHY, STEP, GUTTER } from "../../themes/tokens";
import { useC } from "../../contexts/ThemeContext";
import { updatePassword } from "../../supabase/auth";
import { useAlert } from "../../contexts/AlertContext";
import { authErrorMessage } from "../../supabase/authErrors";
import { changePasswordSchema, validate } from "../../validations/auth";
import * as H from "../../lib/haptics";

// Tasarimda bu ekranin ayri bir artboard'u yok (akista aniliyor, 4/1).
// Duzen uydurulmadi: tasarim SISTEMI uygulandi -- Input, Button, token
// olcekleri ve bolum etiketi.
export default function ChangePasswordScreen() {
  const navigation = useNavigation();
  const C = useC();
  const showAlert = useAlert();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const save = useCallback(async () => {
    if (saving) return;
    // Elle uzunluk/eslesme kontrolu yerine Zod (AGENTS.md).
    const res = validate(changePasswordSchema, { password, confirm });
    if (!res.ok) {
      H.error();
      setErrors(res.errors);
      return;
    }
    setErrors({});
    setSaving(true);
    try {
      await updatePassword(password);
      H.success();
      showAlert("Güncellendi", "Şifren başarıyla değiştirildi.");
      navigation.goBack();
    } catch (e) {
      H.error();
      showAlert("Hata", authErrorMessage(e));
    } finally {
      setSaving(false);
    }
  }, [password, confirm, navigation, saving, showAlert]);

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: C.bg }}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12} accessibilityRole="button" accessibilityLabel="Geri">
          <Icon name="arrowL" size={18} color={C.text2} />
        </Pressable>
        <Text style={[TYPOGRAPHY.subheading, { color: C.text, flex: 1 }]}>Şifre değiştir</Text>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <Input
            label="YENİ ŞİFRE"
            value={password}
            onChangeText={setPassword}
            placeholder="En az 6 karakter"
            secureTextEntry
            error={errors.password}
            textContentType="newPassword"
          />
          <Input
            label="ŞİFRE TEKRARI"
            value={confirm}
            onChangeText={setConfirm}
            placeholder="Yeni şifreyi yeniden yaz"
            secureTextEntry
            error={errors.confirm}
            textContentType="newPassword"
            style={styles.second}
          />

          <Card tone="surface" radius="panel" style={styles.note}>
            <Text style={[TYPOGRAPHY.meta, { color: C.text2, lineHeight: 21 }]}>
              Şifreni değiştirdikten sonra diğer cihazlarda yeniden giriş yapman
              gerekebilir.
            </Text>
          </Card>

          <Button
            variant="primary"
            size="lg"
            fullWidth
            onPress={save}
            loading={saving}
            disabled={!password || !confirm}
            style={styles.cta}
          >
            Kaydet
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
  second: { marginTop: STEP.s3 },
  note: { marginTop: STEP.s3 },
  cta: { marginTop: STEP.s4 },
});
