import { View, Text, Pressable, StyleSheet } from "react-native";

import { Icon } from "../../../components/design/Icon";
import { TYPOGRAPHY, STEP, SHAPE, GUTTER } from "../../../themes/tokens";

export function StudyTimerModeSelector({ C, modeKey, modes, onChange, onCustomPress }) {
  return (
    <View style={s.container}>
      <View style={s.row}>
        <View style={[s.pillsBox, { backgroundColor: C.void, borderColor: C.line }]}>
          {modes.map((mode) => {
            const active = mode.key === modeKey;
            const n = mode.label || String(mode.focus);
            const rest = mode.rest || `${mode.break || 5} DK`;
            return (
              <Pressable
                key={mode.key}
                onPress={() => onChange(mode.key)}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                accessibilityLabel={`${n} dakika ${rest} mola modu`}
                style={[
                  s.pill,
                  {
                    backgroundColor: active ? C.elev : "transparent",
                    borderColor: active ? C.border : "transparent",
                  },
                ]}
              >
                <Text
                  style={[
                    TYPOGRAPHY.topicName,
                    {
                      color: active ? C.text : C.text3,
                      fontSize: 18,
                      lineHeight: 20,
                      fontVariant: ["tabular-nums"],
                    },
                  ]}
                  allowFontScaling={false}
                >
                  {n}
                </Text>
                <Text
                  style={[
                    TYPOGRAPHY.micro,
                    { color: active ? C.text2 : C.text4, letterSpacing: 0.8 },
                  ]}
                >
                  {rest}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Pressable
          onPress={onCustomPress || (() => {})}
          accessibilityRole="button"
          accessibilityLabel="Özel süre"
          style={({ pressed }) => [
            s.editButton,
            {
              borderColor: C.border,
              backgroundColor: pressed ? C.elev : "transparent",
            },
          ]}
        >
          <Icon name="edit" size={16} color={C.text3} />
        </Pressable>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: { paddingHorizontal: GUTTER, marginTop: STEP.s1 + 2 },
  row: { flexDirection: "row", alignItems: "center", gap: STEP.s1 + 2 },
  pillsBox: {
    flex: 1,
    flexDirection: "row",
    gap: 2,
    padding: 4,
    borderRadius: SHAPE.cardTight,
    borderWidth: 1,
  },
  pill: {
    flex: 1,
    height: 44,
    borderRadius: SHAPE.iconBox,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    gap: 1,
  },
  editButton: {
    width: 44,
    height: 44,
    borderRadius: SHAPE.iconBox + 1,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
