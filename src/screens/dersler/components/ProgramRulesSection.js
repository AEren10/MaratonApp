import { StyleSheet, Text, View } from "react-native";
import { Icon } from "../../../components/design";
import { useC } from "../../../contexts/ThemeContext";
import { useClassSchedule } from "../../../hooks/useClassSchedule";
import { STEP, TYPOGRAPHY } from "../../../themes/tokens";
import { Press } from "../../../components/design/Press";

export function ProgramRulesSection({ onOpen }) {
  const C = useC();
  const { defined, activeDays } = useClassSchedule();
  return (
    <View style={s.wrap}>
      <View style={s.head}>
        <Text style={[TYPOGRAPHY.label, { color: C.text3 }]}>PROGRAMIN KURALLARI</Text>
        <View style={[s.rule, { backgroundColor: C.line }]} />
      </View>
      <Press haptic="none"
        onPress={onOpen}
        accessibilityRole="button"
        style={[s.row, { borderTopColor: C.line}]}
      >
        <View style={s.copy}>
          <Text style={[TYPOGRAPHY.bodySemiBold, { color: C.text }]}>Haftalık ders programı</Text>
          <Text style={[TYPOGRAPHY.meta, { color: C.text3 }]}>Hangi gün hangi derse çalışıyorsun</Text>
        </View>
        <View style={s.val}>
          {defined && activeDays > 0 ? (
            <Text style={[TYPOGRAPHY.meta, { color: C.text }]}>{activeDays} gün</Text>
          ) : (
            <Text style={[TYPOGRAPHY.meta, { color: C.text3 }]}>Belirle</Text>
          )}
          <Icon name="chevR" size={14} color={C.text3} />
        </View>
      </Press>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { marginTop: STEP.s4 },
  head: { flexDirection: "row", alignItems: "center", gap: STEP.s2, paddingBottom: STEP.s2 },
  rule: { flex: 1, height: 1 },
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingTop: STEP.s2 + 2 },
  copy: { gap: 2 },
  val: { flexDirection: "row", alignItems: "center", gap: 6 },
});
