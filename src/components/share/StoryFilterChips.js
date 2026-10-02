import { View, Text, StyleSheet } from "react-native";
import Svg, { Path } from "react-native-svg";

import { useC } from "../../contexts/ThemeContext";
import { STEP, GUTTER, TYPOGRAPHY } from "../../themes/tokens";
import { Press } from "../../components/design/Press";
import * as H from "../../lib/haptics";

const SUBJECT_LIST = [
  { key: "mat", label: "Matematik" },
  { key: "tur", label: "Türkçe" },
  { key: "fiz", label: "Fizik" },
  { key: "kim", label: "Kimya" },
  { key: "bio", label: "Biyoloji" },
  { key: "tar", label: "Tarih" },
  { key: "cog", label: "Coğrafya" },
];

function getAvailableFields(kind, data) {
  const f = [];
  if (kind === "cubuk") {
    if (data?.weekQuestions != null) f.push({ key: "showQuestions", label: `Soru (${data.weekQuestions})` });
    if (data?.weekMinutes != null) f.push({ key: "showMinutes", label: "Toplam Süre" });
    f.push({ key: "showDays", label: "Günler" });
    f.push({ key: "showGoalLine", label: "Hedef Çizgisi 🚩" });
    return f;
  }
  if (kind === "harita") {
    if (data?.currentNet != null) f.push({ key: "showNet", label: `Net (${data.currentNet.toFixed(1)}→${data.targetNet})` });
    if (data?.stopsCount != null) f.push({ key: "showStops", label: `Duraklar (${data.completedStops}/${data.stopsCount})` });
    f.push({ key: "showChart", label: "Noktalı Yol & Bayrak 🚩" });
    return f;
  }
  if (kind === "ders") {
    f.push({ key: "showChart", label: "Net Eğrisi" });
    return f;
  }
  if (data?.questions != null) f.push({ key: "showQuestions", label: `Soru (${data.questions})` });
  if (data?.minutes != null) f.push({ key: "showMinutes", label: "Süre" });
  if (data?.streak != null) f.push({ key: "showStreak", label: `Seri (${data.streak} g)` });
  if (data?.series?.length > 1) f.push({ key: "showChart", label: "Grafik" });
  if (data?.stops != null) f.push({ key: "showStops", label: `Duraklar (${data.stops})` });
  if (data?.accuracy != null) f.push({ key: "showAccuracy", label: `İsabet (%${Math.round(data.accuracy)})` });
  if (data?.weekQuestions != null && kind === "iz") f.push({ key: "showWeek", label: "Haftalık" });
  if (data?.dayLabels?.length && kind === "rota") f.push({ key: "showDays", label: "Günler" });
  if (kind === "gerisayim" && data?.daysToExam != null) f.push({ key: "showCountdown", label: `Kalan Gün (${data.daysToExam})` });
  return f;
}

export function StoryFilterChips({ kind, data, visibility, onToggle, selectedSubject = "mat", onSelectSubject }) {
  const C = useC();
  const fields = getAvailableFields(kind, data);

  return (
    <View style={[s.wrap, { backgroundColor: C.void, borderColor: C.line }]}>
      <View style={s.headRow}>
        <View style={s.titleGroup}>
          <Svg width={13} height={13} viewBox="0 0 24 24" fill="none">
            <Path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6" stroke={C.accentBright} strokeWidth={2.2} strokeLinecap="round" />
          </Svg>
          <Text style={[s.title, { color: C.text }]}>HİKÂYEYİ ÖZELLEŞTİR</Text>
        </View>
        <Text style={[TYPOGRAPHY.micro, { color: C.text3 }]}>{kind === "ders" ? "Ders Seç" : "Aç / Kapat"}</Text>
      </View>

      {kind === "ders" ? (
        <View style={s.chipsGrid}>
          {SUBJECT_LIST.map((subj) => {
            const isSel = selectedSubject === subj.key;
            return (
              <Press
                key={subj.key}
                haptic="none"
                onPress={() => { H.tap(); onSelectSubject?.(subj.key); }}
                style={[s.chip, { backgroundColor: isSel ? C.surface : "transparent", borderColor: isSel ? C.accent : C.line }]}
              >
                <View style={[s.dot, { backgroundColor: isSel ? C.accentBright : C.line }]} />
                <Text style={[s.chipText, { color: isSel ? C.text : C.text3 }]}>{subj.label}</Text>
              </Press>
            );
          })}
        </View>
      ) : (
        <View style={s.chipsGrid}>
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
                  backgroundColor: isVisible ? C.surface : "transparent",
                  borderColor: isVisible ? C.accent : C.line,
                },
              ]}
            >
              <View style={[s.dot, { backgroundColor: isVisible ? C.accentBright : C.line }]} />
              <Text style={[s.chipText, { color: isVisible ? C.text : C.text3 }]}>
                {f.label}
              </Text>
            </Press>
          );
        })}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { marginHorizontal: GUTTER, marginTop: STEP.s3, borderRadius: 16, borderWidth: 1, padding: 12 },
  headRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  titleGroup: { flexDirection: "row", alignItems: "center", gap: 7 },
  title: { letterSpacing: 1.1, fontFamily: "Archivo_700", fontSize: 11 },
  chipsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1.2,
  },
  dot: { width: 6, height: 6, borderRadius: 3 },
  chipText: { fontFamily: "Archivo_600", fontSize: 11.5 },
});
