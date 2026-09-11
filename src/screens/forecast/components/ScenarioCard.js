import { View, Text, Pressable } from "react-native";
import { useC } from "../../../contexts/ThemeContext";
import { TYPOGRAPHY, STEP, SHAPE, CONTROL } from "../../../themes/tokens";
import { LockedValue } from "../../../components/design/LockedValue";

const LABELS = {
  less: "Haftada %10 daha az",
  current: "Şimdiki tempo",
  more: "Haftada %10 daha fazla",
};

export function ScenarioCard({ item, selected, locked, onPress }) {
  const C = useC();
  const positive = item.deltaNet > 0;
  const deltaColor = positive ? C.green : item.deltaNet < 0 ? C.red : C.text3;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={`${LABELS[item.id]}, ${item.projectedNet} net`}
      style={{
        minHeight: CONTROL.tapMin,
        padding: STEP.s2,
        borderRadius: SHAPE.panel,
        backgroundColor: selected ? C.brandTint : C.surface,
        borderWidth: 1,
        borderColor: selected ? C.accent : C.elev,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "baseline", gap: STEP.s1 }}>
        <Text style={{ ...TYPOGRAPHY.bodyMedium, color: C.text, flex: 1 }}>{LABELS[item.id]}</Text>
        {selected ? (
          <Text style={{ ...TYPOGRAPHY.label, color: C.accentBright }}>SEÇİLİ</Text>
        ) : null}
      </View>
      <View style={{ flexDirection: "row", alignItems: "flex-end", gap: STEP.s1, marginTop: STEP.s1 }}>
        <LockedValue value={item.projectedNet.toFixed(1)} locked={locked} variant="statMedium" showLock={locked} />
        {!locked ? (
          <Text style={{ ...TYPOGRAPHY.meta, color: deltaColor, paddingBottom: 4 }}>
            {item.deltaNet >= 0 ? "+" : ""}{item.deltaNet.toFixed(1)} net
          </Text>
        ) : null}
      </View>
      <Text style={{ ...TYPOGRAPHY.caption, color: C.text3, marginTop: STEP.s1 }}>
        {item.questionsPerWeek} soru/hafta
        {item.minutesPerDayDelta ? ` · günde ${item.minutesPerDayDelta >= 0 ? "+" : ""}${item.minutesPerDayDelta.toFixed(0)} dk` : ""}
      </Text>
    </Pressable>
  );
}
