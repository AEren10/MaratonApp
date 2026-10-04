import { memo, useMemo } from "react";
import { StyleSheet, View, useWindowDimensions } from "react-native";
import Svg, { Circle, Defs, G, LinearGradient, Mask, Path, Pattern, RadialGradient, Rect, Stop } from "react-native-svg";

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

// variant: "lines" (v1) isik huzmeleri | "dots" (v2) ince nokta izgarasi |
// "route" (v3) ustten gecen silik rota cizgisi ve duraklari.
// strength: 0-1 yogunluk (ana sayfada daha silik).
// v3: ekranin ustunden gecen tek rota (S egrisi) ve uzerindeki uc durak.
function routePath(w, h, flip) {
  const X = (x) => (flip ? w - x : x);
  return `M ${X(-w * 0.1)} ${h * 0.16} C ${X(w * 0.3)} ${h * 0.0}, ${X(w * 0.62)} ${h * 0.24}, ${X(w * 1.1)} ${h * 0.06}`;
}
function routeStops(w, h, flip) {
  // Bezier uzerinde t = .22 / .5 / .78 noktalari.
  const P = [[-w * 0.1, h * 0.16], [w * 0.3, h * 0.0], [w * 0.62, h * 0.24], [w * 1.1, h * 0.06]];
  return [0.22, 0.5, 0.78].map((t) => {
    const u = 1 - t;
    const a = u * u * u, b = 3 * u * u * t, c = 3 * u * t * t, d = t * t * t;
    const x = a * P[0][0] + b * P[1][0] + c * P[2][0] + d * P[3][0];
    return { x: flip ? w - x : x, y: a * P[0][1] + b * P[1][1] + c * P[2][1] + d * P[3][1] };
  });
}

export const MomentBackdrop = memo(function MomentBackdrop({ height, flip = false, style, variant = "lines", strength = 1 }) {
  const C = useC();
  const { width, height: screenH } = useWindowDimensions();
  const h = height || Math.round(screenH * 0.62);
  const light = C.scheme === "light";
  const k = (light ? 0.55 : 1) * strength;
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
          <Pattern id="mbDots" patternUnits="userSpaceOnUse" width={7} height={7}>
            <Circle cx={3.5} cy={3.5} r={0.85} fill={C.accentBright} />
          </Pattern>
          <RadialGradient id="mbDotFall" cx={flip ? width : 0} cy={0} r={width * 1.3} gradientUnits="userSpaceOnUse">
            <Stop offset="0" stopColor="#fff" stopOpacity={1} />
            <Stop offset="1" stopColor="#fff" stopOpacity={0.15} />
          </RadialGradient>
          <Mask id="mbDotMask" x={0} y={0} width={width} height={h} maskUnits="userSpaceOnUse">
            <Rect x={0} y={0} width={width} height={h} fill="url(#mbDotFall)" />
          </Mask>
        </Defs>
        <G mask="url(#mbMask)">
          <Rect x={0} y={0} width={width} height={h} fill="url(#mbGlow)" />
          {variant === "route" ? (
            <G>
              <Path d={routePath(width, h, flip)} fill="none" stroke={C.accent} strokeWidth={1.4} strokeOpacity={0.45 * k} strokeDasharray="1 6" strokeLinecap="round" />
              <Path d={routePath(width, h, flip)} fill="none" stroke={C.accent} strokeWidth={1.2} strokeOpacity={0.3 * k} />
              {routeStops(width, h, flip).map((p, i) => (
                <G key={i}>
                  <Circle cx={p.x} cy={p.y} r={7} fill={C.accent} opacity={0.12 * k} />
                  <Circle cx={p.x} cy={p.y} r={3} fill={i === 2 ? C.accent : C.bg} stroke={C.accent} strokeWidth={1.3} opacity={0.7 * k} />
                </G>
              ))}
            </G>
          ) : variant === "dots" ? (
            <G mask="url(#mbDotMask)">
              <Rect x={0} y={0} width={width} height={h} fill="url(#mbDots)" opacity={0.85 * k} />
            </G>
          ) : paths.map((p) => (
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
