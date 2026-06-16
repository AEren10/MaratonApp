import { useState, useCallback, useEffect, useMemo } from "react";
import { View, Text, ScrollView, Pressable, TextInput, StyleSheet, Alert, ActivityIndicator } from "react-native";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";

import { Icon } from "../../components/design";
import { TYPOGRAPHY, SPACING, RADIUS } from "../../themes/tokens";
import { useC } from "../../contexts/ThemeContext";
import { useAuth } from "../../contexts/AuthContext";
import { getProfile, updateProfile } from "../../supabase/profiles";
import { uploadAvatar, getAvatarUrl } from "../../supabase/storage";

export default function EditProfileScreen() {
  const navigation = useNavigation();
  const C = useC();
  const { user } = useAuth();
  const [name, setName] = useState(user?.user_metadata?.name || "");
  const [bio, setBio] = useState("");
  const [avatarUri, setAvatarUri] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const initials = (name || "??").slice(0, 2).toUpperCase();
  const avatarSource = useMemo(() => avatarUri ? { uri: avatarUri } : null, [avatarUri]);

  useEffect(() => {
    if (!user?.id || user.id === "dev") {
      setLoading(false);
      return;
    }
    getProfile(user.id)
      .then((p) => {
        if (p?.name) setName(p.name);
        if (p?.bio) setBio(p.bio);
        if (p?.avatar_url) setAvatarUri(p.avatar_url);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user?.id]);

  const pickAvatar = useCallback(async () => {
    if (!user?.id) return;
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert("İzin gerekli", "Galeriden fotoğraf seçmek için izin ver.");
      return;
    }
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.7,
      allowsEditing: true,
      aspect: [1, 1],
    });
    if (res.canceled) return;
    const localUri = res.assets[0].uri;
    setAvatarUri(localUri);
    setUploading(true);
    try {
      const path = await uploadAvatar(user.id, localUri);
      const url = getAvatarUrl(path);
      await updateProfile(user.id, { avatar_url: url });
      setAvatarUri(url + "?t=" + Date.now());
    } catch (e) {
      Alert.alert("Hata", "Avatar yüklenirken sorun oluştu.");
    } finally {
      setUploading(false);
    }
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
        <Pressable onPress={pickAvatar} style={s.avatarWrap}>
          <View>
            <View style={[s.avatarCircle, { backgroundColor: C.surface, borderColor: C.border }]}>
              {avatarSource ? (
                <Image source={avatarSource} style={s.avatarImg} contentFit="cover" cachePolicy="memory-disk" transition={200} />
              ) : (
                <Text style={[s.avatarInitials, { color: C.purple }]}>{initials}</Text>
              )}
              {uploading && (
                <View style={s.avatarOverlay}>
                  <ActivityIndicator color="#FFFFFF" />
                </View>
              )}
            </View>
            <View style={[s.cameraBadge, { backgroundColor: C.purple }]}>
              <Icon name="camera" size={14} color="#FFFFFF" />
            </View>
          </View>
          <Text style={[s.changeText, { color: C.purple }]}>Fotoğrafı değiştir</Text>
        </Pressable>

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
  scroll: { paddingHorizontal: SPACING.lg, paddingBottom: 60, alignItems: "stretch" },
  avatarWrap: { alignItems: "center", marginBottom: SPACING.xl, marginTop: SPACING.md },
  avatarCircle: {
    width: 96, height: 96, borderRadius: 48,
    alignItems: "center", justifyContent: "center",
    borderWidth: 1, overflow: "hidden",
  },
  avatarImg: { width: 96, height: 96, borderRadius: 48 },
  avatarInitials: { ...TYPOGRAPHY.heading, fontSize: 32 },
  avatarOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.45)",
    alignItems: "center", justifyContent: "center",
  },
  cameraBadge: {
    position: "absolute", bottom: 0, right: 0,
    width: 30, height: 30, borderRadius: 15,
    alignItems: "center", justifyContent: "center",
  },
  changeText: { ...TYPOGRAPHY.captionMedium, marginTop: SPACING.sm },
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
