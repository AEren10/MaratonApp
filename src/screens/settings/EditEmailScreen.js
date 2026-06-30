import { useState, useCallback } from "react";
import { View, Text, ScrollView, Pressable, TextInput, StyleSheet, KeyboardAvoidingView, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";

import { Icon, Button } from "../../components/design";
import { TYPOGRAPHY, SPACING, RADIUS } from "../../themes/tokens";
import { useC } from "../../contexts/ThemeContext";
import { useAuth } from "../../contexts/AuthContext";
import { updateEmail } from "../../supabase/auth";
import { useAlert } from "../../contexts/AlertContext";
import * as H from "../../lib/haptics";

export default function EditEmailScreen() {
  const navigation = useNavigation();
  const C = useC();
  const { user } = useAuth();
  const [email, setEmail] = useState("");
  const [saving, setSaving] = useState(false);
  const showAlert = useAlert();

  const save = useCallback(async () => {
    if (saving) return;
    const v = email.trim();
    if (!v.includes("@")) {
      H.error();
      showAlert("Geçersiz", "Geçerli bir e-posta gir.");
      return;
    }
    if (v === user?.email) {
      H.error();
      showAlert("Aynı adres", "Bu zaten mevcut e-postan.");
      return;
    }
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
      showAlert("Hata", e.message || "E-posta değiştirilemedi.");
    } finally {
      setSaving(false);
    }
  }, [email, user?.email, navigation, saving]);

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: C.bg }}>
      <View style={s.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
          <Icon name="arrowL" size={22} color={C.text} />
        </Pressable>
        <Text style={[s.title, { color: C.text }]}>E-posta Değiştir</Text>
        <View style={{ width: 22 }} />
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={s.scroll}>
        <View style={[s.currentBox, { backgroundColor: C.surface, borderColor: C.border }]}>
          <Text style={[s.currentLabel, { color: C.muted }]}>MEVCUT</Text>
          <Text style={[s.currentValue, { color: C.text }]}>{user?.email || "—"}</Text>
        </View>

        <Text style={[s.label, { color: C.muted, marginTop: SPACING.xl }]}>YENİ E-POSTA</Text>
        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="yeni@mail.com"
          placeholderTextColor={C.muted}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          style={[s.input, { backgroundColor: C.surface, color: C.text, borderColor: C.border }]}
        />

        <View style={[s.info, { backgroundColor: C.accent + "12", borderColor: C.accent + "32" }]}>
          <Icon name="alert" size={14} color={C.accent} />
          <Text style={[s.infoText, { color: C.sec }]}>
            Yeni adresine bir doğrulama bağlantısı gönderilecek. Bağlantıyı onaylayana kadar e-posta değişmez.
          </Text>
        </View>

        <Button onPress={save} loading={saving} icon="mail" fullWidth style={{ marginTop: SPACING.xl }}>
          {saving ? "Gönderiliyor..." : "Doğrulama Gönder"}
        </Button>
      </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md,
  },
  title: { ...TYPOGRAPHY.subheading },
  scroll: { paddingHorizontal: SPACING.lg, paddingBottom: 60 },
  label: { ...TYPOGRAPHY.label, marginBottom: SPACING.sm },
  input: {
    ...TYPOGRAPHY.body,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
  },
  currentBox: {
    borderRadius: RADIUS.lg, borderWidth: 1, padding: SPACING.md,
  },
  currentLabel: { ...TYPOGRAPHY.label },
  currentValue: { ...TYPOGRAPHY.bodySemiBold, marginTop: 4 },
  info: {
    flexDirection: "row", alignItems: "flex-start", gap: 8,
    padding: SPACING.md, borderRadius: RADIUS.md, borderWidth: 1, marginTop: SPACING.xl,
  },
  infoText: { ...TYPOGRAPHY.caption, flex: 1 },
  saveText: { ...TYPOGRAPHY.button },
});
