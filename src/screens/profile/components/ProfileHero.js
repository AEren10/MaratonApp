import React from "react";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import { Image } from "expo-image";
import { useNavigation } from "@react-navigation/native";
import { Icon } from "../../../components/design";
import { useC } from "../../../contexts/ThemeContext";
import { STEP, GUTTER, RADIUS, TYPOGRAPHY } from "../../../themes/tokens";
import { SCREENS } from "../../../constants/screens";
import { useAvatarUpload } from "../../../hooks/useAvatarUpload";
import * as H from "../../../lib/haptics";
import { Press } from "../../../components/design/Press";

export function ProfileHero({ name = "Öğrenci", exam, streak }) {
  const C = useC();
  const navigation = useNavigation();
  const initials = (name || "??").slice(0, 2).toUpperCase();
  const { avatarSource, uploading } = useAvatarUpload();

  const handleEditProfile = () => {
    H.tap();
    navigation.navigate(SCREENS.EDIT_PROFILE);
  };

  return (
    <View style={s.container}>
      <Press haptic="none" onPress={handleEditProfile} style={s.avatarWrap} accessibilityRole="button" accessibilityLabel="Profili ve fotoğrafı düzenle">
        <View style={[s.avatarCircle, { backgroundColor: C.elev, borderColor: C.border }]}>
          {avatarSource ? (
            <Image source={avatarSource} style={s.avatarImage} contentFit="cover" cachePolicy="memory-disk" transition={200} />
          ) : (
            <Text style={[s.initials, { color: C.accentBright }]}>{initials}</Text>
          )}
          {uploading ? (
            <View style={[s.uploadingOverlay, { backgroundColor: C.scrimSoft }]}>
              <ActivityIndicator color={C.accentInk} size="small" />
            </View>
          ) : null}
        </View>

        <View style={[s.editBadge, { backgroundColor: C.accent, borderColor: C.bg }]}>
          <Icon name="edit" size={11} color={C.textOnFill} />
        </View>
      </Press>

      <View style={s.metaCol}>
        <Text style={[s.nameText, { color: C.text }]} numberOfLines={1}>
          {name}
        </Text>

        <View style={s.pillsRow}>
          {exam ? (
            <View style={[s.pill, { backgroundColor: C.surface, borderColor: C.border }]}>
              <Text style={[s.pillText, { color: C.text2 }]}>{exam}</Text>
            </View>
          ) : null}

          <View style={[s.pill, { backgroundColor: streak > 0 ? C.accent + "14" : C.surface, borderColor: streak > 0 ? C.accent + "40" : C.border }]}>
            <Icon name="flame" size={12} color={streak > 0 ? C.accent : C.text3} />
            <Text style={[s.pillText, { color: streak > 0 ? C.accentBright : C.text3 }]}>
              {streak || 0} GÜN SERİ
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flexDirection: "row", alignItems: "center", gap: STEP.s2 + 2, paddingHorizontal: GUTTER, paddingTop: STEP.s2 },
  avatarWrap: { position: "relative" },
  avatarCircle: { width: 66, height: 66, borderRadius: 33, borderWidth: 1.5, alignItems: "center", justifyContent: "center", overflow: "hidden" },
  avatarImage: { width: 66, height: 66, borderRadius: 33 },
  initials: { fontFamily: "Bricolage_400", fontSize: 24 },
  uploadingOverlay: { position: "absolute", inset: 0, alignItems: "center", justifyContent: "center" },
  editBadge: { position: "absolute", right: -1, bottom: -1, width: 24, height: 24, borderRadius: 12, borderWidth: 2, alignItems: "center", justifyContent: "center" },
  metaCol: { flex: 1, gap: STEP.s1 - 2 },
  nameText: { fontFamily: "Bricolage_400", fontSize: 22 },
  pillsRow: { flexDirection: "row", alignItems: "center", gap: STEP.s1, flexWrap: "wrap" },
  pill: { flexDirection: "row", alignItems: "center", gap: 5, height: 26, paddingHorizontal: 10, borderRadius: RADIUS.full, borderWidth: 1 },
  pillText: { ...TYPOGRAPHY.micro, fontFamily: "Archivo_600", letterSpacing: 0.8 },
});
