import { memo } from "react";
import { Platform, StyleSheet, Text, View } from "react-native";
import { useNavigation } from "@react-navigation/native";

import { Icon } from "../../../components/design";
import { Press } from "../../../components/design/Press";
import { useC, useTheme } from "../../../contexts/ThemeContext";
import { SCREENS } from "../../../constants/screens";
import { GUTTER, SHAPE, STEP, TYPOGRAPHY, SHADOW } from "../../../themes/tokens";
import { alpha } from "../../../themes/colorMix";

// Hikaye ve widget: uygulamanin disina tasinan iki guclu ozellik.
// Biri sosyal paylasim (Instagram/TikTok story), digeri iOS ana/kilit ekran entegrasyonu.
export const ProfileShareTiles = memo(function ProfileShareTiles() {
  const C = useC();
  const { isDark } = useTheme();
  const navigation = useNavigation();

  const tiles = [
    {
      key: "story",
      icon: "share",
      badge: "STORY",
      title: "Hikâyende Paylaş",
      meta: "Haftalık kartını hazırla",
      screen: SCREENS.SHARE_CARD,
      iconBg: alpha(C.accent, isDark ? 22 : 14),
      iconColor: isDark ? C.accentText : C.accent,
      badgeColor: isDark ? alpha(C.accentText, 18) : alpha(C.accent, 12),
      badgeText: isDark ? C.accentText : C.accent,
    },
    Platform.OS === "ios"
      ? {
          key: "widget",
          icon: "grid",
          badge: "WIDGET",
          title: "Widget Ekle",
          meta: "Kilit ve ana ekrana koy",
          screen: SCREENS.WIDGET_GUIDE,
          iconBg: alpha(C.subjects?.turkce || "#74A9E8", isDark ? 22 : 14),
          iconColor: C.subjects?.turkce || "#74A9E8",
          badgeColor: alpha(C.subjects?.turkce || "#74A9E8", isDark ? 18 : 12),
          badgeText: C.subjects?.turkce || "#74A9E8",
        }
      : null,
  ].filter(Boolean);

  return (
    <View style={s.row}>
      {tiles.map((t) => (
        <Press
          key={t.key}
          haptic="tap"
          accessibilityRole="button"
          accessibilityLabel={t.title}
          onPress={() => navigation.navigate(t.screen)}
          style={[
            s.tile,
            {
              backgroundColor: C.surface,
              borderColor: C.edgeStrong,
            },
            !isDark && SHADOW.cardLight,
          ]}
        >
          {/* Üst Kısım: İkon + Rozet */}
          <View style={s.topRow}>
            <View style={[s.iconBox, { backgroundColor: t.iconBg }]}>
              <Icon name={t.icon} size={18} color={t.iconColor} sw={1.8} />
            </View>
            <View style={[s.badge, { backgroundColor: t.badgeColor }]}>
              <Text style={[s.badgeText, { color: t.badgeText }]}>{t.badge}</Text>
            </View>
          </View>

          {/* Alt Kısım: Başlık + Açıklama + Ok */}
          <View style={s.content}>
            <View style={s.titleRow}>
              <Text style={[TYPOGRAPHY.bodySemiBold, s.title, { color: C.text }]} numberOfLines={1}>
                {t.title}
              </Text>
              <Icon name="arrowR" size={11} color={C.text3} sw={2} />
            </View>
            <Text style={[TYPOGRAPHY.meta, s.meta, { color: C.text3 }]} numberOfLines={1}>
              {t.meta}
            </Text>
          </View>
        </Press>
      ))}
    </View>
  );
});

const s = StyleSheet.create({
  row: {
    flexDirection: "row",
    gap: STEP.s2,
    marginHorizontal: GUTTER,
    marginTop: STEP.s4,
  },
  tile: {
    flex: 1,
    borderWidth: 1,
    borderRadius: SHAPE.cardTight + 2,
    padding: STEP.s3 - 4,
    justifyContent: "space-between",
    minHeight: 112,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },
  badge: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeText: {
    fontFamily: "Archivo_600",
    fontSize: 9.5,
    letterSpacing: 0.8,
  },
  content: {
    marginTop: STEP.s2 + 2,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 4,
  },
  title: {
    fontSize: 14.5,
    flex: 1,
  },
  meta: {
    fontSize: 11.5,
    marginTop: 2,
    lineHeight: 15,
  },
});
