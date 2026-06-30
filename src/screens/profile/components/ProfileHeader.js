import { useState, useEffect, useMemo } from "react";
import { View, Text, Pressable, ActivityIndicator } from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import * as ImagePicker from "expo-image-picker";
import { useC } from "../../../contexts/ThemeContext";
import { Icon } from "../../../components/design";
import { useAuth } from "../../../contexts/AuthContext";
import { uploadAvatar, getAvatarUrl } from "../../../supabase/storage";
import { getProfile, updateProfile } from "../../../supabase/profiles";
import { useAlert } from "../../../contexts/AlertContext";
import { TYPOGRAPHY, SPACING, RADIUS } from "../../../themes/tokens";
import * as H from "../../../lib/haptics";

function avatarPalette(name = "?", C) {
  const sum = name.split("").reduce((s, c) => s + c.charCodeAt(0), 0);
  const palette = [
    [C.accent, C.accent + "CC"],
    [C.purple, C.pink + "CC"],
    [C.blue, C.teal + "CC"],
    [C.pink, C.purple + "CC"],
    [C.green, C.teal + "CC"],
    [C.teal, C.blue + "CC"],
  ];
  return palette[sum % palette.length];
}

export function ProfileHeader({ name = "Öğrenci", exam, streak }) {
  const C = useC();
  const initials = (name || "??").slice(0, 2).toUpperCase();
  const { user } = useAuth();
  const showAlert = useAlert();
  const [avatarUri, setAvatarUri] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [c1, c2] = avatarPalette(name, C);

  useEffect(() => {
    if (!user?.id || user.id === "dev") return;
    getProfile(user.id)
      .then((p) => { if (p?.avatar_url) setAvatarUri(p.avatar_url); })
      .catch(() => {});
  }, [user?.id]);

  const avatarSource = useMemo(() => avatarUri ? { uri: avatarUri } : null, [avatarUri]);

  const handleAvatarPicked = async (localUri) => {
    setAvatarUri(localUri);
    setUploading(true);
    try {
      const path = await uploadAvatar(user.id, localUri);
      const url = getAvatarUrl(path);
      await updateProfile(user.id, { avatar_url: url });
      H.success();
      setAvatarUri(url + "?t=" + Date.now());
    } catch (e) {
      showAlert("Hata", "Avatar yüklenirken bir sorun oluştu.\n\n" + (e?.message || ""));
    } finally {
      setUploading(false);
    }
  };

  const pickFromGallery = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) { showAlert("İzin gerekli", "Galeri erişimi için izin ver."); return; }
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"], quality: 0.7, allowsEditing: true, aspect: [1, 1],
    });
    if (!res.canceled && res.assets?.length) handleAvatarPicked(res.assets[0].uri);
  };

  const pickFromCamera = async () => {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) { showAlert("İzin gerekli", "Kamera erişimi için izin ver."); return; }
    const res = await ImagePicker.launchCameraAsync({
      mediaTypes: ["images"], quality: 0.7, allowsEditing: true, aspect: [1, 1],
    });
    if (!res.canceled && res.assets?.length) handleAvatarPicked(res.assets[0].uri);
  };

  const pickAvatar = () => {
    if (!user?.id) return;
    H.medium();
    showAlert("Profil Fotoğrafı", "Nereden eklemek istersin?", [
      { text: "Kamera", onPress: pickFromCamera },
      { text: "Galeri", onPress: pickFromGallery },
      { text: "İptal", style: "cancel" },
    ]);
  };

  return (
    <View style={{
      flexDirection: "row",
      alignItems: "center",
      gap: SPACING.lg,
      marginTop: SPACING.md,
      marginBottom: SPACING.lg,
    }}>
      {/* Avatar */}
      <Pressable onPress={pickAvatar} style={{ position: "relative" }}>
        <View style={{
          width: 74, height: 74, borderRadius: 24,
          overflow: "hidden",
          backgroundColor: C.surface2,
        }}>
          {avatarUri ? (
            <Image
              source={avatarSource}
              style={{ width: 74, height: 74 }}
              contentFit="cover"
              cachePolicy="memory-disk"
              transition={200}
            />
          ) : (
            <LinearGradient
              colors={[c1, c2]}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
              style={{ width: 74, height: 74, alignItems: "center", justifyContent: "center" }}
            >
              <Text style={{
                fontFamily: "SpaceGrotesk_700Bold",
                fontSize: 27, color: C.textOnFill, letterSpacing: -0.5,
              }}>
                {initials}
              </Text>
            </LinearGradient>
          )}
          {uploading && (
            <View style={{
              position: "absolute", left: 0, right: 0, top: 0, bottom: 0,
              backgroundColor: "rgba(0,0,0,0.45)",
              alignItems: "center", justifyContent: "center",
            }}>
              <ActivityIndicator color={C.textOnFill} size="small" />
            </View>
          )}
        </View>
        <View style={{
          position: "absolute", bottom: -2, right: -2,
          width: 20, height: 20, borderRadius: 10,
          backgroundColor: C.accent,
          alignItems: "center", justifyContent: "center",
          borderWidth: 2, borderColor: C.bg,
        }}>
          <Icon name="camera" size={9} color={C.textOnFill} sw={2.4} />
        </View>
      </Pressable>

      {/* Name + pills */}
      <View style={{ flex: 1, gap: SPACING.sm }}>
        <Text style={{
          fontFamily: "SpaceGrotesk_700Bold",
          fontSize: 22, color: C.text, letterSpacing: -0.4,
        }} numberOfLines={1}>
          {name}
        </Text>
        <View style={{ flexDirection: "row", gap: SPACING.sm, flexWrap: "wrap" }}>
          {exam ? (
            <View style={{
              paddingHorizontal: SPACING.md, paddingVertical: 4,
              borderRadius: RADIUS.pill,
              backgroundColor: C.surface2,
            }}>
              <Text style={{ ...TYPOGRAPHY.captionMedium, color: C.sec }}>{exam}</Text>
            </View>
          ) : null}
          <View style={{
            flexDirection: "row", alignItems: "center", gap: 4,
            paddingHorizontal: SPACING.md, paddingVertical: 4,
            borderRadius: RADIUS.pill,
            backgroundColor: C.orange + "18",
            borderWidth: 1, borderColor: C.orange + "35",
          }}>
            <Text style={{ fontSize: 12 }}>🔥</Text>
            <Text style={{ ...TYPOGRAPHY.captionMedium, color: C.orange }}>
              {streak || 0} gün seri
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}
