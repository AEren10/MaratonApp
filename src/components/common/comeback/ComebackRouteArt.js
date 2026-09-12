import { useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import Svg, { Path, Circle } from "react-native-svg";
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  useReducedMotion,
  Easing,
} from "react-native-reanimated";
import { TYPOGRAPHY, STEP } from "../../../themes/tokens";
import { useC } from "../../../contexts/ThemeContext";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const W = 390;

// Geri donus hattinin iki hali:
//  prompt — kaldigin yer dolu, arada kopuk (text5), ilerisi projeksiyon
//  done   — donus duragi oturmus, dugum BIR KEZ parlar
export function ComebackRouteArt({ stage = "prompt", gapLabel }) {
  const C = useC();
  const reduced = useReducedMotion();
  const isDone = stage === "done";
  const H = isDone ? 130 : 150;
  const pulse = useSharedValue(reduced || !isDone ? 1 : 0);

  useEffect(() => {
    if (!isDone) return;
    if (reduced) { pulse.value = 1; return; }
    pulse.value = 0;
    pulse.value = withTiming(1, { duration: 880, easing: Easing.out(Easing.cubic) });
  }, [isDone, pulse, reduced]);

  const haloProps = useAnimatedProps(() => ({
    r: 8 + 20 * pulse.value,
    fillOpacity: 0.3 * (1 - pulse.value),
  }));

  return (
    <View>
      <View style={{ width: "100%", aspectRatio: W / H }} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
        <Svg width="100%" height="100%" viewBox={`0 0 ${W} ${H}`}>
          {isDone ? (
            <>
              <Path d="M 26 102 C 92 96 132 84 180 72" fill="none" stroke={C.accent} strokeWidth={4.5} strokeLinecap="round" />
              <Path d="M 180 72 C 244 56 302 42 364 30" fill="none" stroke={C.proj} strokeWidth={2.4} strokeLinecap="round" strokeDasharray="2 8" />
              <Circle cx={26} cy={102} r={4.4} fill={C.bg} stroke={C.accent} strokeWidth={2.4} />
              <AnimatedCircle cx={180} cy={72} fill={C.accent} animatedProps={haloProps} />
              <Circle cx={180} cy={72} r={8} fill={C.accent} />
              <Circle cx={364} cy={30} r={5.5} fill={C.bg} stroke={C.projNode} strokeWidth={2.4} />
            </>
          ) : (
            <>
              <Path d="M 26 118 C 90 110 126 96 172 84" fill="none" stroke={C.accent} strokeWidth={4.5} strokeLinecap="round" />
              <Path d="M 172 84 L 232 74" fill="none" stroke={C.text5} strokeWidth={3} strokeLinecap="round" strokeDasharray="4 6" />
              <Path d="M 232 74 C 288 58 330 44 364 32" fill="none" stroke={C.proj} strokeWidth={2.4} strokeLinecap="round" strokeDasharray="2 8" />
              <Circle cx={26} cy={118} r={4.4} fill={C.bg} stroke={C.accent} strokeWidth={2.4} />
              <Circle cx={172} cy={84} r={7} fill={C.accent} />
              <Circle cx={232} cy={74} r={5} fill={C.bg} stroke={C.text5} strokeWidth={2.2} />
              <Circle cx={364} cy={32} r={6.5} fill={C.bg} stroke={C.projNode} strokeWidth={2.4} />
            </>
          )}
        </Svg>
      </View>

      <View style={s.captions}>
        <Text style={[TYPOGRAPHY.tableHead, { color: C.accentBright }]}>
          {isDone ? "BUGÜN" : "KALDIĞIN YER"}
        </Text>
        {!isDone && gapLabel ? (
          <Text style={[TYPOGRAPHY.tableHead, { color: C.text3 }]}>{gapLabel}</Text>
        ) : null}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  captions: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: STEP.s4,

  },
});
