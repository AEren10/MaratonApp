import { useRef, useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";

import { StatBlock } from "../../../components/design";
import { Press } from "../../../components/design/Press";
import { normalizeGoalValue } from "../../../domain/goals/goalValue";
import * as H from "../../../lib/haptics";
import { CONTROL, STEP, TYPOGRAPHY } from "../../../themes/tokens";
import { useC } from "../../../contexts/ThemeContext";

export function GoalValueInput({ value, unit, label, min, max, step, onChange }) {
  const C = useC();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(value));
  const committing = useRef(false);

  const beginEditing = () => {
    setDraft(String(value));
    setEditing(true);
  };

  const commit = () => {
    if (committing.current) return;
    committing.current = true;
    const next = normalizeGoalValue(draft, min, max, step, value);
    setDraft(String(next));
    setEditing(false);
    if (next !== value) {
      H.select();
      onChange(next);
    }
    requestAnimationFrame(() => { committing.current = false; });
  };

  const changeDraft = (nextDraft) => {
    setDraft(nextDraft);
    if (!nextDraft.trim() || !Number.isFinite(Number(nextDraft))) return;
    const next = normalizeGoalValue(nextDraft, min, max, step, value);
    if (next !== value) onChange(next);
  };

  if (!editing) {
    return (
      <Press
        haptic="none"
        onPress={beginEditing}
        accessibilityRole="button"
        accessibilityLabel={`${label}, ${value}. Değiştirmek için dokun`}
        style={styles.display}
      >
        <StatBlock value={value} unit={unit} size="page" align="center" />
      </Press>
    );
  }

  return (
    <View style={styles.editRow}>
      <TextInput
        autoFocus
        accessibilityLabel={`${label} değeri`}
        keyboardType="number-pad"
        maxLength={3}
        onBlur={commit}
        onChangeText={changeDraft}
        onSubmitEditing={commit}
        returnKeyType="done"
        selectTextOnFocus
        selectionColor={C.accent}
        value={draft}
        style={[TYPOGRAPHY.inputHeroNumber, styles.input, { color: C.text }]}
      />
      <Press
        haptic="none"
        onPress={commit}
        accessibilityRole="button"
        accessibilityLabel={`${label} düzenlemeyi bitir`}
        style={styles.done}
      >
        <Text style={[TYPOGRAPHY.metaSemiBold, { color: C.accentText }]}>Tamam</Text>
      </Press>
    </View>
  );
}

const styles = StyleSheet.create({
  display: { width: "100%", alignItems: "center", justifyContent: "center" },
  editRow: { width: "100%", flexDirection: "row", alignItems: "center" },
  input: { flex: 1, minWidth: 0, padding: 0, textAlign: "right" },
  done: {
    alignItems: "center", height: CONTROL.tapMin, justifyContent: "center",
    marginLeft: STEP.s1, minWidth: CONTROL.tapMin,
  },
});
