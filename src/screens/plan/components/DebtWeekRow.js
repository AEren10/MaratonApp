import { memo } from "react";
import { StyleSheet, Text, View } from "react-native";

import { useC } from "../../../contexts/ThemeContext";
import { formatMinutes, formatNumber } from "../../../lib/format";
import { SHAPE, STEP, TYPOGRAPHY } from "../../../themes/tokens";

// Borc Dagitildi hafta satiri: N. HAFTA + tarih araligi, eklenen sure ve
// o haftaya dusen konular, "eklendi".
function DebtWeekRow({ row }) {
  const C = useC();
  const amount = row.minutes != null ? formatMinutes(row.minutes) : `${formatNumber(row.questions)} soru`;
  return (
    <View style={[s.row, { backgroundColor: C.surface, borderColor: C.elev }]}>
      <View style={s.when}>
        <Text style={[TYPOGRAPHY.tableHead, { color: C.text3 }]}>{`${row.order}. HAFTA`}</Text>
        {row.range ? <Text style={[TYPOGRAPHY.micro, s.range, { color: C.text3 }]}>{row.range}</Text> : null}
      </View>
      <View style={s.body}>
        <Text style={[TYPOGRAPHY.signalValue, { color: C.text }]}>{amount}</Text>
        {row.topics.length ? (
          <Text style={[TYPOGRAPHY.micro, s.range, { color: C.text3 }]} numberOfLines={1}>{row.topics.join(", ")}</Text>
        ) : null}
      </View>
      <Text style={[TYPOGRAPHY.tableHead, { color: C.up, letterSpacing: 0 }]}>eklendi</Text>
    </View>
  );
}

export default memo(DebtWeekRow);

const s = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: STEP.s2 + 2,
    paddingVertical: STEP.s3 - 4,
    paddingHorizontal: STEP.s3 - 2,
    borderRadius: SHAPE.panel,
    borderWidth: 1,
  },
  when: { minWidth: 64 },
  range: { marginTop: STEP.s1 / 2 },
  body: { flex: 1, minWidth: 0 },
});
