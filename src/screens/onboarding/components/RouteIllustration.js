import { View } from "react-native";
import Svg, { Path, Circle } from "react-native-svg";
import { useC } from "../../../contexts/ThemeContext";

// Karşılama ekranındaki rota önizlemesi — tamamlanmış + planlanmış segment.
export function RouteIllustration() {
  const C = useC();
  return (
    <View style={{ marginTop: STEP_TOP }}>
      <Svg viewBox="0 0 390 190" style={{ width: "100%", aspectRatio: 390 / 190 }}>
        <Path
          d="M 26 160 C 96 152 130 128 176 108 C 238 82 300 58 364 40"
          fill="none"
          stroke={C.track}
          strokeWidth={2}
          strokeLinecap="round"
          strokeDasharray="2 8"
        />
        <Path
          d="M 26 160 C 96 152 130 128 176 108"
          fill="none"
          stroke={C.accent}
          strokeWidth={4.5}
          strokeLinecap="round"
        />
        <Circle cx={26} cy={160} r={4.4} fill={C.bg} stroke={C.accent} strokeWidth={2.4} />
        <Circle cx={101} cy={139} r={4.4} fill={C.bg} stroke={C.accent} strokeWidth={2.4} />
        <Circle cx={176} cy={108} r={8} fill={C.accent} />
        <Circle cx={364} cy={40} r={6.5} fill={C.bg} stroke={C.projNode} strokeWidth={2.4} />
      </Svg>
    </View>
  );
}

const STEP_TOP = 36;
