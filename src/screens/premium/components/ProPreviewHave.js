import React from "react";
import { View, Text, StyleSheet } from "react-native";

import { Card } from "../../../components/design";
import { useC } from "../../../contexts/ThemeContext";
import { TYPOGRAPHY, STEP } from "../../../themes/tokens";
import { PRO_PREVIEW } from "../../../constants/proPitch";

// "SU AN ELINDE OLAN": kullanicinin KENDI ucretsiz verisi. Satirlar
// useProPreviewData'dan gercek deneme kayitlarindan gelir; kayit yoksa
// ekran bu blogu hic cizmez.
export const ProPreviewHave = React.memo(function ProPreviewHave({ rows }) {
  const C = useC();
  if (!rows.length) return null;

  return (
    <Card tone="surface" radius="panel" style={styles.card}>
      <Text style={[TYPOGRAPHY.label, { color: C.text3 }]}>{PRO_PREVIEW.haveLabel}</Text>
      {rows.map((row) => (
        <View key={row.key} style={styles.row}>
          <Text style={[TYPOGRAPHY.meta, styles.name, { color: C.text3 }]} numberOfLines={1}>
            {row.name}
          </Text>
          <View style={[styles.track, { backgroundColor: C.track }]}>
            <View
              style={[
                styles.fill,
                { width: `${Math.round(row.ratio * 100)}%`, backgroundColor: C.subjects[row.key] || C.text3 },
              ]}
            />
          </View>
          <Text style={[TYPOGRAPHY.tableValue, styles.value, { color: C.text }]}>{row.value}</Text>
        </View>
      ))}
    </Card>
  );
});

const styles = StyleSheet.create({
  card: { paddingVertical: STEP.s2, paddingHorizontal: STEP.s3 },
  row: { flexDirection: "row", alignItems: "center", gap: STEP.s2, marginTop: STEP.s2 },
  name: { width: 78 },
  track: { flex: 1, height: 8, borderRadius: 1, overflow: "hidden" },
  fill: { height: "100%", borderRadius: 2 },
  value: { width: 78, textAlign: "right" },
});
