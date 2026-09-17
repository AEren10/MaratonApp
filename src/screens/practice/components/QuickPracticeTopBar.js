import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Icon } from "../../../components/design";
import { TYPOGRAPHY, SPACING } from "../../../themes/tokens";

export function QuickPracticeTopBar({ questions, results, currentIndex, elapsed, onClose, C }) {
  const s = makeStyles(C);
  return (
    <View style={s.topBar}>
      <TouchableOpacity
        onPress={onClose}
        hitSlop={12}
        accessibilityLabel="Kapat"
        accessibilityRole="button"
        style={s.closeBtn}
      >
        <Icon name="x" size={20} color={C.muted} />
      </TouchableOpacity>
      <View style={s.dots}>
        {questions.map((_, i) => {
          const bg =
            i < results.length
              ? results[i]
                ? C.green
                : C.red
              : i === currentIndex
              ? C.accent
              : C.surface2;
          return <View key={i} style={[s.dot, { backgroundColor: bg }]} />;
        })}
      </View>
      <Text style={s.timer}>{elapsed}s</Text>
    </View>
  );
}

const makeStyles = (C) =>
  StyleSheet.create({
    topBar: { flexDirection: "row", alignItems: "center", marginBottom: SPACING.lg },
    closeBtn: { padding: 4 },
    dots: { flexDirection: "row", gap: SPACING.sm, flex: 1 },
    dot: { width: SPACING.md, height: SPACING.md, borderRadius: SPACING.md / 2 },
    timer: { ...TYPOGRAPHY.subheading, color: C.sec },
  });
