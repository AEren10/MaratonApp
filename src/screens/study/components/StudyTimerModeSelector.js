import { View, Text, Pressable } from "react-native";

import { Icon } from "../../../components/design";
import { TYPOGRAPHY } from "../../../themes/tokens";

export function StudyTimerModeSelector({ C, modeKey, modes, onChange, styles }) {
  return (
    <>
      <View style={[styles.modeContainer, { backgroundColor: C.surface, borderColor: C.border }]}>
        {modes.map((mode) => {
          const active = mode.key === modeKey;
          return (
            <Pressable
              key={mode.key}
              onPress={() => onChange(mode.key)}
              style={[
                styles.modeSegment,
                active && { backgroundColor: mode.color + "22", borderColor: mode.color + "44" },
                !active && { borderColor: "transparent" },
              ]}
            >
              <View style={[styles.modeIconWrap, { backgroundColor: active ? mode.color : C.surface2 }]}>
                <Icon name={mode.icon} size={14} color={active ? C.textOnFill : C.muted} />
              </View>
              <Text style={[styles.modeLabel, { color: active ? mode.color : C.muted }]}>
                {mode.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
      <Text style={[styles.modeDesc, { color: C.muted }]}>
        {modes.find((mode) => mode.key === modeKey)?.desc}
      </Text>
    </>
  );
}
