import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Animated, { FadeInUp, FadeOutUp } from "react-native-reanimated";

import { Icon } from "../../../components/design/Icon";
import { useC } from "../../../contexts/ThemeContext";
import { SHAPE, STEP, TYPOGRAPHY } from "../../../themes/tokens";

export function HomeStopToast({ visible }) {
  const C = useC();

  if (!visible) return null;

  return (
    <Animated.View
      entering={FadeInUp.duration(240).springify()}
      exiting={FadeOutUp.duration(200)}
      style={s.container}
      pointerEvents="none"
    >
      <View style={[s.pill, { backgroundColor: C.elev, borderColor: C.up }]}>
        <View style={[s.iconBox, { backgroundColor: C.up }]}>
          <Icon name="check" size={11} color={C.bg} sw={3} />
        </View>
        <Text style={[TYPOGRAPHY.label, s.text, { color: C.text }]}>Durak tamamlandı</Text>
      </View>
    </Animated.View>
  );
}

const s = StyleSheet.create({
  container: {
    position: "absolute",
    top: -STEP.s2,
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 100,
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: STEP.s1,
    paddingVertical: STEP.s1 - 2,
    paddingHorizontal: STEP.s2 + 4,
    borderRadius: SHAPE.pill,
    borderWidth: 1,
    elevation: 6,
  },
  iconBox: {
    width: 18,
    height: 18,
    borderRadius: SHAPE.pill,
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    letterSpacing: 0,
    textTransform: "none",
  },
});
