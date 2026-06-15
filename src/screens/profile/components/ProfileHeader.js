import { useState, useEffect } from "react";
import { View, Text, Pressable, ActivityIndicator, Alert } from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import * as ImagePicker from "expo-image-picker";
import { TYPOGRAPHY } from "../../../themes/tokens";
import { useC } from "../../../contexts/ThemeContext";
import { Icon } from "../../../components/design";
import { useAuth } from "../../../contexts/AuthContext";
import { uploadAvatar, getAvatarUrl } from "../../../supabase/storage";
import { getProfile, updateProfile } from "../../../supabase/profiles";

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

// Sade profil başlığı: yan yana avatar + isim + lig chip, altında 2 stat kart.
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
      setAvatarUri(url);
    } catch (e) {
      Alert.alert("Hata", "Avatar yüklenirken bir sorun oluştu.\n\n" + (e?.message || ""));
    } finally {
      setUploading(false);
    }
  };

  return (
    <View style={{ marginTop: 8, marginBottom: 18 }}>
      {/* === Üst sıra: avatar + isim + lig === */}
      <View style={{
        flexDirection: "row", alignItems: "center", gap: 14,
        padding: 16,
        borderRadius: 24,
        backgroundColor: C.surface,
        borderWidth: 1,
        borderColor: C.border,
      }}>
        <Pressable onPress={pickAvatar}>
          <View style={{
            width: 72, height: 72, borderRadius: 22,
            overflow: "hidden",
            backgroundColor: C.surface2,
          }}>
            {avatarUri ? (
              <Image
                source={{ uri: avatarUri }}
                style={{ width: 72, height: 72 }}
                contentFit="cover"
                cachePolicy="memory-disk"
                transition={200}
              />
            ) : (
              <LinearGradient
                colors={[c1, c2]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{ width: 72, height: 72, alignItems: "center", justifyContent: "center" }}
              >
                <Text style={{
                  fontFamily: "SpaceGrotesk_700Bold",
                  fontSize: 28,
                  color: "#FFFFFF",
                  letterSpacing: -1,
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
          {/* Camera dot */}
          <View style={{
            position: "absolute",
            bottom: -2, right: -2,
            width: 26, height: 26, borderRadius: 9,
            backgroundColor: C.purple,
            alignItems: "center", justifyContent: "center",
            borderWidth: 3,
            borderColor: C.surface,
          }}>
            <Icon name="camera" size={11} color="#FFFFFF" sw={2.4} />
          </View>
        </Pressable>

        <View style={{ flex: 1 }}>
          <Text style={{
            fontFamily: "SpaceGrotesk_700Bold",
            fontSize: 22,
            color: C.text,
            letterSpacing: -0.4,
          }} numberOfLines={1}>
            {name}
          </Text>
          {/* Lig chip */}
          <View style={{
            flexDirection: "row", alignItems: "center", gap: 5,
            backgroundColor: C.purple + "14",
            paddingHorizontal: 9, paddingVertical: 4,
            borderRadius: 999,
            marginTop: 6,
            alignSelf: "flex-start",
          }}>
            {league?.icon ? <Icon name={league.icon} size={11} color={C.purple} /> : null}
            <Text style={{
              fontFamily: "Inter_600SemiBold",
              fontSize: 11,
              color: C.purple,
              letterSpacing: 0.4,
            }}>
              {league?.name || "Bronz Lig"}
            </Text>
          </View>
        </View>
      </View>

      {/* === Alt sıra: 2 stat kart === */}
      <View style={{
        marginTop: 12,
        flexDirection: "row",
        gap: 12,
      }}>
        <View style={{
          flex: 1.4,
          padding: 14,
          borderRadius: 18,
          backgroundColor: C.coral + "12",
          borderWidth: 1,
          borderColor: C.coral + "28",
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
          borderRadius: 18,
          backgroundColor: C.purple + "12",
          borderWidth: 1,
          borderColor: C.purple + "28",
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
