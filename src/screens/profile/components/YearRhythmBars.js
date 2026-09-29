import React, { memo } from "react";
import { View, Text, StyleSheet } from "react-native";

import { useC } from "../../../contexts/ThemeContext";
import { SHAPE, STEP, TYPOGRAPHY } from "../../../themes/tokens";
import { formatNumber } from "../../../lib/format";

function YearRhythmBarsComponent({ last8Weeks = [], bestWeek }) {
  const C = useC();
  if (!last8Weeks.length) return null;

  const maxWeekQuestions = Math.max(...last8Weeks.map((w) => w.questions || 0), 1);

  return (
    <View style={[s.rhythmSection, { borderTopColor: C.line }]}>
      <View style={s.barsRow}>
        {last8Weeks.map((w, i) => {
          const ratio = Math.min(1, (w.questions || 0) / maxWeekQuestions);
          const barHeight = Math.max(4, Math.round(ratio * 36));
          const isTop = (w.questions || 0) === maxWeekQuestions && maxWeekQuestions > 0;
          return (
            <View key={w.weekStart || i} style={s.barCol}>
              <View style={s.barTrack}>
                <View
                  style={[
                    s.barFill,
                    {
                      height: barHeight,
                      backgroundColor: isTop ? C.accent : C.bandEdge,
                    },
                  ]}
                />
              </View>
              <Text style={[TYPOGRAPHY.micro, { color: isTop ? C.accentText : C.text4 }]}>
                {i + 1}
              </Text>
            </View>
          );
        })}
      </View>
      <View style={s.rhythmFooter}>
        <Text style={[TYPOGRAPHY.micro, { color: C.text3 }]}>Son 8 haftalık ritim</Text>
        {bestWeek && (bestWeek.questions > 0 || bestWeek.minutes > 0) ? (
          <Text style={[TYPOGRAPHY.micro, { color: C.text2 }]}>
            En iyi: {formatNumber(bestWeek.questions)} soru
          </Text>
        ) : null}
      </View>
    </View>
  );
}

export const YearRhythmBars = memo(YearRhythmBarsComponent);

const s = StyleSheet.create({
  rhythmSection: {
    marginTop: STEP.s3,
    paddingTop: STEP.s3,
    borderTopWidth: 1,
  },
  barsRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    height: 48,
    gap: 6,
  },
  barCol: {
    flex: 1,
    alignItems: "center",
    gap: 4,
  },
  barTrack: {
    height: 36,
    width: "100%",
    justifyContent: "flex-end",
    alignItems: "center",
  },
  barFill: {
    width: "100%",
    maxWidth: 24,
    borderRadius: SHAPE.chip / 2,
  },
  rhythmFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: STEP.s2,
  },
});
