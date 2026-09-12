import { useEffect } from "react";
import { View } from "react-native";
import Svg, { Line, Path, Circle, Text as SvgText } from "react-native-svg";
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  useReducedMotion,
  Easing,
} from "react-native-reanimated";
import { useC } from "../../../contexts/ThemeContext";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const W = 390;
const H = 132;
const ARC = "M 40 102 C 130 96 250 56 352 30";

// Rotanin kapanisi: hat tamamlanmis, son dugum BIR KEZ parlar.
// Eksen etiketleri yalnizca gercek deneme verisi varsa cizilir.
export function RouteArcLine({ startLabel, endLabel }) {
  const C = useC();
  const reduced = useReducedMotion();
  const pulse = useSharedValue(reduced ? 1 : 0);

  useEffect(() => {
    if (reduced) { pulse.value = 1; return; }
    pulse.value = 0;
    pulse.value = withTiming(1, { duration: 880, easing: Easing.out(Easing.cubic) });
  }, [pulse, reduced]);

  const haloProps = useAnimatedProps(() => ({
    r: 12 + 11 * pulse.value,
    fillOpacity: 0.26 * (1 - pulse.value),
  }));

  return (
    <View style={{ width: "100%", aspectRatio: W / H }} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <Svg width="100%" height="100%" viewBox={`0 0 ${W} ${H}`}>
        {[28, 64, 100].map((y) => (
          <Line key={y} x1={34} y1={y} x2={W - 24} y2={y} stroke={C.line} strokeWidth={1} />
        ))}
        <Path d={ARC} fill="none" stroke={C.accent} strokeWidth={2.6} strokeLinecap="round" />
        <AnimatedCircle cx={352} cy={30} fill={C.accent} animatedProps={haloProps} />
        <Circle cx={352} cy={30} r={7.5} fill={C.accent} />
        {startLabel ? (
          <SvgText x={40} y={122} fontFamily="Archivo_600" fontSize={11} fill={C.text4}>
            {startLabel}
          </SvgText>
        ) : null}
        {endLabel ? (
          <SvgText x={W - 24} y={122} textAnchor="end" fontFamily="Archivo_600" fontSize={11} fill={C.accent}>
            {endLabel}
          </SvgText>
        ) : null}
      </Svg>
    </View>
  );
}
