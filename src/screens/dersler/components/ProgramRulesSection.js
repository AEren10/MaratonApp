import { Pressable, StyleSheet, Text, View } from "react-native";

import { Icon } from "../../../components/design";
import { useC } from "../../../contexts/ThemeContext";
import { useClassSchedule } from "../../../hooks/useClassSchedule";
import { STEP, TYPOGRAPHY } from "../../../themes/tokens";

// Program Hub · PROGRAMIN KURALLARI -> Haftalık ders programı. Deger
// ("6 gün") yalniz kullanici programi tanimladiysa yazilir.
export function ProgramRulesSection({ onOpen }) {
  const C = useC();
  const { defined, activeDays } = useClassSchedule();
  return (
    <View style={s.wrap}>
      <View style={s.head}>
        <Text style={[TYPOGRAPHY.label, { color: C.text2 }]}>PROGRAMIN KURALLARI</Text>
        <View style={[s.rule, { backgroundColor: C.line }]} />
      </View>
      <Pressable
        onPress={onOpen}
        accessibilityRole="button"
        style={({ pressed }) => [s.row, { borderTopColor: C.line, opacity: pressed ? 0.7 : 1 }]}
      >
        <View style={s.copy}>
          <Text style={[TYPOGRAPHY.bodyMedium, { color: C.text }]}>Haftalık ders programı</Text>
          <Text style={[TYPOGRAPHY.micro, s.sub, { color: C.text3 }]}>Hangi gün hangi derse çalışıyorsun</Text>
        </View>
        {defined ? <Text style={[TYPOGRAPHY.meta, { color: C.text3 }]}>{`${activeDays} gün`}</Text> : null}
        <Icon name="chevR" size={12} color={C.text5} />
      </Pressable>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { marginTop: STEP.s4 - 6 },
  head: { flexDirection: "row", alignItems: "center", gap: STEP.s2 - 2, paddingBottom: STEP.s1 - 2 },
  rule: { flex: 1, height: 1 },
  row: { flexDirection: "row", alignItems: "center", gap: STEP.s2 + 2, paddingVertical: STEP.s3 - 4, borderTopWidth: 1 },
  copy: { flex: 1, minWidth: 0 },
  sub: { marginTop: STEP.s1 / 2 },
});
