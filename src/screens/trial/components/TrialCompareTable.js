import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { TYPOGRAPHY, STEP, SHAPE } from "../../../themes/tokens";
import { Card } from "../../../components/design";
import { alpha } from "../../../themes/colorMix";

// Ders ders fark: solda ders, ortada "eski → yeni", sagda fark etiketi.
// Eski dort sutunlu tablo dar ekranda sikisiyordu; fark artik bir etiket
// ve tek bakista okunuyor. Artis yesil, dusus notr gri (kotu haber bagirmaz).
// Ders rengi YALNIZ kimlik olarak kullaniliyor, durum anlatmiyor.
export const TrialCompareTable = React.memo(function TrialCompareTable({ C, rows }) {
  return (
    <Card tone="surface" radius="sheet" padded={false} style={styles.card}>
      {rows.map((r, i) => {
        const flat = r.diffLabel === "—" || /^[+−-]?0([,.]0+)?$/.test(String(r.diffLabel));
        const tone = flat ? C.text3 : r.diffUp ? C.up : C.down;
        return (
          <View
            key={r.key}
            style={[styles.row, i < rows.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.line }]}
          >
            <View style={[styles.swatch, { backgroundColor: r.color }]} />
            <Text style={[TYPOGRAPHY.bodyMedium, styles.name, { color: C.text }]} numberOfLines={1}>{r.name}</Text>
            <Text style={[TYPOGRAPHY.tableValue, { color: C.text3 }]} allowFontScaling={false}>{r.olderNet}</Text>
            <Text style={[TYPOGRAPHY.meta, { color: C.text4 }]}>→</Text>
            <Text style={[TYPOGRAPHY.tableValue, { color: C.text }]} allowFontScaling={false}>{r.newerNet}</Text>
            <View style={[styles.pill, { backgroundColor: alpha(tone, 14) }]}>
              <Text style={[TYPOGRAPHY.metaSemiBold, { color: tone }]} allowFontScaling={false}>{r.diffLabel}</Text>
            </View>
          </View>
        );
      })}
    </Card>
  );
});

const styles = StyleSheet.create({
  card: { paddingHorizontal: STEP.s3, paddingVertical: STEP.s1, borderRadius: SHAPE.sheet },
  row: { flexDirection: "row", alignItems: "center", gap: STEP.s1, paddingVertical: STEP.s2 + 4 },
  swatch: { width: 9, height: 9, borderRadius: 2 },
  name: { flex: 1, minWidth: 0, marginLeft: 4 },
  pill: { minWidth: 58, alignItems: "center", paddingVertical: 4, paddingHorizontal: STEP.s1, borderRadius: SHAPE.chip, marginLeft: STEP.s1 },
});
