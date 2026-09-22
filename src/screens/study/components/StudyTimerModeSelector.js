import { View, Text, Pressable, StyleSheet } from "react-native";
import * as Haptics from "expo-haptics";

import { Icon } from "../../../components/design/Icon";
import { TYPOGRAPHY, STEP, GUTTER } from "../../../themes/tokens";

export function StudyTimerModeSelector({ C, modeKey, modes, onChange, onCustomPress }) {
  const handleSelect = (key) => {
    if (key !== modeKey) {
      Haptics.selectionAsync().catch(() => {});
      onChange(key);
    }
  };

  return (
    <View style={s.container}>
      <View style={s.row}>
        <View style={[s.pillsBox, { backgroundColor: C.surface, borderColor: C.line }]}>
          {modes.map((mode) => {
            const active = mode.key === modeKey;
            const n = mode.label || String(mode.focus);
            const rest = mode.rest || `${mode.break || 5} DK`;
            return (
              <Pressable
                key={mode.key}
                onPress={() => handleSelect(mode.key)}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                accessibilityLabel={`${n} dakika ${rest} mola modu`}
                style={({ pressed }) => [
                  s.pill,
                  {
                    backgroundColor: active ? C.elev : "transparent",
                    borderColor: active ? C.border : "transparent",
                    transform: [{ scale: pressed ? 0.96 : 1 }],
                  },
                ]}
              >
                <Text
                  style={[
                    TYPOGRAPHY.topicName,
                    {
                      color: active ? C.text : C.text3,
                      fontSize: 17,
                      lineHeight: 19,
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
                    {
                      color: active ? C.text2 : C.text4,
                      fontSize: 10.5,
                      letterSpacing: 0.6,
                      marginTop: 1,
                    },
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
              borderColor: C.line,
              backgroundColor: pressed ? C.elev : C.surface,
              transform: [{ scale: pressed ? 0.94 : 1 }],
            },
          ]}
        >
          <Icon name="edit" size={15} color={C.text3} />
        </Pressable>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: { paddingHorizontal: GUTTER, marginTop: STEP.s2 },
  row: { flexDirection: "row", alignItems: "center", gap: STEP.s1 },
  pillsBox: {
    flex: 1,
    flexDirection: "row",
    gap: 3,
    padding: 3,
    borderRadius: 14,
    borderWidth: 1,
  },
  pill: {
    flex: 1,
    height: 44,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  editButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});

