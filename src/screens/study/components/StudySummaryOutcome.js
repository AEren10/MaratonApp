import { View, Text, StyleSheet } from "react-native";

import { TYPOGRAPHY, STEP } from "../../../themes/tokens";

// Ozetin en ustundeki "ne yaptik" cumlesi: rotada ne degisti. Kutusuz,
// ince bir cizgiyle ayrilir; baslik + tek cumle.
export function StudySummaryOutcome({ line, C }) {
  if (!line) return null;
  return (
    <View style={[s.wrap, { borderTopColor: C.line }]}>
      <Text style={[TYPOGRAPHY.bodySemiBold, { color: C.text }]}>{line.title}</Text>
      <Text style={[TYPOGRAPHY.body, s.body, { color: C.text2 }]}>{line.body}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { marginTop: STEP.s3, paddingTop: STEP.s3, borderTopWidth: 1 },
  body: { marginTop: STEP.s1 / 2 },
});
