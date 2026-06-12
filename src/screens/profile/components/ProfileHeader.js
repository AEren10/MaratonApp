import { useState, useEffect } from "react";
import { View, Text, Pressable, ActivityIndicator, Alert } from "react-native";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { C, TYPOGRAPHY, SPACING } from "../../../themes/tokens";
import { Icon, Chip, Stat } from "../../../components/design";
import { useAuth } from "../../../contexts/AuthContext";
import { uploadAvatar, getAvatarUrl } from "../../../supabase/storage";
import { getProfile, updateProfile } from "../../../supabase/profiles";

export function ProfileHeader({ name, exam, league, countdown }) {
  const initials = name.slice(0, 2).toUpperCase();
  const { user } = useAuth();
  const [avatarUri, setAvatarUri] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!user?.id || user.id === "dev") return;
    getProfile(user.id)
      .then((p) => { if (p?.avatar_url) setAvatarUri(p.avatar_url); })
      .catch(() => {});
  }, [user?.id]);

  const pickAvatar = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert("İzin gerekli", "Galeriden fotoğraf seçmek için izin ver.");
      return;
    }
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
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
    } catch {
      Alert.alert("Hata", "Avatar yüklenirken bir sorun oluştu.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <View style={{ alignItems: "center", paddingTop: SPACING.xl, paddingBottom: SPACING.xxl }}>
      {/* Avatar with edit overlay */}
      <Pressable onPress={pickAvatar} style={{ marginBottom: SPACING.lg }}>
        <View
          style={{
            width: 88,
            height: 88,
            borderRadius: 44,
            backgroundColor: C.amber + "22",
            borderWidth: 2,
            borderColor: C.amber + "60",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
          }}
        >
          {uploading && (
            <View style={{
              position: "absolute", zIndex: 2, width: 88, height: 88,
              backgroundColor: C.bg + "99", alignItems: "center", justifyContent: "center",
            }}>
              <ActivityIndicator color={C.amber} />
            </View>
          )}
          {avatarUri ? (
            <Image
              source={{ uri: avatarUri }}
              style={{ width: 88, height: 88 }}
              contentFit="cover"
              cachePolicy="memory-disk"
              transition={200}
            />
          ) : (
            <Text
              style={{
                fontFamily: "SpaceGrotesk_700Bold",
                fontSize: 32,
                color: C.amber,
              }}
            >
              {initials}
            </Text>
          )}
        </View>
        <View
          style={{
            position: "absolute",
            bottom: 0,
            right: 0,
            width: 28,
            height: 28,
            borderRadius: 14,
            backgroundColor: C.amber,
            alignItems: "center",
            justifyContent: "center",
            borderWidth: 2,
            borderColor: C.bg,
          }}
        >
          <Icon name="camera" size={14} color={C.bg} />
        </View>
      </Pressable>

      {/* Name */}
      <Text style={[TYPOGRAPHY.heading, { color: C.text, marginBottom: SPACING.xs }]}>
        {name}
      </Text>

      {/* Exam type */}
      <Text style={[TYPOGRAPHY.caption, { color: C.muted, marginBottom: SPACING.md }]}>
        {exam}
      </Text>

      {/* League chip */}
      <Chip color={C.amber} style={{ marginBottom: SPACING.lg }}>
        <Icon name={league.icon} size={12} color={C.amber} />
        <Text
          style={{
            fontFamily: "Inter_600SemiBold",
            fontSize: 11,
            color: C.amber,
            letterSpacing: 0.6,
          }}
        >
          {league.name}
        </Text>
      </Chip>

      {/* Countdown */}
      <View style={{ flexDirection: "row", alignItems: "baseline", gap: SPACING.sm }}>
        <Stat size={36} color={C.text}>
          {countdown}
        </Stat>
        <Text style={[TYPOGRAPHY.captionMedium, { color: C.sec }]}>
          {"gün kaldı"}
        </Text>
      </View>
    </View>
  );
}
