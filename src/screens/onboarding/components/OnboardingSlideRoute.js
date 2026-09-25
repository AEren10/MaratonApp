import { useEffect } from "react";
import { View, StyleSheet } from "react-native";
import Svg, { Path, Circle, Defs, LinearGradient, Stop } from "react-native-svg";
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withDelay,
  withTiming,
  withRepeat,
  useReducedMotion,
  Easing,
} from "react-native-reanimated";
import { SHAPE, STEP } from "../../../themes/tokens";

const AnimatedPath = Animated.createAnimatedComponent(Path);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const PATH_LEN = 320;

export function OnboardingSlideRoute({ C }) {
  const reduced = useReducedMotion();
  const draw = useSharedValue(reduced ? 1 : 0);
  const pulse = useSharedValue(reduced ? 1 : 0);

  useEffect(() => {
    if (reduced) return;
    draw.value = withDelay(
      100,
      withTiming(1, { duration: 900, easing: Easing.bezier(0.16, 1, 0.3, 1) })
    );
    pulse.value = withRepeat(
      withTiming(1, { duration: 1800, easing: Easing.out(Easing.ease) }),
      -1,
      false
    );
  }, [draw, pulse, reduced]);

  const pathProps = useAnimatedProps(() => ({
    strokeDashoffset: PATH_LEN * (1 - draw.value),
  }));

  const haloProps = useAnimatedProps(() => ({
    r: 10 + pulse.value * 16,
    opacity: (1 - pulse.value) * 0.7,
  }));

  return (
    <View style={[s.card, { backgroundColor: C.surface, borderColor: C.border }]}>
      <Svg viewBox="0 0 340 180" style={s.svg}>
        <Defs>
          <LinearGradient id="routeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <Stop offset="0%" stopColor={C.accent} stopOpacity={0.6} />
            <Stop offset="100%" stopColor={C.accentBright} stopOpacity={1} />
          </LinearGradient>
        </Defs>

        {/* Arka plan referans rotası */}
        <Path
          d="M 24 140 C 90 135 120 115 170 85 C 225 52 270 50 316 35"
          fill="none"
          stroke={C.track}
          strokeWidth={3}
          strokeLinecap="round"
          strokeDasharray="4 8"
        />

        {/* Aktif canlı rota çizgisi */}
        <AnimatedPath
          d="M 24 140 C 90 135 120 115 170 85"
          fill="none"
          stroke="url(#routeGrad)"
          strokeWidth={4.5}
          strokeLinecap="round"
          strokeDasharray={PATH_LEN}
          animatedProps={pathProps}
        />

        {/* Geçmiş duraklar */}
        <Circle cx={24} cy={140} r={5} fill={C.bg} stroke={C.accent} strokeWidth={2.5} />
        <Circle cx={95} cy={124} r={5} fill={C.bg} stroke={C.accent} strokeWidth={2.5} />

        {/* Aktif durak ve nabız halkası */}
        <AnimatedCircle cx={170} cy={85} fill={C.accent} animatedProps={haloProps} />
        <Circle cx={170} cy={85} r={8} fill={C.accentBright} />
        <Circle cx={170} cy={85} r={3.5} fill={C.accentInk || "#FFF"} />

        {/* Gelecek hedefler */}
        <Circle cx={245} cy={58} r={5} fill={C.bg} stroke={C.border} strokeWidth={2} />
        <Circle cx={316} cy={35} r={7.5} fill={C.bg} stroke={C.accentBright} strokeWidth={2.5} />
        <Circle cx={316} cy={35} r={3} fill={C.accentBright} />
      </Svg>
    </View>
  );
}

const s = StyleSheet.create({
  card: {
    width: "100%",
    borderRadius: SHAPE.card,
    borderWidth: 1,
    paddingVertical: STEP.s2,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  svg: {
    width: "100%",
    aspectRatio: 340 / 180,
  },
});
