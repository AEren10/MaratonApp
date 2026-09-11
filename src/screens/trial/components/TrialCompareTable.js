import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { TYPOGRAPHY, STEP, SHAPE } from "../../../themes/tokens";
import { Card } from "../../../components/design";

const COL = 52;
const DIFF_COL = 50;

function HeadCell({ C, text, width }) {
  return (
    <Text style={[TYPOGRAPHY.tableHead, { color: C.text3, width, textAlign: "right" }]}>{text}</Text>
  );
}

// Tasarim: ders renkli 9px kare + ders adi + iki net + fark.
// Ders rengi YALNIZ kimlik olarak kullaniliyor, durum anlatmiyor.
export const TrialCompareTable = React.memo(function TrialCompareTable({
  C, rows, olderLabel, newerLabel,
}) {
  return (
    <Card tone="surface" radius="sheet" padded={false} style={styles.card}>
      <View style={styles.headRow}>
        <Text style={[TYPOGRAPHY.tableHead, { color: C.text3, flex: 1 }]}>DERS</Text>
        <HeadCell C={C} text={olderLabel} width={COL} />
        <HeadCell C={C} text={newerLabel} width={COL} />
        <HeadCell C={C} text="FARK" width={DIFF_COL} />
      </View>

      {rows.map((r, i) => (
        <View
          key={r.key}
          style={[
            styles.row,
            i < rows.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.line },
          ]}
        >
          <View style={[styles.swatch, { backgroundColor: r.color }]} />
          <Text style={[TYPOGRAPHY.tableName, styles.name, { color: C.text }]} numberOfLines={1}>
            {r.name}
          </Text>
          <Text style={[TYPOGRAPHY.tableValue, styles.value, { color: C.text3, width: COL }]} allowFontScaling={false}>
            {r.olderNet}
          </Text>
          <Text style={[TYPOGRAPHY.tableValue, styles.value, { color: C.text, width: COL }]} allowFontScaling={false}>
            {r.newerNet}
          </Text>
          <Text
            style={[TYPOGRAPHY.tableValue, styles.value, styles.diff, { color: r.diffUp ? C.up : C.down, width: DIFF_COL }]}
            allowFontScaling={false}
          >
            {r.diffLabel}
          </Text>
        </View>
      ))}
    </Card>
  );
});

const styles = StyleSheet.create({
  card: { paddingHorizontal: 18, paddingTop: 4, paddingBottom: STEP.s1, borderRadius: SHAPE.sheet },
  headRow: { flexDirection: "row", alignItems: "center", gap: STEP.s2, paddingTop: 14, paddingBottom: 10 },
  row: { flexDirection: "row", alignItems: "center", gap: STEP.s2, paddingVertical: 14 },
  swatch: { width: 9, height: 9, borderRadius: 1 },
  name: { flex: 1, minWidth: 0 },
  value: { textAlign: "right" },
  diff: { fontFamily: "Archivo_600" },
});
