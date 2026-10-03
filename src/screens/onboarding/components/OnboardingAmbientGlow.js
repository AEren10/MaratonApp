import { StyleSheet, useWindowDimensions } from "react-native";
import Svg, { Defs, RadialGradient, Rect, Stop } from "react-native-svg";

// Filmin arkasindaki sicak isik. Duragan: ekrandaki iki hareket turu
// (ciz/buyu + belir) filme ayrildi, arka plan nefes almiyor.
export function OnboardingAmbientGlow({ C }) {
  const { width, height } = useWindowDimensions();
  const cx = width / 2;
  const cy = height * 0.62;

  return (
    <Svg pointerEvents="none" width={width} height={height} style={StyleSheet.absoluteFill}>
      <Defs>
        <RadialGradient id="ambientAura" cx={cx} cy={cy} r={width * 0.8} gradientUnits="userSpaceOnUse">
          <Stop offset="0%" stopColor={C.accent} stopOpacity={0.16} />
          <Stop offset="50%" stopColor={C.accent} stopOpacity={0.05} />
          <Stop offset="100%" stopColor={C.bg} stopOpacity={0} />
        </RadialGradient>
      </Defs>
      <Rect x={0} y={0} width={width} height={height} fill="url(#ambientAura)" />
    </Svg>
  );
}
