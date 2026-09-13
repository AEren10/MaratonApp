import { StyleSheet, Text, View } from "react-native";
import Svg, { Circle, Line, Path } from "react-native-svg";

import { useC } from "../../../contexts/ThemeContext";
import { STEP, TYPOGRAPHY } from "../../../themes/tokens";

const W = 390;
const H = 150;

// Boş Rota grafigi: hat henuz yok. Bugun dugumu, sinav gunune giden sonuk
// noktali yol ve "HENÜZ TAHMİN YOK". Deger cizmez — veri uydurmaz.
export function RouteEmptyChart({ examDateTag, emptyLabel = "HENÜZ TAHMİN YOK" }) {
  const C = useC();
  return (
    <View style={s.wrap} accessible accessibilityLabel={`Net grafiği: henüz veri yok. ${emptyLabel}`}>
      <Svg width="100%" height="100%" viewBox={`0 0 ${W} ${H}`}>
        {[30, 68, 106].map((y) => (
          <Line key={y} x1={34} y1={y} x2={366} y2={y} stroke={C.line} strokeWidth={1} />
        ))}
        <Path
          d="M 40 112 C 130 108 240 74 352 40"
          fill="none"
          stroke={C.track}
          strokeWidth={2.6}
          strokeLinecap="round"
          strokeDasharray="1.5 7"
        />
        <Circle cx={40} cy={112} r={9} fill={C.accent} fillOpacity={0.18} />
        <Circle cx={40} cy={112} r={7} fill={C.accent} />
        <Circle cx={352} cy={40} r={7.5} fill={C.bg} stroke={C.stop} strokeWidth={2.6} />
      </Svg>
      <Text style={[TYPOGRAPHY.tableHead, s.today, { color: C.accentBright }]}>BUGÜN</Text>
      <Text style={[TYPOGRAPHY.tableHead, s.none, { color: C.text4 }]}>{emptyLabel}</Text>
      {examDateTag ? (
        <Text style={[TYPOGRAPHY.tableHead, s.exam, { color: C.text2 }]}>{examDateTag}</Text>
      ) : null}
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { width: "100%", aspectRatio: W / H, position: "relative" },
  today: { position: "absolute", left: "10%", bottom: STEP.s1 },
  none: { position: "absolute", right: "6%", bottom: STEP.s1 },
  exam: { position: "absolute", right: "6%", top: "4%" },
});
