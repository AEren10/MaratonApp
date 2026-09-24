import { useMemo } from "react";
import { StyleSheet, View } from "react-native";
import Animated from "react-native-reanimated";

import { useC } from "../../../contexts/ThemeContext";
import { useExam } from "../../../contexts/ExamContext";
import { getSubjectsForBranch } from "../../../domain/trial/trialTypes";
import { STEP } from "../../../themes/tokens";
import { TrialEntryChip } from "./TrialEntryChip";
import { TrialEntryRuleLabel } from "./TrialEntryRuleLabel";

// Brans denemesinde tek ders: tasarimdaki cip dilinde, "TYT · Matematik" gibi.
export function BranchSubjectPicker({ value, onChange }) {
  const C = useC();
  const { examType, field } = useExam();
  const subjects = useMemo(() => getSubjectsForBranch(C, examType, field), [C, examType, field]);
  return (
    <Animated.View style={styles.section}>
      <TrialEntryRuleLabel>HANGİ DERS?</TrialEntryRuleLabel>
      <View style={styles.chips}>
        {subjects.map((subject) => (
          <TrialEntryChip key={subject.key} label={`${subject.parent} · ${subject.name}`}
            active={value === subject.key} onPress={() => onChange(subject.key)} />
        ))}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  section: { marginTop: STEP.s3 + 2 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: STEP.s1 },
});
