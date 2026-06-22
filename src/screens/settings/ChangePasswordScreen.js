import { useState, useCallback } from "react";
import { View, Text, ScrollView, Pressable, TextInput, StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";

import { Icon } from "../../components/design";
import { TYPOGRAPHY, SPACING, RADIUS } from "../../themes/tokens";
import { useC } from "../../contexts/ThemeContext";
import { updatePassword } from "../../supabase/auth";
import { useAlert } from "../../contexts/AlertContext";
import * as H from "../../lib/haptics";

export default function ChangePasswordScreen() {
  const navigation = useNavigation();
  const C = useC();
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [saving, setSaving] = useState(false);
  const showAlert = useAlert();

  const save = useCallback(async () => {
    if (saving) return;
    if (next.length < 6) {
      H.error();
      showAlert("Şifre kısa", "En az 6 karakter olmalı.");
      return;
    }
    if (next !== confirm) {
      H.error();
      showAlert("Eşleşmiyor", "Şifre tekrarı doğru değil.");
      return;
    }
    setSaving(true);
    try {
      await updatePassword(next);
      H.success();
      showAlert("Güncellendi", "Şifren başarıyla değiştirildi.");
      navigation.goBack();
    } catch (e) {
      H.error();
      showAlert("Hata", e.message || "Şifre değiştirilemedi.");
    } finally {
      setSaving(false);
    }
  }, [next, confirm, navigation, saving]);

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: C.bg }}>
      <View style={s.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
          <Icon name="arrowL" size={22} color={C.text} />
        </Pressable>
        <Text style={[s.title, { color: C.text }]}>Şifre Değiştir</Text>
        <View style={{ width: 22 }} />
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={s.scroll}>
        <Animated.View entering={FadeInDown.delay(80).duration(400).springify()}>
          <Text style={[s.label, { color: C.muted }]}>YENİ ŞİFRE</Text>
          <View style={[s.inputRow, { backgroundColor: C.surface, borderColor: C.border }]}>
            <TextInput
              value={next}
              onChangeText={setNext}
              placeholder="En az 6 karakter"
              placeholderTextColor={C.muted}
              style={[s.input, { color: C.text }]}
              secureTextEntry={!show}
              autoCapitalize="none"
            />
            <Pressable onPress={() => setShow((v) => !v)} hitSlop={8}>
              <Icon name={show ? "eye" : "lock"} size={18} color={C.muted} />
            </Pressable>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(160).duration(400).springify()}>
          <Text style={[s.label, { color: C.muted, marginTop: SPACING.lg }]}>TEKRAR</Text>
          <View style={[s.inputRow, { backgroundColor: C.surface, borderColor: C.border }]}>
            <TextInput
              value={confirm}
              onChangeText={setConfirm}
              placeholder="Yeniden gir"
              placeholderTextColor={C.muted}
              style={[s.input, { color: C.text }]}
              secureTextEntry={!show}
              autoCapitalize="none"
            />
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(240).duration(400).springify()}>
          <View style={[s.info, { backgroundColor: C.blue + "10", borderColor: C.blue + "30" }]}>
            <Icon name="info" size={14} color={C.blue} />
            <Text style={[s.infoText, { color: C.sec }]}>
              Şifreni değiştirdikten sonra diğer cihazlarda tekrar giriş yapman gerekebilir.
            </Text>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(320).duration(400).springify()}>
          <Pressable
            onPress={save}
            disabled={saving}
            style={({ pressed }) => [
              s.saveBtn,
              { backgroundColor: C.accent },
              (pressed || saving) && { opacity: 0.85 },
            ]}
          >
            {saving ? <ActivityIndicator color="#FFFFFF" size="small" /> : <Icon name="check" size={20} color="#FFFFFF" />}
            <Text style={s.saveText}>{saving ? "Değiştiriliyor..." : "Şifreyi Değiştir"}</Text>
          </Pressable>
        </Animated.View>
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
  inputRow: {
    flexDirection: "row", alignItems: "center",
    borderRadius: RADIUS.lg, borderWidth: 1,
    paddingHorizontal: SPACING.md,
  },
  input: { ...TYPOGRAPHY.body, flex: 1, paddingVertical: SPACING.md },
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
