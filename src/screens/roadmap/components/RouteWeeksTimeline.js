import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { subjectColorOf } from "../../../themes/subjectPalette";
import { GUTTER, SHAPE, STEP, TYPOGRAPHY } from "../../../themes/tokens";

const TR_MONTHS = ["Oca", "Şub", "Mar", "Nis", "May", "Haz", "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara"];

function formatWeekRange(weekStart) {
  if (!weekStart) return "";
  const start = new Date(weekStart);
  if (isNaN(start.getTime())) return "";
  const end = new Date(start.getTime() + 6 * 86400000);
  const sm = TR_MONTHS[start.getMonth()];
  const em = TR_MONTHS[end.getMonth()];
  if (sm === em) {
    return `${start.getDate()} – ${end.getDate()} ${sm}`;
  }
  return `${start.getDate()} ${sm} – ${end.getDate()} ${em}`;
}

export function RouteWeeksTimeline({ C, weeks = [] }) {
  const displayWeeks = (weeks || []).slice(0, 4);
  if (!displayWeeks.length) return null;

  return (
    <View style={s.wrap}>
      <Text style={[TYPOGRAPHY.label, s.sectionLabel, { color: C.text3 }]}>HAFTALARA GÖRE YOL</Text>

      <View style={s.timeline}>
        {displayWeeks.map((w, index) => {
          const isFirst = index === 0;
          const isLast = index === displayWeeks.length - 1;
          const stopCount = w.stops?.length || 0;
          const subjectSet = new Set((w.stops || []).map((s) => s.subject).filter(Boolean));
          const subjects = Array.from(subjectSet);
          const rangeLabel = formatWeekRange(w.weekStart);
          const weekTitle = isFirst ? "BU HAFTA" : `${w.weekNo || index + 1}. HAFTA`;

          return (
            <View key={w.weekStart || index} style={s.itemRow}>
              {/* Sol Zaman Çizgisi */}
              <View style={s.nodeCol}>
                <View
                  style={[
                    s.node,
                    {
                      backgroundColor: isFirst ? C.accent : C.void,
                      borderColor: isFirst ? C.accentBright : C.border,
                    },
                  ]}
                />
                {!isLast ? <View style={[s.trackLine, { backgroundColor: C.line }]} /> : null}
              </View>

              {/* Sağ Bilgi Kartı */}
              <View style={[s.card, { backgroundColor: C.surface, borderColor: C.line }]}>
                <View style={s.cardTop}>
                  <View style={s.weekMeta}>
                    <Text style={[TYPOGRAPHY.label, { color: isFirst ? C.accentBright : C.text2 }]}>
                      {weekTitle}
                    </Text>
                    {rangeLabel ? (
                      <Text style={[TYPOGRAPHY.micro, s.rangeText, { color: C.text3 }]}>
                        {rangeLabel}
                      </Text>
                    ) : null}
                  </View>
                  <Text style={[TYPOGRAPHY.tableValue, { color: C.text }]}>
                    {`${stopCount} durak`}
                  </Text>
                </View>

                {/* Ağırlıklı Ders Noktaları */}
                {subjects.length > 0 ? (
                  <View style={s.subjectsRow}>
                    {subjects.map((subKey) => (
                      <View
                        key={subKey}
                        style={[s.subjectDot, { backgroundColor: subjectColorOf(C, subKey) }]}
                      />
                    ))}
                  </View>
                ) : null}
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: {
    paddingHorizontal: GUTTER,
    marginTop: STEP.s4,
  },
  sectionLabel: {
    marginBottom: STEP.s2,
  },
  timeline: {
    gap: STEP.s2,
  },
  itemRow: {
    flexDirection: "row",
    gap: STEP.s2,
  },
  nodeCol: {
    alignItems: "center",
    width: 16,
    paddingTop: STEP.s2,
  },
  node: {
    width: 10,
    height: 10,
    borderRadius: SHAPE.chip / 2,
    borderWidth: 2,
    zIndex: 1,
  },
  trackLine: {
    flex: 1,
    width: 2,
    marginTop: STEP.s1 / 2,
  },
  card: {
    flex: 1,
    padding: STEP.s2 + STEP.s1 / 2,
    borderRadius: SHAPE.panel,
    borderWidth: 1,
    marginBottom: STEP.s1,
  },
  cardTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  weekMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: STEP.s1,
  },
  rangeText: {
    letterSpacing: 0,
  },
  subjectsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: STEP.s1 / 2,
    marginTop: STEP.s1 + STEP.s1 / 4,
  },
  subjectDot: {
    width: 7,
    height: 7,
    borderRadius: SHAPE.chip / 2,
  },
});
