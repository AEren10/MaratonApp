import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Animated from "react-native-reanimated";

import { useC } from "../../../contexts/ThemeContext";
import { useProPreviewHistory } from "../../../hooks/useProPreviewHistory";
import { PREVIEW_HISTORY as P } from "../../../constants/proPreviewVariants";
import { TYPOGRAPHY, STEP } from "../../../themes/tokens";
import { ProPreviewFrame } from "./ProPreviewFrame";
import { ProPreviewTrialRow } from "./ProPreviewTrialRow";
import { ProLockedRow } from "./ProLockedRow";

// Tasarim: "Önizleme · Geçmiş". Kullanicinin gercek kayit listesi;
// kilitli satirlarda net yerine kilit. Kayitlarin silinmedigi yazili.
export function ProPreviewHistory({ onOpen, onDismiss }) {
  const C = useC();
  const { total, open, rows } = useProPreviewHistory();

  return (
    <ProPreviewFrame
      title={P.title}
      primary={P.primary}
      secondary={P.secondary}
      onPrimary={onOpen}
      onDismiss={onDismiss}
    >
      <Animated.View style={styles.hero}>
        <View style={styles.countRow}>
          <Text style={[TYPOGRAPHY.stat, { color: C.text }]}>{total}</Text>
          <Text style={[TYPOGRAPHY.bodyMedium, styles.meta, { color: C.text3 }]}>{P.countMeta(open)}</Text>
        </View>
        <Text style={[TYPOGRAPHY.caption, styles.body, { color: C.text2 }]}>{P.body}</Text>
      </Animated.View>

      <View style={styles.list}>
        <View style={styles.labelRow}>
          <Text style={[TYPOGRAPHY.label, { color: C.text2 }]}>{P.listLabel}</Text>
          <View style={[styles.hairline, { backgroundColor: C.line }]} />
        </View>
        {rows.map((row) => <ProPreviewTrialRow key={row.id} row={row} />)}
        <View style={styles.compare}>
          <ProLockedRow label={P.lockedCompare} width={40} boxed />
        </View>
      </View>
    </ProPreviewFrame>
  );
}

const styles = StyleSheet.create({
  hero: { marginTop: STEP.s3 },
  countRow: { flexDirection: "row", alignItems: "flex-end", gap: STEP.s1 + 3 },
  meta: { flex: 1, paddingBottom: 6 },
  body: { marginTop: STEP.s2, maxWidth: 300 },
  list: { marginTop: STEP.s3 + 4 },
  labelRow: { flexDirection: "row", alignItems: "center", gap: STEP.s1, marginBottom: STEP.s1 },
  hairline: { flex: 1, height: 1 },
  compare: { marginTop: STEP.s2 },
});
