import { memo } from "react";
import { Platform, StyleSheet, Text, View } from "react-native";
import { useNavigation } from "@react-navigation/native";

import { Icon } from "../../../components/design";
import { Press } from "../../../components/design/Press";
import { useC, useTheme } from "../../../contexts/ThemeContext";
import { SCREENS } from "../../../constants/screens";
import { GUTTER, STEP, TYPOGRAPHY, SHADOW } from "../../../themes/tokens";
import { alpha } from "../../../themes/colorMix";

// Hikaye ve widget: profilin disariya acilan iki vitrini.
// Tasarim: Apple widget & editorial card estetikleri, ozel ambiyans tonlari.
export const ProfileShareTiles = memo(function ProfileShareTiles() {
  const C = useC();
  const { isDark } = useTheme();
  const navigation = useNavigation();

  const widgetColor = C.subjects?.turkce || C.accent;

  const tiles = [
    {
      key: "story",
      icon: "share",
      badge: "HİKÂYE",
      title: "Haftalık Kart",
      meta: "Netlerini ve serini story at",
      screen: SCREENS.SHARE_CARD,
      cardBg: C.surface,
      cardBorder: isDark ? alpha(C.accent, 24) : C.edgeStrong,
      iconBg: alpha(C.accent, isDark ? 22 : 14),
      iconBorder: alpha(C.accent, isDark ? 36 : 20),
      iconColor: isDark ? C.accentText : C.accent,
      badgeBg: alpha(C.accent, isDark ? 16 : 10),
      badgeText: isDark ? C.accentText : C.accent,
    },
    Platform.OS === "ios"
      ? {
          key: "widget",
          icon: "grid",
          badge: "KİLİT EKRANI",
          title: "Canlı Widget",
          meta: "Açmadan serini anlık gör",
          screen: SCREENS.WIDGET_GUIDE,
          cardBg: C.surface,
          cardBorder: isDark ? alpha(widgetColor, 24) : C.edgeStrong,
          iconBg: alpha(widgetColor, isDark ? 22 : 14),
          iconBorder: alpha(widgetColor, isDark ? 36 : 20),
          iconColor: widgetColor,
          badgeBg: alpha(widgetColor, isDark ? 16 : 10),
          badgeText: widgetColor,
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
          accessibilityLabel={`${t.title}, ${t.meta}`}
          onPress={() => navigation.navigate(t.screen)}
          style={[
            s.tile,
            {
              backgroundColor: t.cardBg,
              borderColor: t.cardBorder,
            },
            !isDark && SHADOW.cardLight,
          ]}
        >
          {/* Üst Kısım: Işıltılı İkon Kutusu + Rozet */}
          <View style={s.topRow}>
            <View style={[s.iconBox, { backgroundColor: t.iconBg, borderColor: t.iconBorder }]}>
              <Icon name={t.icon} size={18} color={t.iconColor} sw={1.9} />
            </View>
            <View style={[s.badge, { backgroundColor: t.badgeBg }]}>
              <Text style={[s.badgeText, { color: t.badgeText }]}>{t.badge}</Text>
            </View>
          </View>

          {/* Alt Kısım: Başlık + Açıklama + Mini Aksiyon Oku */}
          <View style={s.bottomContent}>
            <View style={s.titleRow}>
              <Text style={[TYPOGRAPHY.bodySemiBold, s.title, { color: C.text }]} numberOfLines={1}>
                {t.title}
              </Text>
              <View style={[s.arrowCircle, { backgroundColor: alpha(C.text, isDark ? 8 : 6) }]}>
                <Icon name="arrowR" size={10} color={C.text2} sw={2.2} />
              </View>
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
  row: { flexDirection: "row", gap: STEP.s2, marginHorizontal: GUTTER, marginTop: STEP.s4 },
  tile: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 18,
    padding: 13,
    justifyContent: "space-between",
    minHeight: 114,
  },
  topRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 11,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  badge: { paddingHorizontal: 7, paddingVertical: 3, borderRadius: 6 },
  badgeText: { fontFamily: "Archivo_600", fontSize: 11.5, letterSpacing: 0.8 },
  bottomContent: { marginTop: STEP.s2 + 2 },
  titleRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 4 },
  title: { fontSize: 14.5, flex: 1 },
  arrowCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  meta: { fontSize: 11.5, marginTop: 2, lineHeight: 15 },
});
