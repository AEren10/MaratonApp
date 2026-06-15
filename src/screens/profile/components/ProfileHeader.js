import { useState, useEffect } from "react";
import { View, Text, Pressable, ActivityIndicator, Alert } from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import * as ImagePicker from "expo-image-picker";
import { TYPOGRAPHY, SPACING } from "../../../themes/tokens";
import { useC } from "../../../contexts/ThemeContext";
import { Icon } from "../../../components/design";
import { useAuth } from "../../../contexts/AuthContext";
import { uploadAvatar, getAvatarUrl } from "../../../supabase/storage";
import { getProfile, updateProfile } from "../../../supabase/profiles";

// Tier'a göre gradient
const TIER_GRADIENT = {
  Bronz:    ["#C97C47", "#E0A26A"],
  "Bronz Lig": ["#C97C47", "#E0A26A"],
  Gümüş:    ["#9CA3AF", "#D1D5DB"],
  "Gümüş Lig": ["#9CA3AF", "#D1D5DB"],
  Altın:    ["#E8B547", "#FFD97D"],
  "Altın Lig":  ["#E8B547", "#FFD97D"],
  Elmas:    ["#5DD8C5", "#A0E8DA"],
  "Elmas Lig": ["#5DD8C5", "#A0E8DA"],
  Obsidyen: ["#1B1530", "#3F2B73"],
  "Obsidyen Lig": ["#1B1530", "#3F2B73"],
};

function avatarPalette(name = "?", C) {
  const sum = name.split("").reduce((s, c) => s + c.charCodeAt(0), 0);
  const palette = [
    [C.purple, "#C5B0FF"],
    [C.coral,  "#FFC9A8"],
    [C.blue,   "#A6CCFF"],
    [C.pink,   "#FFC0DC"],
    [C.amber,  "#FFE6A8"],
    [C.teal,   "#9EE0D2"],
  ];
  return palette[sum % palette.length];
}

// Hero card: gradient zemin + avatar + isim + 3 stat box overlay
export function ProfileHeader({ name = "Öğrenci", exam, league, countdown }) {
  const C = useC();
  const initials = (name || "??").slice(0, 2).toUpperCase();
  const { user } = useAuth();
  const [avatarUri, setAvatarUri] = useState(null);
  const [uploading, setUploading] = useState(false);

  const [c1, c2] = avatarPalette(name, C);
  const [tier1, tier2] = TIER_GRADIENT[league?.name] || TIER_GRADIENT.Bronz;

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
    <View style={{ marginTop: 8, marginBottom: 18 }}>
      {/* === Hero gradient kart === */}
      <LinearGradient
        colors={[tier1, tier2]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          borderRadius: 28,
          padding: 22,
          paddingBottom: 80, // alta stat box overlay için boşluk
          alignItems: "center",
          shadowColor: tier1,
          shadowOffset: { width: 0, height: 12 },
          shadowOpacity: 0.30,
          shadowRadius: 20,
          elevation: 8,
        }}
      >
        {/* Decorative shape sağ üst */}
        <View style={{
          position: "absolute",
          top: -40, right: -40,
          width: 140, height: 140,
          borderRadius: 70,
          backgroundColor: "rgba(255,255,255,0.10)",
        }} />
        <View style={{
          position: "absolute",
          top: 30, right: -20,
          width: 80, height: 80,
          borderRadius: 40,
          backgroundColor: "rgba(255,255,255,0.06)",
        }} />

        {/* Avatar — gradient circle veya foto */}
        <Pressable onPress={pickAvatar} style={{ marginBottom: 14 }}>
          <View style={{
            width: 96, height: 96, borderRadius: 28,
            overflow: "hidden",
            borderWidth: 4,
            borderColor: "rgba(255,255,255,0.85)",
            shadowColor: "#1B1530",
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.20,
            shadowRadius: 12,
            elevation: 6,
          }}>
            {avatarUri ? (
              <Image
                source={{ uri: avatarUri }}
                style={{ width: 88, height: 88 }}
                contentFit="cover"
                cachePolicy="memory-disk"
                transition={200}
              />
            ) : (
              <LinearGradient
                colors={[c1, c2]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{ width: 88, height: 88, alignItems: "center", justifyContent: "center" }}
              >
                <Text style={{
                  fontFamily: "SpaceGrotesk_700Bold",
                  fontSize: 36,
                  color: "#FFFFFF",
                  letterSpacing: -1,
                }}>
                  {initials}
                </Text>
              </LinearGradient>
            )}
            {uploading && (
              <View style={{
                position: "absolute", inset: 0,
                backgroundColor: "rgba(0,0,0,0.4)",
                alignItems: "center", justifyContent: "center",
              }}>
                <ActivityIndicator color="#FFFFFF" />
              </View>
            )}
          </View>
          {/* Camera fab */}
          <View style={{
            position: "absolute",
            bottom: -2, right: -2,
            width: 30, height: 30, borderRadius: 10,
            backgroundColor: "#1B1530",
            alignItems: "center", justifyContent: "center",
            borderWidth: 3,
            borderColor: "rgba(255,255,255,0.95)",
          }}>
            <Icon name="camera" size={13} color="#FFFFFF" />
          </View>
        </Pressable>

        {/* Name */}
        <Text style={{
          fontFamily: "SpaceGrotesk_700Bold",
          fontSize: 26,
          color: "#FFFFFF",
          letterSpacing: -0.5,
        }}>
          {name}
        </Text>

        {/* League chip */}
        <View style={{
          flexDirection: "row", alignItems: "center", gap: 5,
          backgroundColor: "rgba(255,255,255,0.20)",
          paddingHorizontal: 12, paddingVertical: 5,
          borderRadius: 999,
          marginTop: 8,
        }}>
          {league?.icon ? <Icon name={league.icon} size={12} color="#FFFFFF" /> : null}
          <Text style={{
            fontFamily: "Inter_600SemiBold",
            fontSize: 11,
            color: "#FFFFFF",
            letterSpacing: 0.5,
          }}>
            {league?.name || "Bronz Lig"}
          </Text>
        </View>
      </LinearGradient>

      {/* === Overlay stat box: countdown + exam === */}
      <View style={{
        marginHorizontal: 16,
        marginTop: -56,
        flexDirection: "row",
        gap: 12,
      }}>
        <View style={{
          flex: 1.4,
          padding: 14,
          borderRadius: 20,
          backgroundColor: C.surface,
          borderWidth: 1,
          borderColor: C.border,
          shadowColor: "#1B1530",
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.10,
          shadowRadius: 14,
          elevation: 4,
        }}>
          <Text style={{
            fontFamily: "Inter_600SemiBold",
            fontSize: 10,
            color: C.coral,
            letterSpacing: 0.8,
          }}>
            SINAVA
          </Text>
          <View style={{ flexDirection: "row", alignItems: "baseline", gap: 4, marginTop: 4 }}>
            <Text style={{
              fontFamily: "SpaceGrotesk_700Bold",
              fontSize: 28,
              color: C.text,
              letterSpacing: -0.8,
            }}>
              {countdown != null ? countdown : "—"}
            </Text>
            <Text style={{
              fontFamily: "Inter_500Medium",
              fontSize: 13,
              color: C.sec,
            }}>
              gün
            </Text>
          </View>
        </View>

        <View style={{
          flex: 1,
          padding: 14,
          borderRadius: 20,
          backgroundColor: C.surface,
          borderWidth: 1,
          borderColor: C.border,
          shadowColor: "#1B1530",
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.10,
          shadowRadius: 14,
          elevation: 4,
        }}>
          <Text style={{
            fontFamily: "Inter_600SemiBold",
            fontSize: 10,
            color: C.purple,
            letterSpacing: 0.8,
          }}>
            SINAV TÜRÜN
          </Text>
          <Text
            style={{
              fontFamily: "Inter_600SemiBold",
              fontSize: 13,
              color: C.text,
              marginTop: 6,
              lineHeight: 17,
            }}
            numberOfLines={2}
          >
            {exam}
          </Text>
        </View>
      </View>
    </View>
  );
}
