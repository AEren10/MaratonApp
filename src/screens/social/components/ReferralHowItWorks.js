import { memo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { alpha } from "../../../themes/colorMix";
import { SHAPE, STEP, TYPOGRAPHY } from "../../../themes/tokens";

const STEPS = [
  {
    num: "1",
    title: "Kodunu Ulaştır",
    desc: "Davet kodunu WhatsApp veya mesajla sınav arkadaşına ilet.",
  },
  {
    num: "2",
    title: "Birlikte Başlayın",
    desc: "Arkadaşın Maraton'u indirip kaydolurken kodunu sisteme girsin.",
  },
  {
    num: "3",
    title: "Ritmi Birlikte Yakalayın",
    desc: "Denemeler ve günlük çalışma duraklarında birbirinizin hızını takip edin.",
  },
];

export const ReferralHowItWorks = memo(function ReferralHowItWorks({ C }) {
  return (
    <View style={[styles.card, { backgroundColor: C.surface, borderColor: C.line }]}>
      <Text style={[TYPOGRAPHY.label, { color: C.text3 }]}>NASIL ÇALIŞIR?</Text>

      <View style={styles.list}>
        {STEPS.map((s, idx) => (
          <View key={s.num} style={styles.stepRow}>
            <View
              style={[
                styles.numCircle,
                {
                  backgroundColor: alpha(C.accent, 12),
                  borderColor: alpha(C.accent, 26),
                },
              ]}
            >
              <Text style={[styles.numText, { color: C.accentBright }]}>{s.num}</Text>
            </View>

            <View style={styles.textCol}>
              <Text style={[TYPOGRAPHY.bodySemiBold, { color: C.text }]}>{s.title}</Text>
              <Text style={[TYPOGRAPHY.caption, { color: C.text2 }]}>{s.desc}</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    width: "100%",
    borderRadius: SHAPE.panel,
    borderWidth: 1,
    padding: STEP.s2,
    gap: STEP.s2,
  },
  list: {
    gap: STEP.s2,
  },
  stepRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: STEP.s1,
  },
  numCircle: {
    width: 26,
    height: 26,
    borderRadius: SHAPE.pill,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 1,
  },
  numText: {
    fontFamily: "Archivo_600",
    fontSize: 12,
  },
  textCol: {
    flex: 1,
    gap: 2,
  },
});
