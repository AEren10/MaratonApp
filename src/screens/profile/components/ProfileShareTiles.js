import { memo } from "react";
import { Platform, StyleSheet, Text, View } from "react-native";
import { useNavigation } from "@react-navigation/native";

import { Icon } from "../../../components/design";
import { Press } from "../../../components/design/Press";
import { useC } from "../../../contexts/ThemeContext";
import { SCREENS } from "../../../constants/screens";
import { GUTTER, SHAPE, STEP, TYPOGRAPHY } from "../../../themes/tokens";

// Hikaye ve widget: uygulamanin disina tasinan iki yuz. Uzun baglanti
// listesinin icinde kayboluyorlardi (kullanici: "banko olmali"); listeden
// once, yan yana iki esit kutucuk.
export const ProfileShareTiles = memo(function ProfileShareTiles() {
  const C = useC();
  const navigation = useNavigation();
  const tiles = [
    { key: "story", icon: "share", title: "Hikâyende paylaş", meta: "Haftanı göster", screen: SCREENS.SHARE_CARD },
    Platform.OS === "ios"
      ? { key: "widget", icon: "grid", title: "Widget ekle", meta: "Açmadan gör", screen: SCREENS.WIDGET_GUIDE }
      : null,
  ].filter(Boolean);

  return (
    <View style={s.row}>
      {tiles.map((t) => (
        <Press
          key={t.key}
          haptic="tap"
          accessibilityLabel={t.title}
          onPress={() => navigation.navigate(t.screen)}
          style={[s.tile, { backgroundColor: C.surface, borderColor: C.line }]}
        >
          <View style={[s.icon, { backgroundColor: C.brandTint }]}>
            <Icon name={t.icon} size={16} color={C.accentBright} />
          </View>
          <Text style={[TYPOGRAPHY.bodyMedium, s.title, { color: C.text }]} numberOfLines={1}>{t.title}</Text>
          <Text style={[TYPOGRAPHY.meta, s.meta, { color: C.text3 }]} numberOfLines={1}>{t.meta}</Text>
        </Press>
      ))}
    </View>
  );
});

const s = StyleSheet.create({
  row: { flexDirection: "row", gap: STEP.s2, marginHorizontal: GUTTER, marginTop: STEP.s4 },
  tile: { flex: 1, borderWidth: 1, borderRadius: SHAPE.panel, padding: STEP.s3 - 4 },
  icon: { width: 32, height: 32, borderRadius: SHAPE.iconBox, alignItems: "center", justifyContent: "center" },
  title: { marginTop: STEP.s2 },
  meta: { marginTop: 3 },
});
