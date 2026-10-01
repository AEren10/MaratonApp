import { memo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useNavigation } from "@react-navigation/native";

import { Icon } from "../../../components/design";
import { Press } from "../../../components/design/Press";
import { useC } from "../../../contexts/ThemeContext";
import { SCREENS } from "../../../constants/screens";
import { useStatsOverview } from "../../../hooks/useStatsOverview";
import { GUTTER, STEP, TYPOGRAPHY } from "../../../themes/tokens";
import { fmtHours, fmtInt } from "../../stats/statsFormat";
import * as H from "../../../lib/haptics";

// Profilde temel istatistik: uc sayi. Ayrinti Istatistiklerim ekraninda.
// Kutusuz (kullanici, 29 Eylul): her seyi kaba almak sayfayi agirlastiriyordu;
// sayilar zeminde durur, bolum basligindaki "Tümü" ayrintiya goturur.
export const ProfileStatsCard = memo(function ProfileStatsCard() {
  const C = useC();
  const navigation = useNavigation();
  const { data } = useStatsOverview();
  const study = data?.study;
  const cells = [
    { label: "soru", value: fmtInt(study?.totalQuestions) },
    { label: "saat", value: fmtHours(study?.totalMinutes) },
    { label: "aktif gün", value: fmtInt(study?.activeDays) },
  ];

  return (
    <Press
      haptic="none"
      accessibilityRole="button"
      accessibilityLabel="Tüm istatistikler"
      onPress={() => { H.tap(); navigation.navigate(SCREENS.STATS); }}
      style={s.wrap}
    >
      <View style={s.head}>
        <Text style={[TYPOGRAPHY.tableHead, s.flex, { color: C.text2 }]}>İSTATİSTİKLER</Text>
        <Text style={[TYPOGRAPHY.metaSemiBold, { color: C.text3 }]}>Tümü</Text>
        <Icon name="chevR" size={14} color={C.text3} />
      </View>
      <View style={[s.strip, { borderTopColor: C.line, borderBottomColor: C.line }]}>
        {cells.map((c, i) => (
          <View
            key={c.label}
            style={[
              s.cell,
              i > 0 && { borderLeftWidth: 1, borderLeftColor: C.line },
            ]}
          >
            <Text style={[s.num, { color: C.text }]} numberOfLines={1}>{c.value}</Text>
            <Text style={[s.label, { color: C.text3 }]}>{c.label}</Text>
          </View>
        ))}
      </View>
    </Press>
  );
});

const s = StyleSheet.create({
  wrap: { marginHorizontal: GUTTER, marginTop: STEP.s4 },
  head: { flexDirection: "row", alignItems: "center", gap: 2, marginBottom: STEP.s2, minHeight: 24 },
  flex: { flex: 1 },
  strip: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderBottomWidth: 1,
    paddingVertical: STEP.s2,
  },
  cell: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: STEP.s1 / 2,
    gap: 2,
  },
  num: {
    fontFamily: "Bricolage_400",
    fontSize: 28,
    lineHeight: 34,
    letterSpacing: -0.6,
    fontVariant: ["tabular-nums"],
  },
  label: {
    fontFamily: "Archivo_500",
    fontSize: 13,
    lineHeight: 18,
  },
});
