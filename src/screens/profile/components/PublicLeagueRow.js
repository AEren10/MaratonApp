import { StyleSheet, Text, View } from "react-native";

import { Icon } from "../../../components/design/Icon";
import { getTier } from "../../../constants/league";
import { useC } from "../../../contexts/ThemeContext";
import { GUTTER, STEP, TYPOGRAPHY } from "../../../themes/tokens";

// Herkese acik profilde lig: kademe (ikon + ad, kademe renginde) ve bu haftanin
// lig puani. Kutusuz tek satir (kullanici: profilde istatistik, lig, guc
// haritasi ve fotograf; gerisi yok).
export function PublicLeagueRow({ weeklyXP = 0 }) {
  const C = useC();
  const tier = getTier(Number(weeklyXP) || 0);
  return (
    <View style={[s.row, { borderColor: C.line }]} accessible accessibilityLabel={`${tier.name} lig, bu hafta ${weeklyXP} puan`}>
      <Text style={[TYPOGRAPHY.label, s.label, { color: C.text3 }]}>LİG</Text>
      <Icon name={tier.icon} size={18} color={tier.color} />
      <Text style={[TYPOGRAPHY.bodySemiBold, s.name, { color: C.text }]}>{`${tier.name} Lig`}</Text>
      <Text style={[TYPOGRAPHY.meta, { color: C.text3 }]}>{`bu hafta ${weeklyXP} puan`}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  row: {
    flexDirection: "row", alignItems: "center", gap: STEP.s1, marginHorizontal: GUTTER,
    marginTop: STEP.s3, paddingVertical: STEP.s2, borderTopWidth: 1, borderBottomWidth: 1,
  },
  label: { marginRight: STEP.s1 },
  name: { flex: 1 },
});
