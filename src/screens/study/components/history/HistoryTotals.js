import { Fragment } from "react";
import { View, Text, StyleSheet } from "react-native";

import { useC } from "../../../../contexts/ThemeContext";
import { formatHoursValue } from "../../../../domain/study/studyHistoryModel";
import { GUTTER, STEP, TYPOGRAPHY } from "../../../../themes/tokens";

// TOPLAM sa · BU HAFTA sa · KAYIT — dikey 1px ayraclarla.
export function HistoryTotals({ totals }) {
  const C = useC();
  const items = [
    { label: "TOPLAM", value: formatHoursValue(totals.totalMinutes), unit: "sa" },
    { label: "BU HAFTA", value: formatHoursValue(totals.weekMinutes), unit: "sa" },
    { label: "KAYIT", value: String(totals.count) },
  ];
  return (
    <View style={styles.row}>
      {items.map((it, i) => (
        <Fragment key={it.label}>
          {i > 0 ? <View style={[styles.sep, { backgroundColor: C.line }]} /> : null}
          <View accessible accessibilityLabel={`${it.label} ${it.value} ${it.unit || ""}`}>
            <Text style={[TYPOGRAPHY.tableHead, styles.label, { color: C.text3 }]}>{it.label}</Text>
            <View style={styles.valueRow}>
              <Text style={[TYPOGRAPHY.statSmall, { color: C.text }]}>{it.value}</Text>
              {it.unit ? <Text style={[TYPOGRAPHY.micro, { color: C.text3 }]}>{it.unit}</Text> : null}
            </View>
          </View>
        </Fragment>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "flex-end", gap: STEP.s3 + 4, paddingHorizontal: GUTTER, paddingTop: STEP.s3 + 2 },
  label: { letterSpacing: 1.98 },
  valueRow: { flexDirection: "row", alignItems: "baseline", gap: STEP.s1 - 3, marginTop: STEP.s1 - 2 },
  sep: { width: 1, height: 34, alignSelf: "center" },
});
