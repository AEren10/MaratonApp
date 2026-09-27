import { StyleSheet, Text } from "react-native";
import { Icon } from "../../../components/design";
import { Press } from "../../../components/design/Press";
import { CONTROL, GUTTER, STEP } from "../../../themes/tokens";

// Analiz'in tek birincil eylemi. Basligin yaninda diger kontrollerle
// yarisiyordu; artik ekranin sag altinda sabit, kaydirirken de erisilir.
export function AnalysisAddTrialButton({ C, onPress }) {
  return (
    <Press
      haptic="tap"
      accessibilityRole="button"
      accessibilityLabel="Deneme gir"
      onPress={onPress}
      style={[s.btn, { backgroundColor: C.brandFill || C.accent }]}
    >
      <Icon name="plus" size={14} color={C.accentInk} sw={2.5} />
      <Text style={[s.text, { color: C.accentInk }]}>Deneme gir</Text>
    </Press>
  );
}

const s = StyleSheet.create({
  btn: {
    position: "absolute",
    right: GUTTER,
    bottom: STEP.s3,
    height: CONTROL.tapMin + 4,
    paddingHorizontal: STEP.s3,
    borderRadius: (CONTROL.tapMin + 4) / 2,
    flexDirection: "row",
    alignItems: "center",
    gap: STEP.s1,
  },
  text: { fontFamily: "Archivo_700", fontSize: 15 },
});
