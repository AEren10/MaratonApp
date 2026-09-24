import React, { useMemo } from "react";
import Svg, { Line, Path, Circle, Defs, LinearGradient, Stop, Text as SvgText } from "react-native-svg";

const W = 390;
const H = 170;
const PAD_L = 42;
const PAD_R = 22;
const PAD_T = 16;
const PAD_B = 30;

export const HeroTrendChartSvg = React.memo(function HeroTrendChartSvg({ C, data = [], labels }) {
  if (!data || data.length < 2) return null;

  const { points, gridY, linePath, areaPath } = useMemo(() => {
    const rawMin = Math.min(...data);
    const rawMax = Math.max(...data);
    const min = Math.max(0, Math.floor(rawMin - 3));
    const max = Math.ceil(rawMax + 3);
    const range = max - min || 1;
    const innerW = W - PAD_L - PAD_R;
    const innerH = H - PAD_T - PAD_B;
    const stepX = innerW / (data.length - 1);

    const pts = data.map((v, i) => ({
      cx: PAD_L + i * stepX,
      cy: PAD_T + (1 - (v - min) / range) * innerH,
    }));

    const grids = [];
    for (let i = 0; i < 4; i++) {
      grids.push({
        y: PAD_T + (i / 3) * innerH,
        val: Math.round(max - (i / 3) * range),
      });
    }

    let lp = `M ${pts[0].cx} ${pts[0].cy}`;
    for (let i = 1; i < pts.length; i++) {
      const prev = pts[i - 1];
      const curr = pts[i];
      const midX = (prev.cx + curr.cx) / 2;
      lp += ` C ${midX} ${prev.cy}, ${midX} ${curr.cy}, ${curr.cx} ${curr.cy}`;
    }

    const ap = `${lp} L ${pts[pts.length - 1].cx} ${H - PAD_B} L ${pts[0].cx} ${H - PAD_B} Z`;
    return { points: pts, gridY: grids, linePath: lp, areaPath: ap };
  }, [data]);

  return (
    <Svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "100%" }}>
      <Defs>
        <LinearGradient id="heroGrad" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={C.accent} stopOpacity="0.22" />
          <Stop offset="1" stopColor={C.accent} stopOpacity="0" />
        </LinearGradient>
      </Defs>

      {gridY.map((g, idx) => (
        <React.Fragment key={idx}>
          <Line x1={PAD_L} y1={g.y} x2={W - PAD_R} y2={g.y} stroke={C.line} strokeWidth={1} />
          <SvgText x={PAD_L - 8} y={g.y + 3.5} fill={C.text3} fontSize={10.5} fontFamily="Archivo_500" textAnchor="end">
            {g.val}
          </SvgText>
        </React.Fragment>
      ))}

      <Path d={areaPath} fill="url(#heroGrad)" />
      <Path d={linePath} fill="none" stroke={C.accent} strokeWidth={3.4} strokeLinecap="round" strokeLinejoin="round" />

      {points.map((p, idx) => (
        <Circle key={idx} cx={p.cx} cy={p.cy} r={3.8} fill={C.bg} stroke={C.accent} strokeWidth={2.4} />
      ))}

      {Array.isArray(labels) && labels[0] ? (
        <SvgText x={PAD_L} y={H - 8} fill={C.text4} fontSize={11} fontWeight="600" letterSpacing={1.2} fontFamily="Archivo_600">
          {String(labels[0]).toUpperCase()}
        </SvgText>
      ) : null}
      {Array.isArray(labels) && labels.length >= 3 && labels[1] ? (
        <SvgText x={W / 2} y={H - 8} fill={C.text4} fontSize={11} fontWeight="600" letterSpacing={1.2} fontFamily="Archivo_600" textAnchor="middle">
          {String(labels[1]).toUpperCase()}
        </SvgText>
      ) : null}
      {Array.isArray(labels) && labels.length >= 2 && labels[labels.length - 1] ? (
        <SvgText x={W - PAD_R} y={H - 8} fill={C.text4} fontSize={11} fontWeight="600" letterSpacing={1.2} fontFamily="Archivo_600" textAnchor="end">
          {String(labels[labels.length - 1]).toUpperCase()}
        </SvgText>
      ) : null}
    </Svg>
  );
});