import { StyleSheet, Text, View } from "react-native";
import Svg, { Circle, Line, Path } from "react-native-svg";

import { useC } from "../../contexts/ThemeContext";
import { STEP, TYPOGRAPHY } from "../../themes/tokens";

const W = 390;
const H = 150;

// Olculmus tahmin yokken Rota grafigi. Hat henuz cizilmedi ama iki ucu
// biliyoruz: kullanici kurulumda baslangic ve hedef netini kendi girdi.
// `declared` gelirse o sayilar yazilir -- UYDURMA DEGIL, kullanicinin kendi
// beyani. Gelmezse eski davranis: "HENÜZ TAHMİN YOK".
export function RouteEmptyChart({ examDateTag, declared, emptyLabel = "HENÜZ TAHMİN YOK" }) {
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
      <View style={s.today}>
        {declared?.startLabel ? (
          <Text style={[TYPOGRAPHY.tableValue, { color: C.text }]}>{declared.startLabel}</Text>
        ) : null}
        <Text style={[TYPOGRAPHY.tableHead, { color: C.accentBright }]}>BUGÜN</Text>
      </View>

      <View style={s.goal}>
        {declared?.goalLabel ? (
          <Text style={[TYPOGRAPHY.tableValue, s.right, { color: C.text }]}>{declared.goalLabel}</Text>
        ) : null}
        <Text style={[TYPOGRAPHY.tableHead, s.right, { color: declared?.goalLabel ? C.text2 : C.text4 }]}>
          {declared?.goalLabel ? "HEDEFİN" : emptyLabel}
        </Text>
      </View>

      {examDateTag ? (
        <Text style={[TYPOGRAPHY.tableHead, s.exam, { color: C.text2 }]}>{examDateTag}</Text>
      ) : null}
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { width: "100%", aspectRatio: W / H, position: "relative" },
  today: { position: "absolute", left: "10%", bottom: STEP.s1 },
  goal: { position: "absolute", right: "6%", bottom: STEP.s1, alignItems: "flex-end" },
  right: { textAlign: "right" },
  exam: { position: "absolute", right: "6%", top: "4%" },
});
