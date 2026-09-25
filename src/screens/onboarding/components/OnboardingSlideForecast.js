import { useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import Svg, { Path, Circle, Defs, LinearGradient, Stop } from "react-native-svg";
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withDelay,
  withTiming,
  useReducedMotion,
  Easing,
} from "react-native-reanimated";
import { Icon } from "../../../components/design/Icon";
import { TYPOGRAPHY, STEP, SHAPE } from "../../../themes/tokens";

const AnimatedPath = Animated.createAnimatedComponent(Path);
const CURVE_LEN = 260;

export function OnboardingSlideForecast({ C }) {
  const reduced = useReducedMotion();
  const progress = useSharedValue(reduced ? 1 : 0);

  useEffect(() => {
    if (reduced) return;
    progress.value = withDelay(
      200,
      withTiming(1, { duration: 800, easing: Easing.bezier(0.16, 1, 0.3, 1) })
    );
  }, [progress, reduced]);

  const curveProps = useAnimatedProps(() => ({
    strokeDashoffset: CURVE_LEN * (1 - progress.value),
  }));

  return (
    <View style={[s.card, { backgroundColor: C.surface, borderColor: C.border }]}>
      {/* Net Rozetleri */}
      <View style={s.topMetrics}>
        <View style={[s.metricBox, { backgroundColor: C.bg, borderColor: C.line }]}>
          <Text style={[TYPOGRAPHY.micro, { color: C.text3 }]}>BAŞLANGIÇ</Text>
          <Text style={[TYPOGRAPHY.statMedium, { color: C.text }]}>54.0</Text>
        </View>

        <View style={s.arrowCol}>
          <Icon name="arrowR" size={16} color={C.text3} />
        </View>

        <View style={[s.metricBox, { backgroundColor: C.bg, borderColor: C.accent }]}>
          <Text style={[TYPOGRAPHY.micro, { color: C.accentBright }]}>HEDEF NET</Text>
          <Text style={[TYPOGRAPHY.statMedium, { color: C.accentBright }]}>96.0</Text>
        </View>
      </View>

      {/* Yükselen Eğri Grafiği */}
      <View style={s.chartBox}>
        <Svg viewBox="0 0 300 90" style={s.svg}>
          <Defs>
            <LinearGradient id="forecastGrad" x1="0%" y1="100%" x2="100%" y2="0%">
              <Stop offset="0%" stopColor={C.text4} stopOpacity={0.4} />
              <Stop offset="100%" stopColor={C.accent} stopOpacity={1} />
            </LinearGradient>
          </Defs>

          {/* Kılavuz zemin çizgisi */}
          <Path d="M 20 70 L 280 70" stroke={C.line} strokeWidth={1} strokeDasharray="3 5" />
          <Path d="M 20 20 L 280 20" stroke={C.line} strokeWidth={1} strokeDasharray="3 5" />

          {/* Dinamik rota projeksiyon eğrisi */}
          <AnimatedPath
            d="M 24 70 C 90 68 150 55 210 32 C 240 22 260 20 278 18"
            fill="none"
            stroke="url(#forecastGrad)"
            strokeWidth={3.5}
            strokeLinecap="round"
            strokeDasharray={CURVE_LEN}
            animatedProps={curveProps}
          />

          <Circle cx={24} cy={70} r={4.5} fill={C.bg} stroke={C.text3} strokeWidth={2} />
          <Circle cx={278} cy={18} r={6} fill={C.accentBright} />
          <Circle cx={278} cy={18} r={2.5} fill={C.accentInk || "#FFF"} />
        </Svg>
      </View>

      {/* Akıllı Yeniden Çizim Bildirimi */}
      <View style={[s.recalcRow, { backgroundColor: C.bg, borderColor: C.line }]}>
        <Icon name="compass" size={14} color={C.accent} />
        <Text style={[TYPOGRAPHY.micro, { color: C.text2, flex: 1 }]}>
          Her yeni denemeyle kalan yol ve konu ağırlıkları anında yeniden hesaplanır.
        </Text>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  card: {
    width: "100%",
    borderRadius: SHAPE.card,
    borderWidth: 1,
    padding: STEP.s3,
    gap: STEP.s2,
  },
  topMetrics: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  metricBox: {
    flex: 1,
    paddingVertical: STEP.s1,
    paddingHorizontal: STEP.s2,
    borderRadius: SHAPE.cardTight,
    borderWidth: 1,
    gap: 2,
  },
  arrowCol: {
    paddingHorizontal: STEP.s1,
    alignItems: "center",
    justifyContent: "center",
  },
  chartBox: {
    width: "100%",
    height: 90,
    justifyContent: "center",
  },
  svg: {
    width: "100%",
    height: 90,
  },
  recalcRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: STEP.s1,
    padding: STEP.s2,
    borderRadius: SHAPE.chip,
    borderWidth: 1,
  },
});
