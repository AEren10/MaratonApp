import { useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import Svg, { Circle, Path } from "react-native-svg";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  useReducedMotion,
  Easing,
} from "react-native-reanimated";
import { useC } from "../../contexts/ThemeContext";
import { TYPOGRAPHY, STEP } from "../../themes/tokens";

export function AppLaunchLoading() {
  const C = useC();
  const reduced = useReducedMotion();
  const pulse = useSharedValue(reduced ? 1 : 0);

  useEffect(() => {
    if (reduced) return;
    pulse.value = withRepeat(
      withTiming(1, { duration: 1500, easing: Easing.out(Easing.ease) }),
      -1,
      false
    );
  }, [pulse, reduced]);

  const haloStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 + pulse.value * 0.45 }],
    opacity: (1 - pulse.value) * 0.6,
  }));

  return (
    <View style={[s.fill, { backgroundColor: C.bg }]}>
      <View style={s.center}>
        <View style={s.iconWrap}>
          {/* Nefes alan nabız halkası */}
          <Animated.View
            style={[
              s.halo,
              { borderColor: C.accentBright || C.accent },
              haloStyle,
            ]}
          />

          {/* Logo Monogram */}
          <Svg width={64} height={64} viewBox="0 0 64 64" fill="none">
            <Circle cx={32} cy={32} r={30} fill={C.surface} stroke={C.border} strokeWidth={1.5} />
            {/* Rota M harfi / sembolü */}
            <Path
              d="M 20 42 L 20 22 L 32 34 L 44 22 L 44 42"
              stroke={C.accentBright || C.accent}
              strokeWidth={3.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        </View>

        <View style={s.textBlock}>
          <Text style={[TYPOGRAPHY.label, { color: C.text, letterSpacing: 3 }]}>
            MARATON
          </Text>
          <Text style={[TYPOGRAPHY.micro, { color: C.text3, marginTop: 4 }]}>
            Kişisel rotan hazırlanıyor...
          </Text>
        </View>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  fill: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  center: {
    alignItems: "center",
    justifyContent: "center",
    gap: STEP.s3,
  },
  iconWrap: {
    width: 72,
    height: 72,
    alignItems: "center",
    justifyContent: "center",
  },
  halo: {
    position: "absolute",
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
  },
  textBlock: {
    alignItems: "center",
  },
});
