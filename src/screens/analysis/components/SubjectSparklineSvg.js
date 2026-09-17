import React, { useMemo } from "react";
import Svg, { Path, Circle } from "react-native-svg";

const W = 300;
const H = 72;
const PAD_T = 10;
const PAD_B = 10;

export function SubjectSparklineSvg({ series, color }) {
  const { linePath, areaPath, lx, ly } = useMemo(() => {
    const raw = series?.length >= 2 ? series : [10, 15, 12, 18];
    const min = Math.min(...raw);
    const max = Math.max(...raw);
    const range = max - min || 1;
    const innerH = H - PAD_T - PAD_B;
    const stepX = W / (raw.length - 1);

    const pts = raw.map((v, i) => ({
      x: i * stepX,
      y: PAD_T + (1 - (v - min) / range) * innerH,
    }));

    let lp = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 1; i < pts.length; i++) {
      const prev = pts[i - 1];
      const curr = pts[i];
      const midX = (prev.x + curr.x) / 2;
      lp += ` C ${midX} ${prev.y}, ${midX} ${curr.y}, ${curr.x} ${curr.y}`;
    }

    const ap = `${lp} L ${pts[pts.length - 1].x} ${H} L 0 ${H} Z`;
    const last = pts[pts.length - 1];
    return { linePath: lp, areaPath: ap, lx: last.x, ly: last.y };
  }, [series]);

  return (
    <Svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", aspectRatio: 300 / 72, marginTop: 10 }}>
      <Path d={areaPath} fill={color} fillOpacity={0.12} />
      <Path d={linePath} fill="none" stroke={color} strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" />
      <Circle cx={lx} cy={ly} r={4.5} fill={color} />
    </Svg>
  );
}