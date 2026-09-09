import { StyleSheet, Text, View } from "react-native";

import { SPACING, TYPOGRAPHY } from "../../../themes/tokens";

export function NormalizedNetNote({ C, trial }) {
  const raw = Number(trial?.rawTotalNet ?? trial?.totalNet);
  const normalized = Number(trial?.normalizedTotalNet);
  if (!Number.isFinite(raw) || !Number.isFinite(normalized)
      || Math.abs(raw - normalized) < 0.01) return null;
  return (
    <View style={styles.row} accessible accessibilityLabel={`Normalize net ${normalized.toFixed(2)}`}>
      <Text style={[styles.text, { color: C.sec }]}>Normalize net</Text>
      <Text style={[styles.value, { color: C.accent }]}>{normalized.toFixed(2)}</Text>
      {trial.publisherNameSnapshot ? (
        <Text style={[styles.text, { color: C.muted }]}>· {trial.publisherNameSnapshot}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: SPACING.sm },
  text: { ...TYPOGRAPHY.caption },
  value: { ...TYPOGRAPHY.bodySemiBold },
});
