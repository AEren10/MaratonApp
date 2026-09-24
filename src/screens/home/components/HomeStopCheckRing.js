import { useCallback } from "react";
import { StyleSheet, View } from "react-native";

import { Icon } from "../../../components/design/Icon";
import { useC } from "../../../contexts/ThemeContext";
import { CONTROL, STEP } from "../../../themes/tokens";
import * as H from "../../../lib/haptics";
import { Press } from "../../../components/design/Press";

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
    <Press haptic="none" scaleTo={0.92}
      onPress={handlePress}
      hitSlop={STEP.s2}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: done }}
      accessibilityLabel={accessibilityLabel}
      style={[s.area]}
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
    </Press>
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
