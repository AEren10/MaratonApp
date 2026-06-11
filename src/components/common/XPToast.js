import { useEffect, useRef } from "react";
import { Text, View, Animated, StyleSheet } from "react-native";
import { C } from "../../themes/tokens";

export function XPToast({ amount, visible, onDone }) {
  const translateY = useRef(new Animated.Value(60)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.7)).current;

  useEffect(() => {
    if (!visible) return;

    translateY.setValue(60);
    opacity.setValue(0);
    scale.setValue(0.7);

    Animated.parallel([
      Animated.spring(translateY, { toValue: -20, damping: 12, stiffness: 200, useNativeDriver: true }),
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.delay(1500),
        Animated.timing(opacity, { toValue: 0, duration: 400, useNativeDriver: true }),
      ]),
      Animated.sequence([
        Animated.spring(scale, { toValue: 1.1, damping: 8, stiffness: 300, useNativeDriver: true }),
        Animated.spring(scale, { toValue: 1, damping: 14, useNativeDriver: true }),
      ]),
    ]).start();

    const timer = setTimeout(() => {
      onDone?.();
    }, 2200);
    return () => clearTimeout(timer);
  }, [visible]);

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        s.container,
        {
          transform: [{ translateY }, { scale }],
          opacity,
        },
      ]}
      pointerEvents="none"
    >
      <Text style={s.icon}>⚡</Text>
      <Text style={s.text}>+{amount} XP</Text>
    </Animated.View>
  );
}

const s = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 120,
    alignSelf: "center",
    backgroundColor: C.amber + "EE",
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    shadowColor: C.amber,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
    zIndex: 9999,
  },
  icon: { fontSize: 18 },
  text: {
    fontFamily: "SpaceGrotesk_700Bold",
    fontSize: 18,
    color: C.bg,
    letterSpacing: -0.3,
  },
});
