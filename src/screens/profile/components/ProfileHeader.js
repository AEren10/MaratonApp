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

function StatPill({ icon, label, color, C }) {
  return (
    <View style={{
      flexDirection: "row", alignItems: "center", gap: 5,
      backgroundColor: color + "16",
      borderWidth: 1, borderColor: color + "35",
      paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm,
      borderRadius: RADIUS.pill,
    }}>
      {icon ? <Icon name={icon} size={13} color={color} /> : null}
      <Text style={{ ...TYPOGRAPHY.captionMedium, color }}>{label}</Text>
    </View>
  );
}

export function ProfileHeader({ name = "Öğrenci", exam, level, league, streak }) {
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

  const leagueColor = league?.color || C.accent;

  return (
    <View style={{ marginTop: SPACING.md, marginBottom: SPACING.lg, alignItems: "center" }}>
      {/* Avatar */}
      <Pressable onPress={pickAvatar}>
        <View style={{
          width: 120, height: 120, borderRadius: 60,
          overflow: "hidden",
          backgroundColor: C.surface2,
          borderWidth: 3, borderColor: C.accent + "55",
        }}>
          {avatarUri ? (
            <Image
              source={avatarSource}
              style={{ width: 120, height: 120 }}
              contentFit="cover"
              cachePolicy="memory-disk"
              transition={200}
            />
          ) : (
            <LinearGradient
              colors={[c1, c2]}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
              style={{ width: 120, height: 120, alignItems: "center", justifyContent: "center" }}
            >
              <Text style={{
                fontFamily: "SpaceGrotesk_700Bold",
                fontSize: 48, color: "#FFFFFF", letterSpacing: -1.4,
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
              <ActivityIndicator color="#FFFFFF" />
            </View>
          )}
        </View>
        <View style={{
          position: "absolute", bottom: 2, right: 2,
          width: 34, height: 34, borderRadius: 17,
          backgroundColor: C.accent,
          alignItems: "center", justifyContent: "center",
          borderWidth: 3, borderColor: C.bg,
        }}>
          <Icon name="camera" size={14} color="#FFFFFF" sw={2.4} />
        </View>
      </Pressable>

      {/* Name */}
      <Text style={{
        ...TYPOGRAPHY.heading, fontSize: 26,
        color: C.text, letterSpacing: -0.5,
        marginTop: SPACING.lg,
      }} numberOfLines={1}>
        {name}
      </Text>

      {/* Exam label */}
      {exam ? (
        <Text style={{ ...TYPOGRAPHY.caption, color: C.sec, marginTop: SPACING.xs }}>
          {exam}
        </Text>
      ) : null}

      {/* Stat pills */}
      <View style={{
        flexDirection: "row", flexWrap: "wrap",
        justifyContent: "center",
        gap: SPACING.sm,
        marginTop: SPACING.lg,
      }}>
        <StatPill
          icon="shield"
          label={`Lv.${level?.level || 1} ${level?.title || "Acemi"}`}
          color={C.accent}
          C={C}
        />
        <StatPill
          icon={league?.icon || "medal"}
          label={league?.name || "Bronz Lig"}
          color={leagueColor}
          C={C}
        />
        <StatPill
          icon="flame"
          label={`${streak || 0} gün`}
          color={C.orange}
          C={C}
        />
      </View>
    </View>
  );
}
