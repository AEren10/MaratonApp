import { useEffect } from "react";
import { View } from "react-native";
import Svg, { Path, Circle } from "react-native-svg";
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withDelay,
  withTiming,
  withSpring,
  useReducedMotion,
  Easing,
} from "react-native-reanimated";
import { useC } from "../../../contexts/ThemeContext";

const AnimatedPath = Animated.createAnimatedComponent(Path);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const PATH_LENGTH = 200;
const STEP_TOP = 36;

// Karşılama ekranındaki rota önizlemesi — tamamlanmış + planlanmış segment.
// İlk 5 saniyelik "rotanı çiziyoruz" vaadini canlı tutmak için hat akıcı çizilir,
// aktif düğüm hafif bir yayla yerine oturur.
export function RouteIllustration() {
  const C = useC();
  const reduced = useReducedMotion();
  const drawProgress = useSharedValue(reduced ? 1 : 0);
  const activeNodeR = useSharedValue(reduced ? 8 : 4);

  useEffect(() => {
    if (reduced) return;
    drawProgress.value = withDelay(
      150,
      withTiming(1, { duration: 750, easing: Easing.bezier(0.16, 1, 0.3, 1) }, (finished) => {
        if (finished) {
          activeNodeR.value = withSpring(8, { damping: 14, stiffness: 280 });
        }
      })
    );
  }, [drawProgress, activeNodeR, reduced]);

  const animatedPathProps = useAnimatedProps(() => ({
    strokeDashoffset: PATH_LENGTH * (1 - drawProgress.value),
  }));

  const activeCircleProps = useAnimatedProps(() => ({
    r: activeNodeR.value,
  }));

  return (
    <View style={{ marginTop: STEP_TOP }} accessible accessibilityLabel="Rota önizleme illüstrasyonu">
      <Svg viewBox="0 0 390 190" style={{ width: "100%", aspectRatio: 390 / 190 }}>
        {/* Planlanan kesikli arka rota */}
        <Path
          d="M 26 160 C 96 152 130 128 176 108 C 238 82 300 58 364 40"
          fill="none"
          stroke={C.track}
          strokeWidth={2}
          strokeLinecap="round"
          strokeDasharray="2 8"
        />
        {/* Canlı çizilen tamamlanmış rota çizgisi */}
        <AnimatedPath
          d="M 26 160 C 96 152 130 128 176 108"
          fill="none"
          stroke={C.accent}
          strokeWidth={4.5}
          strokeLinecap="round"
          strokeDasharray={PATH_LENGTH}
          animatedProps={animatedPathProps}
        />
        {/* Geçilen durak düğümleri */}
        <Circle cx={26} cy={160} r={4.4} fill={C.bg} stroke={C.accent} strokeWidth={2.4} />
        <Circle cx={101} cy={139} r={4.4} fill={C.bg} stroke={C.accent} strokeWidth={2.4} />
        {/* Aktif / hedeflenen durak düğümü */}
        <AnimatedCircle cx={176} cy={108} fill={C.accent} animatedProps={activeCircleProps} />
        {/* Gelecek hedef halkası */}
        <Circle cx={364} cy={40} r={6.5} fill={C.bg} stroke={C.projNode} strokeWidth={2.4} />
      </Svg>
    </View>
  );
}
