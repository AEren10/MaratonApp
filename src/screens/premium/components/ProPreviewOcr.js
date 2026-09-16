import React, { useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useSelector } from "react-redux";

import { Card, Icon } from "../../../components/design";
import { useC } from "../../../contexts/ThemeContext";
import { selectLatestTrial } from "../../../store/slices/trialSlice";
import { PREVIEW_OCR as P } from "../../../constants/proPreviewVariants";
import { formatNet } from "../../../lib/format";
import { TYPOGRAPHY, STEP, SHAPE } from "../../../themes/tokens";
import { ProPreviewFrame } from "./ProPreviewFrame";
import { ProLockedRow } from "./ProLockedRow";

const SUBJECT_LABELS = {
  turkce: "Türkçe",
  matematik: "Matematik",
  fen: "Fen Bilimleri",
  sosyal: "Sosyal Bilimler",
  fizik: "Fizik",
  kimya: "Kimya",
  biyoloji: "Biyoloji",
};

function rowLabel(key) {
  return SUBJECT_LABELS[key] || String(key || "").replace(/_/g, " ");
}

export function ProPreviewOcr({ onOpen, onDismiss }) {
  const C = useC();
  const latest = useSelector(selectLatestTrial);
  const rows = useMemo(() => Object.entries(latest?.subjects || {})
    .slice(0, 4)
    .map(([key, value]) => ({
      key,
      label: rowLabel(key),
      correct: value.correct_count ?? value.correct ?? 0,
      wrong: value.wrong_count ?? value.wrong ?? 0,
      empty: value.empty_count ?? value.empty ?? 0,
      net: value.net,
    })), [latest?.subjects]);

  return (
    <ProPreviewFrame title={P.title} primary={P.primary} secondary={P.secondary} onPrimary={onOpen} onDismiss={onDismiss}>
      <Text style={[TYPOGRAPHY.body, styles.body, { color: C.text2 }]}>{P.body}</Text>

      {rows.length ? (
        <Card tone="surface" radius="panel" style={styles.card}>
          <View style={styles.paperRow}>
            <View style={[styles.paperIcon, { backgroundColor: C.void, borderColor: C.border }]}>
              <Icon name="image" size={22} color={C.text3} />
            </View>
            <View style={styles.paperText}>
              <Text style={[TYPOGRAPHY.label, { color: C.text3 }]}>{P.tableLabel}</Text>
              <Text style={[TYPOGRAPHY.bodySemiBold, { color: C.text }]} numberOfLines={1}>
                {latest?.name || latest?.title || latest?.trialType || "Deneme"}
              </Text>
            </View>
            <Text style={[TYPOGRAPHY.meta, { color: C.text3 }]}>{formatNet(latest?.totalNet)}</Text>
          </View>

          <View style={styles.head}>
            <Text style={styles.subjectHead} />
            {[P.correct, P.wrong, P.emptyCount].map((label) => (
              <Text key={label} style={[TYPOGRAPHY.micro, styles.cell, { color: C.text3 }]}>{label}</Text>
            ))}
          </View>
          {rows.map((row) => (
            <View key={row.key} style={[styles.row, { borderTopColor: C.line }]}>
              <Text style={[TYPOGRAPHY.tableName, styles.subject, { color: C.text }]} numberOfLines={1}>
                {row.label}
              </Text>
              <Text style={[TYPOGRAPHY.tableValue, styles.cell, { color: C.text }]}>{row.correct}</Text>
              <Text style={[TYPOGRAPHY.tableValue, styles.cell, { color: C.text }]}>{row.wrong}</Text>
              <Text style={[TYPOGRAPHY.tableValue, styles.cell, { color: C.text }]}>{row.empty}</Text>
            </View>
          ))}
        </Card>
      ) : (
        <Card tone="surface" radius="panel" style={styles.empty}>
          <Text style={[TYPOGRAPHY.caption, { color: C.text2 }]}>{P.empty}</Text>
        </Card>
      )}

      <Card tone="surface" radius="panel" style={[styles.success, { borderColor: C.elev }]}>
        <Icon name="check" size={16} color={C.up} />
        <Text style={[TYPOGRAPHY.caption, { color: C.text2, flex: 1 }]}>{P.success}</Text>
      </Card>
      <View style={styles.locked}>
        <ProLockedRow label={P.lockedSave} width={42} boxed />
      </View>
    </ProPreviewFrame>
  );
}

const styles = StyleSheet.create({
  body: { marginTop: STEP.s3, maxWidth: 302 },
  card: { marginTop: STEP.s3, padding: STEP.s2 },
  paperRow: { flexDirection: "row", alignItems: "center", gap: STEP.s2, marginBottom: STEP.s2 },
  paperIcon: { width: 44, height: 44, borderRadius: SHAPE.icon, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  paperText: { flex: 1, minWidth: 0 },
  head: { flexDirection: "row", alignItems: "center", paddingBottom: STEP.s1 },
  subjectHead: { flex: 1 },
  row: { flexDirection: "row", alignItems: "center", borderTopWidth: 1, paddingVertical: STEP.s1 + 2 },
  subject: { flex: 1, minWidth: 0 },
  cell: { width: 48, textAlign: "center", fontVariant: ["tabular-nums"] },
  empty: { marginTop: STEP.s3, padding: STEP.s3 },
  success: { flexDirection: "row", alignItems: "center", gap: STEP.s2, marginTop: STEP.s2, padding: STEP.s2 },
  locked: { marginTop: STEP.s2 },
});
