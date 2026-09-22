import { View } from "react-native";
import Svg, { Circle, Defs, RadialGradient, Stop } from "react-native-svg";

export function TimerRing({
  size = 272,
  stroke = 8,
  pct = 0,
  color,
  secondary,
  cycleIndex = 0,
  totalCycles = 4,
  showDashes = true,
  children,
  C,
}) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - Math.min(Math.max(pct, 0), 1));
  const activeColor = color || C.accent;

  return (
    <View style={{ width: size, height: size + 28, alignItems: "center", justifyContent: "center" }}>
      <Svg width={size} height={size} style={{ position: "absolute", top: 0 }}>
        <Defs>
          <RadialGradient id="ringAura" cx="50%" cy="50%" rx="50%" ry="50%">
            <Stop offset="0%" stopColor={activeColor} stopOpacity="0.14" />
            <Stop offset="65%" stopColor={activeColor} stopOpacity="0.04" />
            <Stop offset="100%" stopColor={activeColor} stopOpacity="0" />
          </RadialGradient>
        </Defs>

        {/* Yumuşak atmosferik odak ışığı (Ambient Aura) */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius + stroke * 1.5}
          fill="url(#ringAura)"
        />

        {/* Pasif Arka Plan Halkası */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={secondary || C.track}
          strokeWidth={stroke}
          fill="none"
        />

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

      <View style={{ alignItems: "center", justifyContent: "center", marginTop: -14 }}>
        {children}
      </View>

      {showDashes && (
        <View style={{ position: "absolute", bottom: 4, flexDirection: "row", gap: 6 }}>
          {Array.from({ length: totalCycles }).map((_, i) => {
            const filled = i < cycleIndex;
            const current = i === cycleIndex;
            return (
              <View
                key={i}
                style={{
                  width: 24,
                  height: 4,
                  borderRadius: 2,
                  backgroundColor: filled ? activeColor : current ? activeColor : C.track,
                  opacity: current ? 0.5 : filled ? 1 : 1,
                }}
              />
            );
          })}
        </View>
      )}
    </View>
  );
}
