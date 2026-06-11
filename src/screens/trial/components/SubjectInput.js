import { useState, useCallback, useMemo } from "react";
import { View, Text, TextInput } from "react-native";
import { IconBox } from "../../../components/design";
import { C, TYPOGRAPHY, SPACING, RADIUS } from "../../../themes/tokens";

export function SubjectInput({ subject, values, onChange }) {
  const { name, color, icon, max } = subject;

  const net = useMemo(() => {
    const d = parseInt(values.correct, 10) || 0;
    const y = parseInt(values.wrong, 10) || 0;
    return (d - y * 0.25).toFixed(2);
  }, [values.correct, values.wrong]);

  const handleCorrect = useCallback(
    (text) => onChange({ ...values, correct: text }),
    [values, onChange]
  );

  const handleWrong = useCallback(
    (text) => onChange({ ...values, wrong: text }),
    [values, onChange]
  );

  return (
    <View style={[styles.card, { borderColor: color + "40" }]}>
      {/* Accent bar */}
      <View style={[styles.accent, { backgroundColor: color }]} />

      {/* Header */}
      <View style={styles.header}>
        <IconBox icon={icon} color={color} size={36} rounded={10} />
        <Text style={[styles.name, { color }]}>{name}</Text>
        <Text style={[styles.net, { color }]}>{net} net</Text>
      </View>

      {/* Inputs */}
      <View style={styles.inputs}>
        <View style={styles.inputWrap}>
          <Text style={styles.inputLabel}>Dogru</Text>
          <TextInput
            style={styles.input}
            keyboardType="number-pad"
            maxLength={2}
            placeholder="0"
            placeholderTextColor={C.muted}
            value={values.correct}
            onChangeText={handleCorrect}
          />
        </View>
        <View style={styles.inputWrap}>
          <Text style={styles.inputLabel}>Yanlis</Text>
          <TextInput
            style={styles.input}
            keyboardType="number-pad"
            maxLength={2}
            placeholder="0"
            placeholderTextColor={C.muted}
            value={values.wrong}
            onChangeText={handleWrong}
          />
        </View>
      </View>
    </View>
  );
}

const styles = {
  card: {
    backgroundColor: C.surface,
    borderRadius: RADIUS.xxl,
    borderWidth: 1,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    overflow: "hidden",
    position: "relative",
  },
  accent: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 2,
    opacity: 0.6,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  name: {
    ...TYPOGRAPHY.bodySemiBold,
    flex: 1,
  },
  net: {
    ...TYPOGRAPHY.statSmall,
  },
  inputs: {
    flexDirection: "row",
    gap: SPACING.md,
  },
  inputWrap: {
    flex: 1,
  },
  inputLabel: {
    ...TYPOGRAPHY.captionMedium,
    color: C.sec,
    marginBottom: SPACING.xs,
  },
  input: {
    ...TYPOGRAPHY.subheading,
    color: C.text,
    backgroundColor: C.surface2,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: C.border,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    textAlign: "center",
  },
};
