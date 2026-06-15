import { useState, useCallback, useEffect } from "react";
import { View, Text, ScrollView, Pressable, TextInput, StyleSheet, Alert, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";

import { Icon } from "../../components/design";
import { TYPOGRAPHY, SPACING, RADIUS } from "../../themes/tokens";
import { useC } from "../../contexts/ThemeContext";
import { useAuth } from "../../contexts/AuthContext";
import { getProfile, updateProfile } from "../../supabase/profiles";

export default function EditProfileScreen() {
  const navigation = useNavigation();
  const C = useC();
  const { user } = useAuth();
  const [name, setName] = useState(user?.user_metadata?.name || "");
  const [bio, setBio] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user?.id || user.id === "dev") {
      setLoading(false);
      return;
    }
    getProfile(user.id)
      .then((p) => {
        if (p?.name) setName(p.name);
        if (p?.bio) setBio(p.bio);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user?.id]);

  const save = useCallback(async () => {
    if (saving) return;
    if (!name.trim()) {
      Alert.alert("İsim eksik", "Lütfen adını gir.");
      return;
    }
    setSaving(true);
    try {
      await updateProfile(user.id, { name: name.trim(), bio: bio.trim() || null });
      Alert.alert("Kaydedildi", "Profilin güncellendi.");
      navigation.goBack();
    } catch (e) {
      Alert.alert("Hata", e.message || "Profil güncellenemedi.");
    } finally {
      setSaving(false);
    }
  }, [name, bio, user?.id, navigation, saving]);

  if (loading) {
    return (
      <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: C.bg }}>
        <ActivityIndicator color={C.purple} style={{ marginTop: 60 }} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: C.bg }}>
      <View style={s.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
          <Icon name="arrowL" size={22} color={C.text} />
        </Pressable>
        <Text style={[s.title, { color: C.text }]}>Profil Düzenle</Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView contentContainerStyle={s.scroll}>
        <Text style={[s.label, { color: C.muted }]}>AD SOYAD</Text>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Adın"
          placeholderTextColor={C.muted}
          style={[s.input, { backgroundColor: C.surface, color: C.text, borderColor: C.border }]}
          maxLength={50}
        />

        <Text style={[s.label, { color: C.muted, marginTop: SPACING.lg }]}>HAKKINDA (opsiyonel)</Text>
        <TextInput
          value={bio}
          onChangeText={setBio}
          placeholder="Kendinden kısa bahset"
          placeholderTextColor={C.muted}
          style={[s.input, s.multiline, { backgroundColor: C.surface, color: C.text, borderColor: C.border }]}
          multiline
          maxLength={150}
        />
        <Text style={[s.hint, { color: C.muted }]}>{bio.length}/150</Text>

        <Pressable
          onPress={save}
          disabled={saving}
          style={({ pressed }) => [
            s.saveBtn,
            { backgroundColor: C.purple },
            (pressed || saving) && { opacity: 0.85 },
          ]}
        >
          <Icon name="check" size={20} color="#FFFFFF" />
          <Text style={s.saveText}>{saving ? "Kaydediliyor..." : "Kaydet"}</Text>
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
  multiline: { minHeight: 100, textAlignVertical: "top" },
  hint: { ...TYPOGRAPHY.micro, marginTop: 4, alignSelf: "flex-end" },
  saveBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: SPACING.sm, borderRadius: RADIUS.xl, paddingVertical: SPACING.lg, marginTop: SPACING.xl,
  },
  saveText: { ...TYPOGRAPHY.button, color: "#FFFFFF" },
});
