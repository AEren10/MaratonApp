import { View, Text, Pressable } from "react-native";
import { C, SPACING } from "../../../themes/tokens";

const DURATIONS = [
  { label: "15dk", value: 15 },
  { label: "30dk", value: 30 },
  { label: "45dk", value: 45 },
  { label: "1s", value: 60 },
  { label: "1.5s", value: 90 },
  { label: "2s", value: 120 },
];

export function DurationPicker({ selected, onSelect }) {
  return (
    <View style={{ flexDirection: "row", gap: SPACING.sm, flexWrap: "wrap" }}>
      {DURATIONS.map((d) => {
        const active = selected === d.value;
        return (
          <Pressable
            key={d.value}
            onPress={() => onSelect(d.value)}
            style={{
              paddingHorizontal: SPACING.lg,
              paddingVertical: 10,
              borderRadius: 12,
              backgroundColor: active ? C.amber + "22" : C.surface,
              borderWidth: 1,
              borderColor: active ? C.amber : C.border,
              minWidth: 56,
              alignItems: "center",
            }}
          >
            <Text
              style={{
                fontFamily: "Inter_600SemiBold",
                fontSize: 13,
                color: active ? C.amber : C.sec,
              }}
            >
              {d.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
