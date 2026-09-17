import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Icon } from "../../../components/design";
import { TYPOGRAPHY, SPACING, RADIUS } from "../../../themes/tokens";

export function QuickPracticeEmptyState({ icon, iconColor, text, onBack, C }) {
  const s = makeStyles(C);
  return (
    <SafeAreaView edges={["top"]} style={[s.container, s.center]}>
      <Icon name={icon} size={48} color={iconColor} />
      <Text style={s.emptyText}>{text}</Text>
      <TouchableOpacity style={s.backBtn} onPress={onBack}>
        <Text style={s.backBtnText}>Geri Dön</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const makeStyles = (C) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: C.bg, padding: SPACING.lg },
    center: { alignItems: "center", justifyContent: "center", gap: SPACING.md },
    emptyText: { ...TYPOGRAPHY.body, color: C.sec, marginTop: SPACING.sm },
    backBtn: {
      marginTop: SPACING.md,
      paddingVertical: SPACING.sm,
      paddingHorizontal: SPACING.lg,
      backgroundColor: C.surface,
      borderRadius: RADIUS.md,
    },
    backBtnText: { ...TYPOGRAPHY.body, color: C.accent, fontWeight: "600" },
  });
