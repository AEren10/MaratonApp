import { View, Text, Pressable, ActivityIndicator } from "react-native";
import { Image } from "expo-image";
import { Icon } from "../../../components/design";
import { useC } from "../../../contexts/ThemeContext";
import { STEP, GUTTER } from "../../../themes/tokens";
import { useAvatarUpload } from "../../../hooks/useAvatarUpload";

// Tasarim: 60x60 r12 avatar (elev zemin, text2 baş harfler), sag-alt köşede
// 22x22 r4 "+" duzenle rozeti. İsim Bricolage 20px, altinda sinav etiketi +
// seri cipi.
export function ProfileHero({ name = "Öğrenci", exam, streak }) {
  const C = useC();
  const initials = (name || "??").slice(0, 2).toUpperCase();
  const { avatarSource, uploading, pickAvatar } = useAvatarUpload();

  return (
    <View style={{
      flexDirection: "row",
      alignItems: "center",
      gap: STEP.s2,
      paddingHorizontal: GUTTER,
      paddingTop: STEP.s2,
    }}>
      <Pressable onPress={pickAvatar} style={{ position: "relative" }} accessibilityRole="button" accessibilityLabel="Profil fotoğrafını değiştir">
        <View style={{
          width: 60, height: 60, borderRadius: 12,
          backgroundColor: C.elev, borderWidth: 1, borderColor: C.border,
          alignItems: "center", justifyContent: "center", overflow: "hidden",
        }}>
          {avatarSource ? (
            <Image source={avatarSource} style={{ width: 60, height: 60 }} contentFit="cover" cachePolicy="memory-disk" transition={200} />
          ) : (
            <Text style={{ fontFamily: "Archivo_600", fontSize: 20, color: C.text2 }}>{initials}</Text>
          )}
          {uploading ? (
            <View style={{ position: "absolute", inset: 0, backgroundColor: "rgba(0,0,0,0.45)", alignItems: "center", justifyContent: "center" }}>
              <ActivityIndicator color={C.accentInk} size="small" />
            </View>
          ) : null}
        </View>
        <View style={{
          position: "absolute", right: -2, bottom: -2,
          width: 22, height: 22, borderRadius: 4,
          backgroundColor: C.brandFill,
          alignItems: "center", justifyContent: "center",
        }}>
          <Text style={{ fontFamily: "Archivo_700", fontSize: 13, color: C.accentInk }}>+</Text>
        </View>
      </Pressable>

      <View style={{ flex: 1, gap: 6 }}>
        <Text style={{ fontFamily: "Bricolage_400", fontSize: 20, color: C.text }} numberOfLines={1}>
          {name}
        </Text>
        <View style={{ flexDirection: "row", alignItems: "center", gap: STEP.s1, flexWrap: "wrap" }}>
          {exam ? (
            <Text style={{ fontFamily: "Archivo_600", fontSize: 11.5, letterSpacing: 2, color: C.text3 }}>
              {exam}
            </Text>
          ) : null}
          <View style={{
            flexDirection: "row", alignItems: "center", gap: 6,
            height: 22, paddingHorizontal: 9, borderRadius: 6,
            backgroundColor: C.brandTint, borderWidth: 1, borderColor: C.border,
          }}>
            <Icon name="flame" size={11} color={C.text2} />
            <Text style={{ fontFamily: "Archivo_600", fontSize: 11.5, letterSpacing: 1.1, color: C.text2 }}>
              {streak || 0} GÜN SERİ
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}
