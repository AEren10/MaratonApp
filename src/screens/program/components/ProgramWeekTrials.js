import { StyleSheet, Text, View } from "react-native";
import { useNavigation } from "@react-navigation/native";

import { Icon } from "../../../components/design/Icon";
import { Press } from "../../../components/design/Press";
import { SCREENS } from "../../../constants/screens";
import { useC } from "../../../contexts/ThemeContext";
import { useWeekTrialPlan } from "../../../hooks/useWeekTrialPlan";
import { CONTROL, STEP, TYPOGRAPHY } from "../../../themes/tokens";

const DAYS = ["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi", "Pazar"];

// Program > Hafta: bu haftanin deneme onerileri (rota ritmi). Kutusuz satirlar;
// girilen deneme tikli, digerine dokununca deneme girisi o turle acilir.
export function ProgramWeekTrials({ style }) {
  const C = useC();
  const navigation = useNavigation();
  const { plan, asItem } = useWeekTrialPlan();
  if (!plan.length) return null;
  return (
    <View style={style}>
      <Text style={[TYPOGRAPHY.label, { color: C.text2 }]}>BU HAFTANIN DENEMELERİ</Text>
      {plan.map((p) => {
        const item = asItem(p);
        return (
          <Press key={p.id} haptic="tap" disabled={p.done} accessibilityRole="button"
            onPress={() => navigation.navigate(SCREENS.TRIAL_ENTRY, { trialType: p.trialType, branchSubject: p.branchSubject || undefined })}
            style={[s.row, { borderTopColor: C.line }]}>
            <View style={s.body}>
              <Text style={[TYPOGRAPHY.bodySemiBold, { color: p.done ? C.text3 : C.text, textDecorationLine: p.done ? "line-through" : "none" }]}>
                {item.label}
              </Text>
              <Text style={[TYPOGRAPHY.meta, { color: C.text3 }]}>{`${DAYS[p.dayIndex]} · ${p.reason}`}</Text>
            </View>
            {p.done ? <Icon name="check" size={16} color={C.up} /> : <Text style={[TYPOGRAPHY.metaSemiBold, { color: C.text2 }]}>Gir ›</Text>}
          </Press>
        );
      })}
    </View>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: STEP.s2, minHeight: CONTROL.tapMin, paddingVertical: STEP.s2, borderTopWidth: 1 },
  body: { flex: 1, minWidth: 0, gap: 2 },
});
