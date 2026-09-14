import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Svg, { Path, Circle } from "react-native-svg";

import { useC } from "../../../contexts/ThemeContext";
import { TYPOGRAPHY } from "../../../themes/tokens";
import { PAYWALL_MOMENT as M } from "../../../constants/paywallMoment";

const VB_W = 390;
const VB_H = 176;
const X0 = 26;
const X1 = 364;
const Y_LOW = 150;
const Y_HIGH = 34;

// Paywall Ani'nin hatti: kullanicinin son netleri (uydurma egri yok).
// Son dugum "BUGUN". Tahmin ucu cizilmez; tahmin bu ekranda hesaplanmiyor.
export const PaywallMomentLine = React.memo(function PaywallMomentLine({ points }) {
  const C = useC();
  if (!points || points.length < 2) return null;

  const min = Math.min(...points);
  const max = Math.max(...points);
  const span = max - min;
  const step = (X1 - X0) / (points.length - 1);
  const xy = points.map((v, i) => [
    X0 + step * i,
    span ? Y_LOW - ((v - min) / span) * (Y_LOW - Y_HIGH) : (Y_LOW + Y_HIGH) / 2,
  ]);
  const d = xy.map(([x, y], i) => `${i ? "L" : "M"} ${x} ${y}`).join(" ");
  const [fx, fy] = xy[0];
  const [lx, ly] = xy[xy.length - 1];

  return (
    <View style={styles.wrap}>
      <Svg width="100%" height="100%" viewBox={`0 0 ${VB_W} ${VB_H}`}>
        <Path
          d={d}
          fill="none"
          stroke={C.accent}
          strokeWidth={4.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Circle cx={fx} cy={fy} r={4.4} fill={C.bg} stroke={C.accent} strokeWidth={2.4} />
        <Circle cx={lx} cy={ly} r={8} fill={C.accent} />
      </Svg>
      <Text style={[TYPOGRAPHY.label, styles.today, { color: C.accentBright, top: `${Math.min(86, (ly / VB_H) * 100 + 8)}%` }]}>
        {M.todayLabel}
      </Text>
    </View>
  );
});

const styles = StyleSheet.create({
  wrap: { width: "100%", aspectRatio: VB_W / VB_H },
  today: { position: "absolute", right: "4%" },
});
