import React from "react";
import { View, Text, StyleSheet } from "react-native";

import { TYPOGRAPHY, STEP } from "../../../themes/tokens";
import { useC } from "../../../contexts/ThemeContext";

// SEVIYE YOLU satiri: solda hat + dugum, sagda unvan ve esik.
// Gecilmis seviye accent, bulundugun seviye ici dolu dugum, gelecek
// seviyeler pasif halka (text5 — metin degil, cizim tonu).
function toneFor(C, state) {
  if (state === "passed") return { line: C.accent, ring: C.accent, fill: C.accent, txt: C.text2 };
  if (state === "current") return { line: C.accent, ring: C.accent, fill: C.bg, txt: C.text };
  return { line: C.track, ring: C.text5, fill: C.bg, txt: C.text3 };
}

export const LevelPathRow = React.memo(function LevelPathRow({
  name,
  xpLabel,
  state,
  isFirst,
  isLast,
}) {
  const C = useC();
  const t = toneFor(C, state);
  const upColor = isFirst ? "transparent" : state === "future" ? C.track : C.accent;
  const downColor = isLast ? "transparent" : state === "passed" ? C.accent : C.track;

  return (
    <View style={styles.row}>
      <View style={styles.rail}>
        <View style={[styles.seg, { backgroundColor: upColor }]} />
        <View
          style={[
            styles.node,
            { borderColor: t.ring, backgroundColor: t.fill },
          ]}
        />
        <View style={[styles.seg, { backgroundColor: downColor }]} />
      </View>

      <View style={styles.body}>
        <Text style={[TYPOGRAPHY.topicName, { color: t.txt, flex: 1 }]}>{name}</Text>
        <Text style={[TYPOGRAPHY.meta, styles.xp, { color: C.text3 }]}>{xpLabel}</Text>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  row: { flexDirection: "row", gap: 16 },
  rail: { width: 18, alignItems: "center" },
  seg: { width: 3, flex: 1, borderRadius: 1 },
  node: { width: 14, height: 14, borderRadius: 1, borderWidth: 3 },
  body: {
    flex: 1,
    flexDirection: "row",
    alignItems: "baseline",
    gap: STEP.s1 + 2,
    paddingVertical: 14,
  },
  xp: { fontVariant: ["tabular-nums"] },
});
