import { View, Text, Pressable, ActivityIndicator, StyleSheet } from "react-native";
import { Image } from "expo-image";
import { Icon } from "../../../components/design";
import { TYPOGRAPHY, STEP, SHAPE } from "../../../themes/tokens";
import { useC } from "../../../contexts/ThemeContext";
import { useAvatarUpload } from "../../../hooks/useAvatarUpload";

function initialsOf(name) {
  const parts = (name || "").trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "??";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

// Tasarim kare (r12) fotograf kutusu + kose kalem rozeti bekliyor —
// mevcut Avatar bileseni yuvarlak ve hash renkli (bu ekranin diliyle
// uyusmuyor), o yuzden buraya ozel kucuk bir gorsel yazildi.
export function EditProfileAvatar({ name }) {
  const C = useC();
  const { avatarSource, uploading, pickAvatar } = useAvatarUpload();

  return (
    <Pressable onPress={pickAvatar} style={{ alignItems: "center", marginTop: STEP.s1 }}>
      <View>
        <View
          style={{
            width: 96, height: 96, borderRadius: SHAPE.iconBox,
            backgroundColor: C.surface, borderWidth: 1, borderColor: C.border,
            alignItems: "center", justifyContent: "center", overflow: "hidden",
          }}
        >
          {avatarSource ? (
            <Image source={avatarSource} style={{ width: 96, height: 96 }} contentFit="cover" cachePolicy="memory-disk" transition={200} />
          ) : (
            <Text style={{ fontFamily: "Bricolage_400", fontSize: 34, color: C.text3 }}>{initialsOf(name)}</Text>
          )}
          {uploading ? (
            <View style={[StyleSheet.absoluteFillObject, { backgroundColor: C.scrim, alignItems: "center", justifyContent: "center" }]}>
              <ActivityIndicator color={C.textOnFill} />
            </View>
          ) : null}
        </View>
        <View
          style={{
            position: "absolute", right: -2, bottom: -2,
            width: 34, height: 34, borderRadius: SHAPE.iconBox,
            backgroundColor: C.accent, borderWidth: 3, borderColor: C.bg,
            alignItems: "center", justifyContent: "center",
          }}
        >
          <Icon name="edit" size={14} color={C.textOnFill} />
        </View>
      </View>
      <Text style={[TYPOGRAPHY.captionMedium, { color: C.text3, marginTop: STEP.s2 + 2 }]}>Fotoğrafı değiştir</Text>
    </Pressable>
  );
}
