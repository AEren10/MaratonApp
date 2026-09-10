import { View, Text, StyleSheet } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { StatBlock } from "../../../components/design/StatBlock";
import { useC } from "../../../contexts/ThemeContext";
import { TYPOGRAPHY, STEP } from "../../../themes/tokens";

const EXAM_LABELS = { tyt: "TYT", tyt_ayt: "YKS", dil: "YKS DİL", lgs: "LGS" };

// "BUGÜN ÇÖZÜLEN" — tasarimin kahraman sayisi. Sag ustte sinav gun sayaci.
export function HomeHeroStat({ solved, goal, remainingToGoal, daysUntilExam, examType }) {
  const C = useC();
  const examLabel = EXAM_LABELS[examType] || "SINAV";

  return (
    <Animated.View entering={FadeInDown.duration(480).springify().damping(18)} style={s.row}>
      <StatBlock
        label="Bugün çözülen"
        value={solved}
        unit={`/${goal}`}
        size="hero"
      >
        <Text style={[TYPOGRAPHY.body, { color: C.text3, marginTop: STEP.s1 }]}>
          {remainingToGoal > 0 ? `hedefe ${remainingToGoal} kaldı` : "hedef tamamlandı"}
        </Text>
      </StatBlock>

      {daysUntilExam != null ? (
        <View style={s.examChip}>
          <Text style={[TYPOGRAPHY.label, { color: C.text3 }]}>{examLabel}</Text>
          <Text style={[TYPOGRAPHY.stat, { color: C.text, fontSize: 26, lineHeight: 30 }]}>
            {Math.max(0, daysUntilExam)}
          </Text>
          <Text style={[TYPOGRAPHY.meta, { color: C.text3 }]}>gün</Text>
        </View>
      ) : null}
    </Animated.View>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between" },
  examChip: { alignItems: "flex-end", gap: 2, paddingTop: STEP.s1 },
});
