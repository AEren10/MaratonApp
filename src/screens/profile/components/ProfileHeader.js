import { useState, useEffect, useMemo } from "react";
import { View, Text, Pressable, ActivityIndicator, Alert } from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import * as ImagePicker from "expo-image-picker";
import { useC } from "../../../contexts/ThemeContext";
import { Icon, Spot } from "../../../components/design";
import { useAuth } from "../../../contexts/AuthContext";
import { uploadAvatar, getAvatarUrl } from "../../../supabase/storage";
import { getProfile, updateProfile } from "../../../supabase/profiles";

function avatarPalette(name = "?", C) {
  const sum = name.split("").reduce((s, c) => s + c.charCodeAt(0), 0);
  // Canlı solid → aynı tonun yarı saydamı: token-driven, dark/light tutarlı.
  const palette = [
    [C.accent, C.coral + "CC"],
    [C.purple, C.pink + "CC"],
    [C.blue,   C.teal + "CC"],
    [C.pink,   C.purple + "CC"],
    [C.amber,  C.accent + "CC"],
    [C.teal,   C.blue + "CC"],
  ];
  return palette[sum % palette.length];
}

// Klasik profil başlığı: ortalanmış büyük avatar + isim + exam + lig chip + countdown.
// Tema-duyarlı (useC) — light ve dark'ta nötr, hardcoded renk yok.
export function ProfileHeader({ name = "Öğrenci", exam, league, countdown }) {
  const C = useC();
  const initials = (name || "??").slice(0, 2).toUpperCase();
  const { user } = useAuth();
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

  const pickAvatar = async () => {
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
      Alert.alert("Hata", "Avatar yüklenirken bir sorun oluştu.\n\n" + (e?.message || ""));
    } finally {
      setUploading(false);
    }
  };

  return (
    <View style={{ marginTop: 16, marginBottom: 18, alignItems: "center" }}>
      {/* Hafif dekoratif backdrop — glyph avatarın arkasında gizli, blob+noktalar çevrede */}
      <View pointerEvents="none" style={{ position: "absolute", top: -42, opacity: 0.6 }}>
        <Spot name="trophy" size={216} color={c1} />
      </View>

      {/* === Büyük ortalanmış avatar === */}
      <Pressable onPress={pickAvatar}>
        <View style={{
          width: 132, height: 132, borderRadius: 66,
          overflow: "hidden",
          backgroundColor: C.surface2,
          borderWidth: 3,
          borderColor: C.amber + "55",
        }}>
          {avatarUri ? (
            <Image
              source={avatarSource}
              style={{ width: 132, height: 132 }}
              contentFit="cover"
              cachePolicy="memory-disk"
              transition={200}
            />
          ) : (
            <LinearGradient
              colors={[c1, c2]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ width: 132, height: 132, alignItems: "center", justifyContent: "center" }}
            >
              <Text style={{
                fontFamily: "SpaceGrotesk_700Bold",
                fontSize: 52,
                color: "#FFFFFF",
                letterSpacing: -1.4,
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
        {/* Camera fab */}
        <View style={{
          position: "absolute",
          bottom: 4, right: 4,
          width: 38, height: 38, borderRadius: 19,
          backgroundColor: C.amber,
          alignItems: "center", justifyContent: "center",
          borderWidth: 3,
          borderColor: C.bg,
        }}>
          <Icon name="camera" size={16} color="#FFFFFF" sw={2.4} />
        </View>
      </Pressable>

      {/* === İsim === */}
      <Text style={{
        fontFamily: "SpaceGrotesk_700Bold",
        fontSize: 26,
        color: C.text,
        letterSpacing: -0.5,
        marginTop: 18,
      }} numberOfLines={1}>
        {name}
      </Text>

      {/* === Exam type === */}
      {exam ? (
        <Text style={{
          fontFamily: "Inter_500Medium",
          fontSize: 14,
          color: C.sec,
          marginTop: 4,
        }}>
          {exam}
        </Text>
      ) : null}

      {/* === Lig chip === */}
      <View style={{
        flexDirection: "row", alignItems: "center", gap: 6,
        backgroundColor: C.amber + "18",
        borderWidth: 1,
        borderColor: C.amber + "40",
        paddingHorizontal: 12, paddingVertical: 6,
        borderRadius: 999,
        marginTop: 14,
        alignSelf: "center",
      }}>
        {league?.icon ? <Icon name={league.icon} size={13} color={C.amber} /> : null}
        <Text style={{
          fontFamily: "Inter_600SemiBold",
          fontSize: 12,
          color: C.amber,
          letterSpacing: 0.4,
        }}>
          {league?.name || "Bronz Lig"}
        </Text>
      </View>

      {/* === Countdown stat === */}
      {countdown != null ? (
        <View style={{ alignItems: "center", marginTop: 18 }}>
          <View style={{ flexDirection: "row", alignItems: "baseline", gap: 6 }}>
            <Text style={{
              fontFamily: "SpaceGrotesk_700Bold",
              fontSize: 38,
              color: C.text,
              letterSpacing: -1,
            }}>
              {countdown}
            </Text>
            <Text style={{
              fontFamily: "Inter_500Medium",
              fontSize: 15,
              color: C.sec,
            }}>
              gün kaldı
            </Text>
          </View>
        </View>
      ) : null}
    </View>
  );
}
