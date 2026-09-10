import { View, Text } from "react-native";

import { useC } from "../../../contexts/ThemeContext";
import { SPACING, RADIUS, TYPOGRAPHY } from "../../../themes/tokens";

export function TrialEntryProgress({ step, totalSteps }) {
  const C = useC();
  return (
    <View style={{ paddingHorizontal: SPACING.lg, marginBottom: SPACING.md }}
      accessible accessibilityLabel={`Adım ${step}/${totalSteps}`}>
      <Text style={[TYPOGRAPHY.label, { color: C.muted, marginBottom: SPACING.sm }]}>
        {`ADIM ${step}/${totalSteps}`}
      </Text>
      <View style={{ flexDirection: "row", gap: SPACING.xs }}>
        {Array.from({ length: totalSteps }).map((_, index) => (
          <View
            key={index}
            style={{
              flex: 1,
              height: 4,
              borderRadius: RADIUS.pill ?? 999,
              backgroundColor: index < step ? C.accent : C.border,
            }}
          />
        ))}
      </View>
    </View>
  );
}
