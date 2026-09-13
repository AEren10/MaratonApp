import { CONTROL, GUTTER, SHAPE, STEP, TYPOGRAPHY } from "../../themes/tokens";

// Deneme Gir zincirinin ortak olculeri (tasarim: 22px kenar, 20-26px bolum araligi).
export const makeTrialEntryStyles = (C) => ({
  safe: { flex: 1, backgroundColor: C.bg },
  center: { flex: 1, justifyContent: "center", paddingHorizontal: GUTTER },
  scroll: { paddingHorizontal: GUTTER, paddingTop: STEP.s3, paddingBottom: STEP.s4 + STEP.s1 },
  section: { marginTop: STEP.s3 + 2 },
  title: { ...TYPOGRAPHY.heading, color: C.text, maxWidth: 290 },
  body: { ...TYPOGRAPHY.caption, color: C.text2, marginTop: STEP.s1 + 2, maxWidth: 300 },
  label: { ...TYPOGRAPHY.label, color: C.text2 },
  panel: { padding: STEP.s3, borderRadius: SHAPE.sheet, backgroundColor: C.surface, borderWidth: 1, borderColor: C.elev },
  actions: { marginTop: STEP.s3 + 6 },
  tertiary: {
    height: CONTROL.buttonTertiary, marginTop: STEP.s2, alignItems: "center", justifyContent: "center",
  },
  tertiaryText: { ...TYPOGRAPHY.captionMedium, fontFamily: "Archivo_600", color: C.text3 },
});
