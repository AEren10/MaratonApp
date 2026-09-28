import { StyleSheet, Text, View } from "react-native";
import { Icon } from "../../../components/design";
import { Press } from "../../../components/design/Press";
import { CONTROL, GUTTER, STEP, TYPOGRAPHY } from "../../../themes/tokens";

// Yanlis defterine gorunur giris. Ust segment kalktiktan sonra defter
// yalniz sayfanin en altindaki "Daha derine" listesinde kaliyordu ve
// kullanici hic bulamiyordu (28 Eylul). Grafigin hemen altinda tek satir.
export function AnalysisNotebookLink({ C, onPress }) {
  return (
    <Press
      haptic="tap"
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel="Yanlış defterini aç"
      style={[s.row, { borderColor: C.line }]}
    >
      <Icon name="notebook" size={18} color={C.text2} />
      <View style={s.copy}>
        <Text style={[TYPOGRAPHY.bodySemiBold, { color: C.text }]}>Yanlış defteri</Text>
        <Text style={[TYPOGRAPHY.meta, { color: C.text3 }]}>Kaydettiğin yanlışlar ve bugünkü tekrarlar</Text>
      </View>
      <Icon name="chevR" size={14} color={C.text3} />
    </Press>
  );
}

const s = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: STEP.s2,
    marginHorizontal: GUTTER,
    marginTop: STEP.s3,
    paddingVertical: STEP.s2,
    minHeight: CONTROL.tapMin,
    borderTopWidth: 1,
    borderBottomWidth: 1,
  },
  copy: { flex: 1, gap: 2 },
});
