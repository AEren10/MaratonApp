import { Fragment } from "react";
import { View, Text, StyleSheet } from "react-native";

import { useC } from "../../../../contexts/ThemeContext";
import { formatHoursValue } from "../../../../domain/study/studyHistoryModel";
import { GUTTER, STEP, TYPOGRAPHY } from "../../../../themes/tokens";

// TOPLAM sa · BU HAFTA sa · KAYIT — ortalanmis uc sutun, dikey 1px ayraclarla.
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
          <View style={styles.cell} accessible accessibilityLabel={`${it.label} ${it.value} ${it.unit || ""}`}>
            <Text style={[TYPOGRAPHY.tableHead, styles.label, { color: C.text3 }]}>{it.label}</Text>
            <View style={styles.valueRow}>
              <Text style={[TYPOGRAPHY.statCount, { color: C.text }]}>{it.value}</Text>
              {it.unit ? <Text style={[TYPOGRAPHY.micro, styles.unit, { color: C.text3 }]}>{it.unit}</Text> : null}
            </View>
          </View>
        </Fragment>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: GUTTER,
    paddingTop: STEP.s3 + 2,
    paddingBottom: STEP.s2,
  },
  cell: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  label: { letterSpacing: 1.98, textAlign: "center" },
  valueRow: { flexDirection: "row", alignItems: "baseline", gap: STEP.s1 / 2, marginTop: STEP.s1 / 2 },
  unit: { marginBottom: 1 },
  sep: { width: 1, height: 36, alignSelf: "center" },
});
