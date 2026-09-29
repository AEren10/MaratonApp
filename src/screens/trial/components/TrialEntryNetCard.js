import { StyleSheet, Text, View } from "react-native";

import { useC } from "../../../contexts/ThemeContext";
import { formatNet, formatNumber } from "../../../lib/format";
import { STEP, TYPOGRAPHY } from "../../../themes/tokens";
import { difficultyMeta } from "../trialDifficultyLevels";

export function TrialEntryNetCard({
  totalNet,
  normalizedNet,
  difficultyLevel,
  publisherName,
  subjectBreakdown = [],
  styles: shared,
}) {
  const C = useC();
  const meta = [publisherName, difficultyMeta(difficultyLevel).factor].filter(Boolean).join(" · ");

  return (
    <View style={shared.panel}>
      <View style={styles.top}>
        <Text style={shared.label}>HESAPLANAN NET</Text>
        <Text style={[TYPOGRAPHY.meta, { color: C.text3 }]}>{meta}</Text>
      </View>
      <View style={styles.bottom}>
        <Text style={[TYPOGRAPHY.stat, styles.value, { color: C.text }]}>{formatNumber(totalNet, 2)}</Text>
        <Text style={[TYPOGRAPHY.meta, styles.note, { color: C.text2 }]}>
          {`normalize net ${formatNumber(normalizedNet, 2)} · rota bunu kullanır`}
        </Text>
      </View>

      {subjectBreakdown.length > 0 ? (
        <View style={styles.breakdownWrap}>
          <View style={[styles.divider, { backgroundColor: C.line }]} />
          <View style={styles.breakdownList}>
            {subjectBreakdown.map((item) => (
              <View key={item.key} style={styles.subjectRow}>
                <View style={styles.subjectLeft}>
                  <View style={[styles.subjectDot, { backgroundColor: item.color }]} />
                  <Text style={[TYPOGRAPHY.tableName, { color: C.text }]}>{item.name}</Text>
                </View>
                <Text style={[TYPOGRAPHY.tableValue, { color: C.text }]}>
                  {formatNet(item.net)} <Text style={[TYPOGRAPHY.meta, { color: C.text3 }]}>net</Text>
                </Text>
              </View>
            ))}
          </View>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  top: { flexDirection: "row", alignItems: "baseline", justifyContent: "space-between", gap: STEP.s1 },
  bottom: { flexDirection: "row", alignItems: "baseline", gap: STEP.s2, marginTop: STEP.s2 },
  value: { lineHeight: 46 },
  note: { flex: 1 },
  breakdownWrap: { marginTop: STEP.s3 },
  divider: { height: 1, marginBottom: STEP.s2 },
  breakdownList: { gap: STEP.s1 },
  subjectRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: STEP.s1 / 2,
  },
  subjectLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: STEP.s1 + 2,
    flex: 1,
  },
  subjectDot: {
    width: 8,
    height: 8,
    borderRadius: 2,
  },
});
