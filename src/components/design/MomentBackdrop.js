import { memo, useMemo } from "react";
import { StyleSheet, View, useWindowDimensions } from "react-native";
import Svg, { Defs, G, LinearGradient, Mask, Path, RadialGradient, Rect, Stop } from "react-native-svg";

import { useC } from "../../contexts/ThemeContext";

// "An" ekranlarinin zemini (acilis, kayit, Rota Hazir, hedef/deneme anlari,
// hikaye karti): ust koseden yayilan seyrek, ince kizil isik cizgileri ve
// silik bir isilti; asagi dogru zemine soner. Marka sayfasindaki "gorsel dil"
// dokusunun seyrek hali. GUNLUK ekranlarda YOK -- metin kontrasti ve tek
// vurgu rengi kurali (liste/grafik arkasinda doku olmaz). Duragan.
const LINES = 14;

// Cizgiler ust koseden yelpaze gibi acilir; her besinciden biri daha parlak
// ve kalin (isik huzmesi). flip: sag kose.
function linePaths(w, h, flip) {
  const out = [];
  const X = (x) => (flip ? w - x : x);
  for (let i = 0; i < LINES; i += 1) {
    const t = i / (LINES - 1);
    const y0 = -h * 0.12 + t * h * 0.55;
    const y1 = h * 0.02 + Math.pow(t, 1.3) * h * 1.05;
    const c1 = y0 - h * 0.18 + t * h * 0.1;
    const c2 = y1 + h * 0.12;
    const hot = i % 5 === 2;
    out.push({
      d: `M ${X(-w * 0.15)} ${y0} C ${X(w * 0.35)} ${c1}, ${X(w * 0.65)} ${c2}, ${X(w * 1.15)} ${y1}`,
      o: (hot ? 0.95 : 0.42) * (1 - t * 0.55),
      sw: hot ? 1.4 : 0.8,
    });
  }
  return out;
}

export const MomentBackdrop = memo(function MomentBackdrop({ height, flip = false, style }) {
  const C = useC();
  const { width, height: screenH } = useWindowDimensions();
  const h = height || Math.round(screenH * 0.62);
  const light = C.scheme === "light";
  const k = light ? 0.55 : 1;
  const paths = useMemo(() => linePaths(width, h, flip), [width, h, flip]);

  return (
    <View pointerEvents="none" style={[s.wrap, { height: h }, style]}>
      <Svg width={width} height={h}>
        <Defs>
          <RadialGradient id="mbGlow" cx={flip ? width : 0} cy={0} r={width * 1.1} gradientUnits="userSpaceOnUse">
            <Stop offset="0" stopColor={C.accent} stopOpacity={0.42 * k} />
            <Stop offset="0.55" stopColor={C.accent} stopOpacity={0.12 * k} />
            <Stop offset="1" stopColor={C.accent} stopOpacity={0} />
          </RadialGradient>
          <LinearGradient id="mbLine" x1={flip ? "1" : "0"} y1="0" x2={flip ? "0" : "1"} y2="0">
            <Stop offset="0" stopColor={C.accentBright} stopOpacity={0} />
            <Stop offset="0.35" stopColor={C.accentBright} stopOpacity={0.9} />
            <Stop offset="1" stopColor={C.accent} stopOpacity={0} />
          </LinearGradient>
          <LinearGradient id="mbFade" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#fff" stopOpacity={1} />
            <Stop offset="0.6" stopColor="#fff" stopOpacity={0.7} />
            <Stop offset="1" stopColor="#fff" stopOpacity={0} />
          </LinearGradient>
          <Mask id="mbMask" x={0} y={0} width={width} height={h} maskUnits="userSpaceOnUse">
            <Rect x={0} y={0} width={width} height={h} fill="url(#mbFade)" />
          </Mask>
        </Defs>
        <G mask="url(#mbMask)">
          <Rect x={0} y={0} width={width} height={h} fill="url(#mbGlow)" />
          {paths.map((p) => (
            <Path key={p.d} d={p.d} fill="none" stroke="url(#mbLine)" strokeWidth={p.sw} strokeOpacity={p.o * k} />
          ))}
        </G>
      </Svg>
    </View>
  );
});

const s = StyleSheet.create({
  wrap: { position: "absolute", top: 0, left: 0, right: 0 },
});
