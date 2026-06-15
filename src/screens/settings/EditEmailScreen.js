import { useState, useCallback } from "react";
import { View, Text, ScrollView, Pressable, TextInput, StyleSheet, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";

import { Icon } from "../../components/design";
import { TYPOGRAPHY, SPACING, RADIUS } from "../../themes/tokens";
import { useC } from "../../contexts/ThemeContext";
import { useAuth } from "../../contexts/AuthContext";
import { supabase } from "../../supabase/client";

export default function EditEmailScreen() {
  const navigation = useNavigation();
  const C = useC();
  const { user } = useAuth();
  const [email, setEmail] = useState("");
  const [saving, setSaving] = useState(false);

  const save = useCallback(async () => {
    if (saving) return;
    const v = email.trim();
    if (!v.includes("@")) {
      Alert.alert("Geçersiz", "Geçerli bir e-posta gir.");
      return;
    }
    if (v === user?.email) {
      Alert.alert("Aynı adres", "Bu zaten mevcut e-postan.");
      return;
    }
    setSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({ email: v });
      if (error) throw error;
      Alert.alert(
        "Doğrulama gönderildi",
        `${v} adresine bir doğrulama bağlantısı gönderildi. Onayladığında değişiklik aktifleşecek.`,
      );
      navigation.goBack();
    } catch (e) {
      Alert.alert("Hata", e.message || "E-posta değiştirilemedi.");
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

        <View style={[s.info, { backgroundColor: C.amber + "12", borderColor: C.amber + "32" }]}>
          <Icon name="alert" size={14} color={C.amber} />
          <Text style={[s.infoText, { color: C.sec }]}>
            Yeni adresine bir doğrulama bağlantısı gönderilecek. Bağlantıyı onaylayana kadar e-posta değişmez.
          </Text>
        </View>

        <Pressable
          onPress={save}
          disabled={saving}
          style={({ pressed }) => [
            s.saveBtn,
            { backgroundColor: C.purple },
            (pressed || saving) && { opacity: 0.85 },
          ]}
        >
          <Icon name="mail" size={20} color="#FFFFFF" />
          <Text style={s.saveText}>{saving ? "Gönderiliyor..." : "Doğrulama Gönder"}</Text>
        </Pressable>
      </ScrollView>
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
  saveBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: SPACING.sm, borderRadius: RADIUS.xl, paddingVertical: SPACING.lg, marginTop: SPACING.xl,
  },
  saveText: { ...TYPOGRAPHY.button, color: "#FFFFFF" },
});
