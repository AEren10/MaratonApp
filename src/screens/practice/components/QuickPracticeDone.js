import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import Animated, { ZoomIn } from "react-native-reanimated";
import { TYPOGRAPHY, SPACING, RADIUS } from "../../../themes/tokens";

export function QuickPracticeDone({ score, total, elapsed, onFinish, C }) {
  const s = makeStyles(C);
  return (
    <Animated.View entering={ZoomIn.duration(400)} style={s.center}>
      <Text style={s.summaryScore}>{score}/{total}</Text>
      <Text style={s.summaryLabel}>Doğru</Text>
      <Text style={s.summaryTime}>{elapsed}s</Text>
      <TouchableOpacity style={s.finishBtn} onPress={onFinish}>
        <Text style={s.finishText}>Bitir</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const makeStyles = (C) =>
  StyleSheet.create({
    center: { flex: 1, alignItems: "center", justifyContent: "center", gap: SPACING.md },
    summaryScore: { fontFamily: "Bricolage_400", fontSize: 56, color: C.accent },
    summaryLabel: { ...TYPOGRAPHY.body, color: C.sec },
    summaryTime: { fontFamily: "Bricolage_400", fontSize: 24, color: C.muted, marginTop: SPACING.sm },
    finishBtn: { marginTop: SPACING.xl, backgroundColor: C.orange, paddingVertical: SPACING.md, paddingHorizontal: SPACING.xxl, borderRadius: RADIUS.md },
    finishText: { ...TYPOGRAPHY.body, color: C.textOnFill, fontWeight: "700" },
  });
