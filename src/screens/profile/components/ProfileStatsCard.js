import { memo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useNavigation } from "@react-navigation/native";

import { Icon } from "../../../components/design";
import { Press } from "../../../components/design/Press";
import { useC } from "../../../contexts/ThemeContext";
import { SCREENS } from "../../../constants/screens";
import { useStatsOverview } from "../../../hooks/useStatsOverview";
import { GUTTER, SHAPE, STEP, TYPOGRAPHY } from "../../../themes/tokens";
import { fmtHours, fmtInt } from "../../stats/statsFormat";
import * as H from "../../../lib/haptics";

// Profilde temel istatistik: uc sayi. Ayrinti Istatistiklerim ekraninda.
// "Yilin rotasi" 14 aktif gune kadar bos bir kart gosteriyordu; bu kart ilk
// kayittan itibaren dolu.
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
    <View style={s.wrap}>
      <Text style={[TYPOGRAPHY.tableHead, s.head, { color: C.text2 }]}>İSTATİSTİKLER</Text>
      <Press
        haptic="none"
        accessibilityRole="button"
        accessibilityLabel="Tüm istatistikler"
        onPress={() => { H.tap(); navigation.navigate(SCREENS.STATS); }}
        style={[s.card, { backgroundColor: C.surface, borderColor: C.line }]}
      >
        <View style={s.row}>
          {cells.map((c) => (
            <View key={c.label} style={s.cell}>
              <Text style={[TYPOGRAPHY.statSmall, s.num, { color: C.text }]} numberOfLines={1}>{c.value}</Text>
              <Text style={[TYPOGRAPHY.meta, { color: C.text3 }]}>{c.label}</Text>
            </View>
          ))}
        </View>
        <View style={[s.foot, { borderTopColor: C.line }]}>
          <Text style={[TYPOGRAPHY.metaSemiBold, { color: C.text2 }]}>Tüm istatistikler</Text>
          <Icon name="chevR" size={16} color={C.text3} />
        </View>
      </Press>
    </View>
  );
});

const s = StyleSheet.create({
  wrap: { marginHorizontal: GUTTER, marginTop: STEP.s4 },
  head: { marginBottom: STEP.s2 },
  card: { borderWidth: 1, borderRadius: SHAPE.panel, paddingHorizontal: STEP.s3, paddingTop: STEP.s3 },
  row: { flexDirection: "row", gap: STEP.s2 },
  cell: { flex: 1 },
  num: { fontVariant: ["tabular-nums"] },
  foot: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    borderTopWidth: 1, marginTop: STEP.s3, minHeight: 44,
  },
});
