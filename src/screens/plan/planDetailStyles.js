import { StyleSheet } from "react-native";

import { SPACING, TYPOGRAPHY } from "../../themes/tokens";

export function makePlanDetailStyles(C) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: C.bg },
    header: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: SPACING.lg,
      paddingVertical: SPACING.md,
      gap: SPACING.md,
    },
    title: { ...TYPOGRAPHY.subheading, color: C.text, flex: 1 },
    addBtn: {
      width: 36,
      height: 36,
      borderRadius: 12,
      backgroundColor: C.accent + "14",
      borderWidth: 1,
      borderColor: C.accent + "30",
      alignItems: "center",
      justifyContent: "center",
    },
    scroll: { paddingHorizontal: SPACING.lg, paddingBottom: 90 },
    listLabel: {
      flexDirection: "row",
      alignItems: "center",
      gap: SPACING.sm,
      marginBottom: SPACING.md,
    },
    taskList: { gap: SPACING.md },
    addRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      marginBottom: SPACING.md,
      paddingVertical: 10,
      paddingHorizontal: 12,
      borderRadius: 16,
      borderWidth: 1.5,
      borderStyle: "dashed",
    },
    addIcon: {
      width: 26,
      height: 26,
      borderRadius: 8,
      alignItems: "center",
      justifyContent: "center",
    },
    addText: { fontFamily: "Inter_600SemiBold", fontSize: 14 },
  });
}
