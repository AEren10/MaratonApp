import { View } from "react-native";
import Svg, { Circle } from "react-native-svg";

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

  return (
    <View style={{ width: size, height: size + 28, alignItems: "center", justifyContent: "center" }}>
      <Svg width={size} height={size} style={{ position: "absolute", top: 0 }}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={secondary || C.track}
          strokeWidth={stroke}
          fill="none"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color || C.accent}
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
                  width: 22,
                  height: 4,
                  borderRadius: 1,
                  backgroundColor: filled ? (color || C.accent) : current ? (color || C.accent) : C.track,
                  opacity: current ? 0.45 : filled ? 1 : 1,
                }}
              />
            );
          })}
        </View>
      )}
    </View>
  );
}
