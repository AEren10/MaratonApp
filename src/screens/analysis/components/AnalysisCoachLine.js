import { View, Text, StyleSheet } from "react-native";

import { Press } from "../../../components/design/Press";
import { useAnalysisCoach } from "../../../hooks/useAnalysisCoach";
import { TYPOGRAPHY, STEP, CONTROL } from "../../../themes/tokens";

// Analiz'in en ustunde tek yorum, tek aksiyon. Kutusuz: etiket + cumle +
// yazi butonu. Veri yetmiyorsa hic gorunmez.
export function AnalysisCoachLine({ C }) {
  const { line, added, act } = useAnalysisCoach();
  if (!line) return null;

  return (
    <View style={[s.wrap, { borderBottomColor: C.line }]}>
      <Text style={[TYPOGRAPHY.label, { color: line.tone === "up" ? C.up : C.text3 }]}>BUGÜN İÇİN</Text>
      <Text style={[TYPOGRAPHY.bodySemiBold, s.text, { color: C.text }]}>{line.text}</Text>
      {line.action ? (
        added ? (
          <Text style={[TYPOGRAPHY.metaSemiBold, s.done, { color: C.up }]}>
            Eklendi. Ana sayfada bugünün duraklarında.
          </Text>
        ) : (
          <Press haptic="none" onPress={act} accessibilityRole="button" style={s.btn}>
            <Text style={[TYPOGRAPHY.metaSemiBold, { color: C.accentText }]}>{`${line.action.label} ›`}</Text>
          </Press>
        )
      ) : null}
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { paddingVertical: STEP.s3, borderBottomWidth: 1, gap: STEP.s1 },
  text: { lineHeight: 22 },
  btn: { minHeight: CONTROL.tapMin, justifyContent: "center", alignSelf: "flex-start" },
  done: { minHeight: CONTROL.tapMin, textAlignVertical: "center", paddingTop: STEP.s2 },
});
