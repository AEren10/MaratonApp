import { useEffect } from "react";
import { View } from "react-native";
import Svg, { Circle, Defs, RadialGradient, Stop } from "react-native-svg";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from "react-native-reanimated";

export function TimerRing({
  size = 276,
  stroke = 7,
  pct = 0,
  color,
  secondary,
  cycleIndex = 0,
  totalCycles = 4,
  showDashes = true,
  running = false,
  children,
  C,
}) {
  const radius = (size - stroke - 18) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - Math.min(Math.max(pct, 0), 1));
  const activeColor = color || C.accent;

  const auraScale = useSharedValue(1);
  const auraOpacity = useSharedValue(0.7);

  useEffect(() => {
    if (running) {
      auraScale.value = withRepeat(
        withSequence(
          withTiming(1.06, { duration: 2600, easing: Easing.inOut(Easing.sin) }),
          withTiming(1.0, { duration: 2600, easing: Easing.inOut(Easing.sin) })
        ),
        -1,
        true
      );
      auraOpacity.value = withRepeat(
        withSequence(
          withTiming(1.0, { duration: 2600, easing: Easing.inOut(Easing.sin) }),
          withTiming(0.65, { duration: 2600, easing: Easing.inOut(Easing.sin) })
        ),
        -1,
        true
      );
    } else {
      auraScale.value = withTiming(1, { duration: 400 });
      auraOpacity.value = withTiming(0.7, { duration: 400 });
    }
  }, [running, auraScale, auraOpacity]);

  const auraAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: auraScale.value }],
    opacity: auraOpacity.value,
  }));

  return (
    <View style={{ width: size, height: size + 36, alignItems: "center", justifyContent: "center" }}>
      {/* Ambient Breathing Aura */}
      <Animated.View
        style={[
          { position: "absolute", width: size, height: size, alignItems: "center", justifyContent: "center" },
          auraAnimStyle,
        ]}
      >
        <Svg width={size} height={size}>
          <Defs>
            <RadialGradient id="ringAura" cx="50%" cy="50%" rx="50%" ry="50%">
              <Stop offset="0%" stopColor={activeColor} stopOpacity="0.22" />
              <Stop offset="55%" stopColor={activeColor} stopOpacity="0.08" />
              <Stop offset="100%" stopColor={activeColor} stopOpacity="0" />
            </RadialGradient>
          </Defs>
          <Circle cx={size / 2} cy={size / 2} r={size / 2 - 2} fill="url(#ringAura)" />
        </Svg>
      </Animated.View>

      <Svg width={size} height={size} style={{ position: "absolute", top: 0 }}>
        {/* Precision Outer Hairline Track */}
        <Circle cx={size / 2} cy={size / 2} r={radius + stroke + 5} stroke={C.line} strokeWidth={1} strokeDasharray="2 6" fill="none" opacity={0.5} />
        {/* Pasif Arka Plan Halkası */}
        <Circle cx={size / 2} cy={size / 2} r={radius} stroke={secondary || C.track} strokeWidth={stroke} fill="none" opacity={0.7} />
        {/* Aktif İlerleme Halkası */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={activeColor}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>

      <View style={{ alignItems: "center", justifyContent: "center", marginTop: -12 }}>
        {children}
      </View>

      {/* Seans Göstergeleri */}
      {showDashes && (
        <View style={{ position: "absolute", bottom: 2, flexDirection: "row", gap: 7, alignItems: "center" }}>
          {Array.from({ length: totalCycles }).map((_, i) => {
            const filled = i < cycleIndex;
            const current = i === cycleIndex;
            return (
              <View
                key={i}
                style={{
                  width: current ? 26 : 20,
                  height: 4,
                  borderRadius: 2,
                  backgroundColor: filled || current ? activeColor : C.track,
                  opacity: current ? 1 : filled ? 0.75 : 0.4,
                  borderWidth: current ? 0.5 : 0,
                  borderColor: activeColor,
                }}
              />
            );
          })}
        </View>
      )}
    </View>
  );
}


