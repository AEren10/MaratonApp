import { View, Text, Pressable, StyleSheet } from "react-native";
import { TYPOGRAPHY, STEP, SHAPE } from "../../../themes/tokens";
import * as H from "../../../lib/haptics";

export function AddTaskExamSegment({ value, onChange, C }) {
  const options = [
    { key: "tyt", label: "TYT" },
    { key: "ayt", label: "AYT" },
  ];

  return (
    <View style={[s.wrap, { backgroundColor: C.elev, borderColor: C.line }]}>
      {options.map((opt) => {
        const active = value === opt.key;
        return (
          <Pressable
            key={opt.key}
            onPress={() => {
              if (!active) {
                H.select();
                onChange(opt.key);
              }
            }}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            accessibilityLabel={opt.label}
            style={[
              s.tab,
              active && [s.tabActive, { backgroundColor: C.surface, borderColor: C.line }],
            ]}
          >
            <Text
              style={[
                TYPOGRAPHY.bodySemiBold,
                s.label,
                { color: active ? C.accentBright : C.text3 },
              ]}
            >
              {opt.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const s = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    height: 44,
    borderRadius: SHAPE.chip,
    borderWidth: 1,
    padding: STEP.s1 / 2,
    marginBottom: STEP.s3,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: SHAPE.chip - 2,
  },
  tabActive: {
    borderWidth: 1,
  },
  label: {
    letterSpacing: 0.8,
  },
});
