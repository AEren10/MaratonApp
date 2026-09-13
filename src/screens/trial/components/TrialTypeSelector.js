import { Pressable, StyleSheet, Text, View } from "react-native";

import { useC } from "../../../contexts/ThemeContext";
import { useExam } from "../../../contexts/ExamContext";
import { getTrialTypesForExam } from "../../../domain/trial/trialTypes";
import { CONTROL, SHAPE, STEP, TYPOGRAPHY } from "../../../themes/tokens";
import * as H from "../../../lib/haptics";
import { trialShortLabel } from "../trialLabels";
import { TrialEntryRuleLabel } from "./TrialEntryRuleLabel";

// DENEME TURU: esit genislikte segment; secili = marka tonu + vurgu kenari.
export function TrialTypeSelector({ value, onChange }) {
  const C = useC();
  const { examType, field } = useExam();
  const list = getTrialTypesForExam(C, examType, field);
  return (
    <View>
      <TrialEntryRuleLabel>DENEME TÜRÜ</TrialEntryRuleLabel>
      <View style={styles.row}>
        {list.map((type) => {
          const active = value === type.code;
          return (
            <Pressable key={type.code} accessibilityRole="radio" accessibilityLabel={type.label}
              accessibilityState={{ selected: active }}
              onPress={() => { H.select(); onChange(type.code); }}
              style={[styles.item, {
                backgroundColor: active ? C.brandTint : "transparent",
                borderColor: active ? C.accent : C.border,
              }]}>
              <Text style={[TYPOGRAPHY.captionMedium, {
                fontFamily: active ? "Archivo_600" : "Archivo_500",
                color: active ? C.text : C.text2,
              }]}>
                {trialShortLabel(type.code, type.label)}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", gap: STEP.s1 },
  item: {
    flex: 1, height: CONTROL.tapMin, borderRadius: SHAPE.button, borderWidth: 1,
    alignItems: "center", justifyContent: "center",
  },
});
