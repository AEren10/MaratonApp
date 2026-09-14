import React from "react";
import { View, Text, StyleSheet } from "react-native";

import { useC } from "../../../contexts/ThemeContext";
import { PREVIEW_TEMPO as P } from "../../../constants/proPreviewVariants";
import { TYPOGRAPHY, STEP, SHAPE } from "../../../themes/tokens";

// Tempo senaryosu karti: haftalik soru · durak · tahmin bandi.
// Referans (su anki tempo) marka tonu + kizil kenarlik; digerleri yuzey.
// Degeri olmayan alan cizilmez.
export const ProPreviewScenarioCard = React.memo(function ProPreviewScenarioCard({ card }) {
  const C = useC();
  const copy = P.cards[card.id];
  if (!copy) return null;
  const ref = card.id === "current";
  const cells = [
    card.weekly && { key: "w", head: P.weekly, value: card.weekly },
    card.stops && { key: "s", head: P.stops, value: card.stops },
    card.band && { key: "b", head: P.band, value: card.band },
  ].filter(Boolean);

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: ref ? C.brandTint : C.surface, borderColor: ref ? C.accent : C.elev },
      ]}
    >
      <View style={styles.top}>
        <Text style={[TYPOGRAPHY.label, { color: ref ? C.accentBright : C.text3 }]}>{copy.label}</Text>
        <Text style={[TYPOGRAPHY.meta, { color: C.text3 }]}>{copy.meta(card.pct)}</Text>
      </View>
      {cells.length ? (
        <View style={[styles.cells, { borderTopColor: C.line }]}>
          {cells.map((cell) => (
            <View key={cell.key} style={styles.cell}>
              <Text style={[TYPOGRAPHY.tableHead, { color: C.text3 }]}>{cell.head}</Text>
              <Text style={[TYPOGRAPHY.meta, styles.value, { color: C.text }]}>{cell.value}</Text>
            </View>
          ))}
        </View>
      ) : null}
      {copy.note ? (
        <Text style={[TYPOGRAPHY.micro, styles.note, { color: C.text3 }]}>{copy.note}</Text>
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  card: { borderWidth: 1, borderRadius: SHAPE.card, paddingVertical: STEP.s2 + 4, paddingHorizontal: STEP.s2 + 6 },
  top: { flexDirection: "row", alignItems: "baseline", justifyContent: "space-between", gap: STEP.s1 },
  cells: { flexDirection: "row", gap: STEP.s2, marginTop: STEP.s1, paddingTop: STEP.s2, borderTopWidth: 1 },
  cell: { flex: 1 },
  value: { marginTop: 4, fontVariant: ["tabular-nums"] },
  note: { marginTop: STEP.s1 },
});
