import { StyleSheet, Text, View } from "react-native";
import Animated from "react-native-reanimated";

import { Icon, LockedValue } from "../../../components/design";
import { useC } from "../../../contexts/ThemeContext";
import { useExam } from "../../../contexts/ExamContext";
import { useThresholdView } from "../../../hooks/useThresholdView";
import { CONTROL, GUTTER, SHAPE, STEP, TYPOGRAPHY } from "../../../themes/tokens";
import { formatNet } from "../../../lib/format";
import { Press } from "../../../components/design/Press";

// BU NETLE NEREYE GIRIYORSUN: hedef bolum ve kalan net acigi.
// TAHMINI SIRALAMA satiri cizilmiyor: tek deneme turunden aralik ureten
// bir kaynak yok (estimateRank TYT+AYT birlikte ister ve tek deger dondurur).
export function TrialSummaryTarget({ onDepartments }) {
  const C = useC();
  const { targetDepartment } = useExam();
  const { gapResult, canAccess, requestAccess } = useThresholdView();
  if (!targetDepartment || !gapResult || gapResult.reached) return null;
  return (
    <Animated.View style={styles.wrap}>
      <Text style={[TYPOGRAPHY.label, { color: C.text2 }]}>BU NETLE NEREYE GİRİYORSUN</Text>
      <View style={[styles.card, { backgroundColor: C.brandTint, borderColor: C.border }]}>
        <View style={styles.copy}>
          <Text style={[TYPOGRAPHY.topicName, { color: C.text }]}>{targetDepartment}</Text>
          <View style={styles.gap}>
            <LockedValue value={formatNet(gapResult.gap)} locked={!canAccess} variant="statSmall"
              onPress={requestAccess} label="Net açığı Pro ile açılır" style={canAccess ? { color: C.accentBright } : null} />
            <Text style={[TYPOGRAPHY.captionMedium, { color: C.text2 }]}>net kaldı</Text>
          </View>
        </View>
        <Press haptic="none" onPress={onDepartments} accessibilityRole="button"
          style={[styles.button, { borderColor: C.border }]}>
          <Text style={[TYPOGRAPHY.metaSemiBold, { color: C.text2 }]}>Bölümleri gör</Text>
          <Icon name="chevR" size={11} color={C.text5} sw={2} />
        </Press>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: GUTTER, marginTop: STEP.s4 - 4 },
  card: {
    flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between", gap: STEP.s2 + 2,
    marginTop: STEP.s2 + 2, padding: STEP.s3, borderRadius: SHAPE.sheet, borderWidth: 1,
  },
  copy: { flex: 1, minWidth: 0 },
  gap: { flexDirection: "row", alignItems: "baseline", gap: STEP.s1, marginTop: STEP.s1 + 2 },
  button: {
    height: CONTROL.tapMin, paddingHorizontal: STEP.s2 + 4, borderRadius: SHAPE.button, borderWidth: 1,
    flexDirection: "row", alignItems: "center", gap: STEP.s1,
  },
});
