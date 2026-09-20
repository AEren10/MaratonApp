import { View, Text, StyleSheet } from "react-native";
import Svg, { Path, Circle } from "react-native-svg";

import { useC } from "../../../../contexts/ThemeContext";
import { STEP, TYPOGRAPHY } from "../../../../themes/tokens";

// Ilk Gun: henuz YURUNMEMIS rota. Hat kesikli kalir -- tamamlanmis durak yok,
// dolu bir cizgi olmayan bir ilerlemeyi ima ederdi. Ama iki UCU biliyoruz:
// kullanici baslangic ve hedef netini kurulumda kendi girdi. Eskiden
// "BURADASIN" dugumu sayisiz duruyordu, yani uygulama kullanicinin nerede
// oldugunu biliyor ama soylemiyordu.
export function FirstDayRouteLine({ declared }) {
  const C = useC();

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
      <View style={s.here}>
        {declared?.startLabel ? (
          <Text style={[TYPOGRAPHY.tableValue, { color: C.text }]}>{declared.startLabel}</Text>
        ) : null}
        <Text style={[TYPOGRAPHY.label, s.cap, { color: C.accentBright }]}>BURADASIN</Text>
      </View>

      {declared?.goalLabel ? (
        <View style={s.target}>
          <Text style={[TYPOGRAPHY.tableValue, s.right, { color: C.text }]}>{declared.goalLabel}</Text>
          <Text style={[TYPOGRAPHY.label, [s.cap, s.right], { color: C.text3 }]}>HEDEFİN</Text>
        </View>
      ) : null}
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { marginTop: STEP.s3 + 2 },
  svg: { width: "100%", aspectRatio: 390 / 168 },
  here: { position: "absolute", left: "7%", top: "82%" },
  target: { position: "absolute", right: "6%", top: "2%", alignItems: "flex-end" },
  cap: { fontFamily: TYPOGRAPHY.button.fontFamily, fontSize: TYPOGRAPHY.tableHead.fontSize },
  right: { textAlign: "right" },
});
