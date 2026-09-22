import { useCallback } from "react";
import { Pressable, StyleSheet, View } from "react-native";

import { Icon } from "../../../components/design/Icon";
import { useC } from "../../../contexts/ThemeContext";
import { CONTROL, STEP } from "../../../themes/tokens";
import * as H from "../../../lib/haptics";

const RING_SIZE = 22;

export function HomeStopCheckRing({ done, isNext, onToggle, accessibilityLabel }) {
  const C = useC();

  const handlePress = useCallback(() => {
    if (done) {
      H.select();
      onToggle();
      return;
    }
    H.success();
    onToggle();
  }, [done, onToggle]);

  return (
    <Pressable
      onPress={handlePress}
      hitSlop={STEP.s2}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: done }}
      accessibilityLabel={accessibilityLabel}
      style={({ pressed }) => [s.area, { transform: [{ scale: pressed ? 0.92 : 1 }] }]}
    >
      <View
        style={[
          s.ring,
          {
            borderColor: done ? C.up : (isNext ? C.accent : C.border),
            backgroundColor: done ? C.up : "transparent",
            borderWidth: done ? 0 : (isNext ? 2 : 1.5),
          },
        ]}
      >
        {done ? <Icon name="check" size={11} color={C.bg} sw={2.4} /> : null}
      </View>
    </Pressable>
  );
}

const s = StyleSheet.create({
  area: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  ring: {
    width: RING_SIZE,
    height: RING_SIZE,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },
});
