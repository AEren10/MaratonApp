import { View, Text, ScrollView, StyleSheet } from "react-native";
import Svg, { Path } from "react-native-svg";

import { useC } from "../../contexts/ThemeContext";
import { SHAPE, STEP, GUTTER, TYPOGRAPHY } from "../../themes/tokens";
import { Press } from "../../components/design/Press";
import * as H from "../../lib/haptics";

// Her sablonun icerdigi ozellestirilebilir alanlar
function getAvailableFields(kind, data) {
  const fields = [];
  if (data?.questions != null) fields.push({ key: "showQuestions", label: `Soru (${data.questions})` });
  if (data?.minutes != null) fields.push({ key: "showMinutes", label: "Süre" });
  if (data?.streak != null) fields.push({ key: "showStreak", label: `Seri (${data.streak} g)` });
  if (data?.series?.length > 1) fields.push({ key: "showChart", label: "Grafik / İz" });
  if (data?.stops != null) fields.push({ key: "showStops", label: `Duraklar (${data.stops})` });
  if (data?.accuracy != null) fields.push({ key: "showAccuracy", label: `İsabet (%${Math.round(data.accuracy)})` });
  if (data?.weekQuestions != null && kind === "iz") fields.push({ key: "showWeek", label: "Haftalık" });
  if (data?.dayLabels?.length && kind === "rota") fields.push({ key: "showDays", label: "Gün İsimleri" });
  if (data?.daysToExam != null) fields.push({ key: "showCountdown", label: `Sınava ${data.daysToExam} Gün` });
  return fields;
}

export function StoryFilterChips({ kind, data, visibility, onToggle }) {
  const C = useC();
  const fields = getAvailableFields(kind, data);
  if (!fields.length) return null;

  return (
    <View style={s.wrap}>
      <View style={s.headRow}>
        <Text style={[TYPOGRAPHY.micro, s.title, { color: C.text3 }]}>
          GÖSTERİLECEK VERİLERİ SEÇ
        </Text>
        <Text style={[TYPOGRAPHY.micro, { color: C.text4 }]}>
          (Marka & logo sabittir)
        </Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.rail}
      >
        {fields.map((f) => {
          const isVisible = visibility[f.key] !== false;
          return (
            <Press
              key={f.key}
              haptic="none"
              onPress={() => {
                H.tap();
                onToggle(f.key);
              }}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: isVisible }}
              style={[
                s.chip,
                {
                  backgroundColor: isVisible ? C.elev : "transparent",
                  borderColor: isVisible ? C.border : C.line,
                },
              ]}
            >
              <View style={[s.iconBox, { backgroundColor: isVisible ? C.accent : C.line }]}>
                <Svg width={9} height={9} viewBox="0 0 10 10">
                  {isVisible ? (
                    <Path
                      d="M2 5L4 7L8 3"
                      stroke="#FFFFFF"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      fill="none"
                    />
                  ) : (
                    <Path
                      d="M2.5 2.5L7.5 7.5M7.5 2.5L2.5 7.5"
                      stroke={C.text4}
                      strokeWidth={1.8}
                      strokeLinecap="round"
                      fill="none"
                    />
                  )}
                </Svg>
              </View>
              <Text
                style={[
                  TYPOGRAPHY.micro,
                  s.chipText,
                  { color: isVisible ? C.text : C.text4 },
                ]}
              >
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
  wrap: { marginTop: STEP.s2 },
  headRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: GUTTER,
    marginBottom: STEP.s1,
  },
  title: { letterSpacing: 0.8, fontFamily: "Archivo_600" },
  rail: { paddingHorizontal: GUTTER, gap: STEP.s1, alignItems: "center" },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: SHAPE.chip,
    borderWidth: 1,
  },
  iconBox: {
    width: 15,
    height: 15,
    borderRadius: 7.5,
    alignItems: "center",
    justifyContent: "center",
  },
  chipText: { fontFamily: "Archivo_600", fontSize: 12 },
});
