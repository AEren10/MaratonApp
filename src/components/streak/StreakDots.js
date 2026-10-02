import { useEffect, useRef } from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, { useAnimatedStyle, useReducedMotion, useSharedValue, withSpring } from "react-native-reanimated";

import { useC } from "../../contexts/ThemeContext";
import { STEP, TYPOGRAPHY } from "../../themes/tokens";
import { Icon } from "../design/Icon";

const SETTLE = { duration: 600, dampingRatio: 0.6 };

// Haftanin yedi gunu. Bugun ilk kez tamamlaninca nokta "oturur": kucukten
// kendi boyuna yaylanir (imza an: durak tamamlandi, dugum oturur).
function Dot({ state, size, settle, flame }) {
  const C = useC();
  const reduced = useReducedMotion();
  const scale = useSharedValue(1);
  const prev = useRef(state);
  useEffect(() => {
    if (settle && prev.current === "today" && state === "done" && !reduced) {
      scale.set(0.35);
      scale.set(withSpring(1, SETTLE));
    }
    prev.current = state;
  }, [state, settle, reduced, scale]);
  const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.get() }] }));
  const look = state === "done"
    ? { backgroundColor: C.accent }
    : state === "today"
      ? { borderWidth: 1.5, borderColor: C.accent }
      : state === "missed"
        ? { backgroundColor: C.track }
        : { borderWidth: 1, borderColor: C.text5 };
  return (
    <Animated.View style={[{ width: size, height: size, borderRadius: size / 2, alignItems: "center", justifyContent: "center" }, look, style]}>
      {flame && state === "done" ? <Icon name="flame" size={Math.round(size * 0.58)} color={C.accentInk} fill={C.accentInk} /> : null}
    </Animated.View>
  );
}

// flame: dolu gunun icinde kucuk alev (seri panelinde buyuk noktalar icin).
export function StreakDots({ days = [], size = 10, settle = false, labels = true, flame = false }) {
  const C = useC();
  return (
    <View style={s.row} accessible accessibilityLabel={`Bu hafta ${days.filter((d) => d.state === "done").length} gün çalıştın`}>
      {days.map((d) => (
        <View key={d.key} style={s.col}>
          {labels ? (
            <Text style={[TYPOGRAPHY.micro, { color: d.state === "today" ? C.accentText : C.text3 }]}>{d.label}</Text>
          ) : null}
          <Dot state={d.state} size={size} settle={settle} flame={flame} />
        </View>
      ))}
    </View>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: "row", justifyContent: "space-between", flex: 1 },
  col: { alignItems: "center", gap: STEP.s1 },
});
