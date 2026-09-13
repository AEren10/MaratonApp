import { View, Text, StyleSheet } from "react-native";
import Svg, { Path, Circle } from "react-native-svg";

import { useC } from "../../../../contexts/ThemeContext";
import { STEP, TYPOGRAPHY } from "../../../../themes/tokens";

// Ilk Gun: henuz cizilmemis rota. Kesikli hat, baslangicta "BURADASIN"
// dugumu, sonda hedef halkasi. Hedef net yoksa etiket yazilmaz.
export function FirstDayRouteLine({ targetNet }) {
  const C = useC();
  const hasTarget = Number.isFinite(Number(targetNet)) && Number(targetNet) > 0;

  return (
    <View style={s.wrap} accessible accessibilityLabel="Rotanın ilk günü, buradasın">
      <Svg viewBox="0 0 390 168" style={s.svg}>
        <Path
          d="M 26 138 C 110 128 160 100 208 78 C 268 52 316 36 364 24"
          fill="none" stroke={C.track} strokeWidth={2} strokeLinecap="round" strokeDasharray="2 8"
        />
        <Circle cx={26} cy={138} r={13} fill={C.accent} fillOpacity={0.14} />
        <Circle cx={26} cy={138} r={7} fill={C.accent} />
        <Circle cx={364} cy={24} r={6.5} fill={C.bg} stroke={C.text5} strokeWidth={2.4} />
      </Svg>
      <Text style={[TYPOGRAPHY.label, s.here, { color: C.accentBright }]}>BURADASIN</Text>
      {hasTarget ? (
        <Text style={[TYPOGRAPHY.label, s.target, { color: C.text3 }]}>
          {`HEDEF ${Math.round(Number(targetNet))}`}
        </Text>
      ) : null}
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { marginTop: STEP.s3 + 2 },
  svg: { width: "100%", aspectRatio: 390 / 168 },
  here: { position: "absolute", left: "7%", top: "88%", fontFamily: TYPOGRAPHY.button.fontFamily, fontSize: TYPOGRAPHY.tableHead.fontSize },
  target: { position: "absolute", right: "6%", top: "5%", fontFamily: TYPOGRAPHY.button.fontFamily, fontSize: TYPOGRAPHY.tableHead.fontSize },
});
