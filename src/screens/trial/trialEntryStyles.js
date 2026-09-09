import { RADIUS, SPACING, TYPOGRAPHY } from "../../themes/tokens";

export const makeTrialEntryStyles = (C) => ({
  safe: { flex: 1, backgroundColor: C.bg },
  center: { flex: 1, justifyContent: "center", paddingHorizontal: SPACING.lg },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md },
  headerTitle: { ...TYPOGRAPHY.subheading, color: C.text },
  headerSpacer: { width: SPACING.xxl },
  scroll: { paddingHorizontal: SPACING.lg, paddingTop: SPACING.sm, paddingBottom: SPACING.huge },
  dateRow: { flexDirection: "row", alignItems: "center", gap: SPACING.sm, marginBottom: SPACING.xl },
  dateText: { ...TYPOGRAPHY.bodyMedium, color: C.sec, flex: 1 },
  datePicker: { flexDirection: "row", gap: SPACING.sm, marginBottom: SPACING.lg, flexWrap: "wrap" },
  dateChip: { alignItems: "center", gap: SPACING.xs, paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, borderRadius: RADIUS.lg, borderWidth: 1, minWidth: SPACING.huge },
  titleRow: { flexDirection: "row", alignItems: "center", gap: SPACING.sm, backgroundColor: C.surface, borderRadius: RADIUS.lg, borderWidth: 1, borderColor: C.border, paddingHorizontal: SPACING.md, paddingVertical: SPACING.xs, marginBottom: SPACING.lg },
  titleInput: { flex: 1, ...TYPOGRAPHY.bodyMedium, color: C.text, paddingVertical: SPACING.md },
  moodWrap: { marginTop: SPACING.lg, marginBottom: SPACING.sm },
  moodTitle: { ...TYPOGRAPHY.captionMedium, color: C.sec, marginBottom: SPACING.sm },
  moodRow: { flexDirection: "row", gap: SPACING.sm },
  moodBtn: { flex: 1, alignItems: "center", gap: SPACING.xs, paddingVertical: SPACING.md, backgroundColor: C.surface, borderRadius: RADIUS.lg, borderWidth: 1, borderColor: C.border },
  moodBtnActive: { borderColor: C.accent, backgroundColor: C.accent + "18" },
  moodLabel: { ...TYPOGRAPHY.micro, color: C.muted },
});
