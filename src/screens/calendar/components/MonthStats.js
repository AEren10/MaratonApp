import { View, Text } from "react-native";
import { useSelector } from "react-redux";
import { TYPOGRAPHY, SPACING } from "../../../themes/tokens";
import { useC } from "../../../contexts/ThemeContext";
import { selectStreak } from "../../../store/slices/studyLogSlice";

function StatItem({ value, label, isLast, C }) {
  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 14,
      }}
    >
      <Text
        style={{
          fontFamily: "SpaceGrotesk_700Bold",
          fontSize: 18,
          lineHeight: 22,
          color: C.text,
        }}
      >
        {value}
      </Text>
      <Text
        style={{
          fontFamily: "Inter_500Medium",
          fontSize: 10,
          lineHeight: 13,
          color: C.muted,
          marginTop: 3,
        }}
      >
        {label}
      </Text>
    </View>
  );
}

export function MonthStats({ stats }) {
  const C = useC();
  const streak = useSelector(selectStreak);

  return (
    <View
      style={{
        flexDirection: "row",
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: C.border,
        marginBottom: SPACING.lg,
      }}
    >
      <StatItem value={stats.totalQuestions} label="soru" C={C} />
      <StatItem value={stats.totalTrials} label="deneme" C={C} />
      <StatItem value={stats.activeDays} label="aktif gün" C={C} />
      <StatItem value={streak} label="seri" isLast C={C} />
    </View>
  );
}
