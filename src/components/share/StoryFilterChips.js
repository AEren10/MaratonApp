import { View, Text, ScrollView, StyleSheet } from "react-native";
import Svg, { Path } from "react-native-svg";

import { useC } from "../../contexts/ThemeContext";
import { STEP, GUTTER, TYPOGRAPHY } from "../../themes/tokens";
import { Press } from "../../components/design/Press";
import * as H from "../../lib/haptics";

function getAvailableFields(kind, data) {
  const f = [];
  if (kind === "cubuk") {
    if (data?.weekQuestions != null) f.push({ key: "showQuestions", label: `Soru (${data.weekQuestions})` });
    if (data?.weekMinutes != null) f.push({ key: "showMinutes", label: "Toplam Süre" });
    f.push({ key: "showDays", label: "Gün İsimleri" });
    f.push({ key: "showGoalLine", label: "Hedef Çizgisi 🚩" });
    if (data?.daysToExam != null) f.push({ key: "showCountdown", label: `Sınava ${data.daysToExam} Gün` });
    return f;
  }
  if (kind === "harita") {
    if (data?.currentNet != null) f.push({ key: "showNet", label: `Net (${data.currentNet.toFixed(1)}→${data.targetNet})` });
    if (data?.stopsCount != null) f.push({ key: "showStops", label: `Duraklar (${data.completedStops}/${data.stopsCount})` });
    f.push({ key: "showChart", label: "Rota & Bayrak 🚩" });
    if (data?.daysToExam != null) f.push({ key: "showCountdown", label: `Sınava ${data.daysToExam} Gün` });
    return f;
  }
  if (data?.questions != null) f.push({ key: "showQuestions", label: `Soru (${data.questions})` });
  if (data?.minutes != null) f.push({ key: "showMinutes", label: "Süre" });
  if (data?.streak != null) f.push({ key: "showStreak", label: `Seri (${data.streak} g)` });
  if (data?.series?.length > 1) f.push({ key: "showChart", label: "Grafik / İz" });
  if (data?.stops != null) f.push({ key: "showStops", label: `Duraklar (${data.stops})` });
  if (data?.accuracy != null) f.push({ key: "showAccuracy", label: `İsabet (%${Math.round(data.accuracy)})` });
  if (data?.weekQuestions != null && kind === "iz") f.push({ key: "showWeek", label: "Haftalık" });
  if (data?.dayLabels?.length && kind === "rota") f.push({ key: "showDays", label: "Gün İsimleri" });
  if (data?.daysToExam != null) f.push({ key: "showCountdown", label: `Sınava ${data.daysToExam} Gün` });
  return f;
}

export function StoryFilterChips({ kind, data, visibility, onToggle }) {
  const C = useC();
  const fields = getAvailableFields(kind, data);
  if (!fields.length) return null;

  return (
    <View style={s.wrap}>
      <View style={s.headRow}>
        <Text style={[TYPOGRAPHY.label, s.title, { color: C.text2 }]}>HİKAYEYİ ÖZELLEŞTİR</Text>
        <Text style={[TYPOGRAPHY.micro, { color: C.text3 }]}>Dokun & Kapat / Aç</Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.rail}>
        {fields.map((f) => {
          const isVisible = visibility[f.key] !== false;
          return (
            <Press
              key={f.key}
              haptic="none"
              onPress={() => { H.tap(); onToggle(f.key); }}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: isVisible }}
              style={[
                s.chip,
                {
                  backgroundColor: isVisible ? C.elev : C.void,
                  borderColor: isVisible ? C.accent : C.border,
                },
              ]}
            >
              <View style={[s.iconBox, { backgroundColor: isVisible ? C.accent : "transparent" }]}>
                {isVisible ? (
                  <Svg width={9} height={9} viewBox="0 0 10 10">
                    <Path d="M2 5L4 7L8 3" stroke="#FFFFFF" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" fill="none" />
                  </Svg>
                ) : (
                  <View style={[s.offDot, { backgroundColor: C.text4 }]} />
                )}
              </View>
              <Text style={[TYPOGRAPHY.micro, s.chipText, { color: isVisible ? C.text : C.text4 }]}>
                {f.label}
              </Text>
            </Press>
          );
        })}
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { marginTop: STEP.s3 },
  headRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: GUTTER, marginBottom: STEP.s1 },
  title: { letterSpacing: 0.9, fontFamily: "Archivo_600", fontSize: 11.5 },
  rail: { paddingHorizontal: GUTTER, gap: STEP.s1, alignItems: "center", paddingVertical: 2 },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  iconBox: { width: 16, height: 16, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  offDot: { width: 4, height: 4, borderRadius: 2 },
  chipText: { fontFamily: "Archivo_600", fontSize: 12 },
});
