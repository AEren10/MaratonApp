import { View, Text, StyleSheet } from "react-native";

import { Press } from "../../../components/design/Press";
import { Icon } from "../../../components/design/Icon";
import { useAnalysisCoach } from "../../../hooks/useAnalysisCoach";
import { TYPOGRAPHY, STEP, CONTROL, GUTTER } from "../../../themes/tokens";

// Analiz'in en ustunde tek yorum, tek aksiyon. Kutusuz: etiket + cumle +
// yazi butonu. Veri yetmiyorsa hic gorunmez.
export function AnalysisCoachLine({ C }) {
  const { line, added, act, dismiss } = useAnalysisCoach();
  if (!line) return null;

  return (
    <View style={[s.wrap, { borderBottomColor: C.line }]}>
      <View style={s.head}>
        <Text style={[TYPOGRAPHY.label, s.flex, { color: line.tone === "up" ? C.up : C.text3 }]}>BUGÜN İÇİN</Text>
        <Press haptic="none" onPress={dismiss} hitSlop={10} accessibilityRole="button" accessibilityLabel="Yorumu kapat" style={s.close}>
          <Icon name="x" size={14} color={C.text3} />
        </Press>
      </View>
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
  // Diger Analiz bolumleri gibi kenar boslugu (yoksa yazi ekran kenarina yapisiyordu).
  wrap: { marginHorizontal: GUTTER, paddingVertical: STEP.s3, borderBottomWidth: 1, gap: STEP.s1 },
  text: { lineHeight: 22 },
  head: { flexDirection: "row", alignItems: "center" },
  flex: { flex: 1 },
  close: { width: 28, height: 28, alignItems: "center", justifyContent: "center" },
  btn: { minHeight: CONTROL.tapMin, justifyContent: "center", alignSelf: "flex-start" },
  done: { minHeight: CONTROL.tapMin, textAlignVertical: "center", paddingTop: STEP.s2 },
});
