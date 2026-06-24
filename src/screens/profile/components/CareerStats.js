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

export function CareerStats({ totalQuestions, totalHours, trialCount }) {
  const C = useC();
  const qDisplay = totalQuestions > 999
    ? `${(totalQuestions / 1000).toFixed(1)}k`
    : String(totalQuestions);

  return (
    <View style={{
      flexDirection: "row",
      paddingVertical: SPACING.lg,
      marginHorizontal: SPACING.lg,
    }}>
      <StatCol value={qDisplay} label="toplam soru" color={C.orange} />
      <View style={{ width: 1, backgroundColor: C.border, marginVertical: SPACING.xs }} />
      <StatCol value={`${totalHours}s`} label="çalışma" color={C.purple} />
      <View style={{ width: 1, backgroundColor: C.border, marginVertical: SPACING.xs }} />
      <StatCol value={String(trialCount)} label="deneme" color={C.blue} />
    </View>
  );
}
