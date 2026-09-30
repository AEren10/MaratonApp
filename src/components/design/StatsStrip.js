import { memo } from "react";
import { StyleSheet, Text, View } from "react-native";

import { STEP, TYPOGRAPHY } from "../../themes/tokens";

/**
 * Kutusuz istatistik şeridi.
 * 1px üst + alt kılcal çizgi, dikey 1px bölücülerle 3–4 hücre.
 * Desen: SubjectAnalysisStats (kullanıcının sevdiği referans).
 *
 * @param {object}   props
 * @param {object}   props.C      - Tema renkleri (useC() çıktısı).
 * @param {Array<{value: string, label: string}>} props.cells - Gösterilecek metrikler.
 * @param {object}   [props.style] - Ek stil (marginTop gibi).
 */
export const StatsStrip = memo(function StatsStrip({ C, cells, style }) {
  return (
    <View style={[s.row, { borderColor: C.line }, style]}>
      {cells.map((c, i) => (
        <View key={c.label} style={[s.cell, i > 0 && { borderLeftWidth: 1, borderLeftColor: C.line }]}>
          <Text style={[TYPOGRAPHY.statSmall, s.num, { color: C.text }]}>{c.value}</Text>
          <Text style={[TYPOGRAPHY.meta, { color: C.text3 }]}>{c.label}</Text>
        </View>
      ))}
    </View>
  );
});

const s = StyleSheet.create({
  row: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderBottomWidth: 1,
    marginTop: STEP.s3,
  },
  cell: {
    flex: 1,
    paddingVertical: STEP.s2,
    alignItems: "center",
    gap: 2,
  },
  num: {
    fontVariant: ["tabular-nums"],
  },
});
