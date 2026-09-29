import { StyleSheet, Text, View } from "react-native";
import { useC } from "../../../contexts/ThemeContext";
import { formatMinutes, groupThousands } from "../../../domain/home/weeklyEffort";
import { STEP, TYPOGRAPHY } from "../../../themes/tokens";

// Haftalik cubuk grafigi altinda toplam sure ve cozulmus soru sayisi
export function HomeWeeklyMetrics({ weeklyEffort }) {
  const C = useC();
  const totalMinutes = weeklyEffort?.totalMinutes || 0;
  const totalQuestions = weeklyEffort?.totalQuestions || 0;

  const durationStr = formatMinutes(totalMinutes);
  const questionsStr = groupThousands(totalQuestions);

  return (
    <View style={s.row}>
      <View style={s.colLeft}>
        <Text style={[TYPOGRAPHY.statSmall, { color: C.text }]} numberOfLines={1}>
          {durationStr}
        </Text>
        <Text style={[TYPOGRAPHY.meta, { color: C.text3 }]}>
          bu hafta çalıştın
        </Text>
      </View>
      <View style={s.colRight}>
        <Text style={[TYPOGRAPHY.statSmall, { color: C.text }]} numberOfLines={1}>
          {questionsStr}
        </Text>
        <Text style={[TYPOGRAPHY.meta, { color: C.text3 }]}>
          soru
        </Text>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginTop: STEP.s2,
    minHeight: STEP.s5,
  },
  colLeft: {
    flex: 1,
    justifyContent: "flex-end",
  },
  colRight: {
    alignItems: "flex-end",
    justifyContent: "flex-end",
  },
});
