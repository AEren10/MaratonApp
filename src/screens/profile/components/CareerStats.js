import { View, Text } from "react-native";
import { TYPOGRAPHY, SPACING } from "../../../themes/tokens";
import { useC } from "../../../contexts/ThemeContext";

function StatCol({ value, label, color }) {
  const C = useC();
  return (
    <View style={{ flex: 1, alignItems: "center" }}>
      <Text style={{
        ...TYPOGRAPHY.statSmall,
        color: color || C.text,
      }}>
        {value}
      </Text>
      <Text style={{
        ...TYPOGRAPHY.micro,
        color: C.sec,
        marginTop: SPACING.xs,
      }}>
        {label}
      </Text>
    </View>
  );
}

export function CareerStats({ totalQuestions, totalHours, longestStreak }) {
  const C = useC();
  const qDisplay = totalQuestions >= 1000
    ? totalQuestions.toLocaleString("tr-TR")
    : String(totalQuestions);

  return (
    <View style={{
      flexDirection: "row",
      paddingVertical: SPACING.lg,
      marginHorizontal: SPACING.lg,
    }}>
      <StatCol value={qDisplay} label="soru" color={C.orange} />
      <View style={{ width: 1, backgroundColor: C.border, marginVertical: SPACING.xs }} />
      <StatCol value={String(totalHours)} label="saat" />
      <View style={{ width: 1, backgroundColor: C.border, marginVertical: SPACING.xs }} />
      <StatCol value={String(longestStreak || 0)} label="en uzun seri" color={C.orange} />
    </View>
  );
}
