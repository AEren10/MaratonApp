import React, { useMemo } from "react";
import Svg, { Line, Path, Circle, Text as SvgText } from "react-native-svg";

const W = 390;
const H = 170;
const PAD_L = 42;
const PAD_R = 22;
const PAD_T = 16;
const PAD_B = 30;
const MONTHS = ["OCA", "ŞUB", "MAR", "NİS", "MAY", "HAZ", "TEM", "AĞU", "EYL", "EKİ", "KAS", "ARA"];

const dateLabel = (t) => {
  const d = new Date(t);
  return `${d.getDate()} ${MONTHS[d.getMonth()]}`;
};

function smoothPath(pts) {
  if (!pts.length) return "";
  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 1; i < pts.length; i++) {
    const midX = (pts[i - 1].x + pts[i].x) / 2;
    d += ` C ${midX} ${pts[i - 1].y}, ${midX} ${pts[i].y}, ${pts[i].x} ${pts[i].y}`;
  }
  return d;
}

// "Tumu" filtresinde TYT ve AYT ayni grafikte: x ekseni tarih, y ekseni net.
// series: [{ key, color, points: [{ t, v }] }]
export const HeroMultiTrendChartSvg = React.memo(function HeroMultiTrendChartSvg({ C, series = [] }) {
  const layout = useMemo(() => {
    const all = series.flatMap((s) => s.points);
    if (all.length < 2) return null;
    const tMin = Math.min(...all.map((p) => p.t));
    const tMax = Math.max(...all.map((p) => p.t));
    const vMin = Math.max(0, Math.floor(Math.min(...all.map((p) => p.v)) - 3));
    const vMax = Math.ceil(Math.max(...all.map((p) => p.v)) + 3);
    const innerW = W - PAD_L - PAD_R;
    const innerH = H - PAD_T - PAD_B;
    const yOf = (v) => PAD_T + (1 - (v - vMin) / (vMax - vMin || 1)) * innerH;
    const grid = [0, 1, 2, 3].map((i) => ({
      y: PAD_T + (i / 3) * innerH,
      val: Math.round(vMax - (i / 3) * (vMax - vMin)),
    }));
    const isSingleTime = tMax === tMin;
    const lines = series.map((s) => {
      const count = s.points.length;
      const pts = s.points.map((p, idx) => {
        const x = isSingleTime
          ? (count > 1 ? PAD_L + (idx / (count - 1)) * innerW : PAD_L + innerW / 2)
          : PAD_L + ((p.t - tMin) / (tMax - tMin)) * innerW;
        return { x, y: yOf(p.v) };
      });
      for (let i = 1; i < pts.length; i++) {
        if (pts[i].x <= pts[i - 1].x) {
          const minStep = Math.min(24, innerW / (count - 1 || 1));
          pts[i].x = Math.min(W - PAD_R, pts[i - 1].x + minStep);
        }
      }
      return { ...s, pts };
    });
    return { grid, lines, left: dateLabel(tMin), right: dateLabel(tMax) };
  }, [series]);

  if (!layout) return null;

  return (
    <Svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "100%" }}>
      {layout.grid.map((g) => (
        <React.Fragment key={g.y}>
          <Line x1={PAD_L} y1={g.y} x2={W - PAD_R} y2={g.y} stroke={C.line} strokeWidth={1} />
          <SvgText x={PAD_L - 8} y={g.y + 3.5} fill={C.text3} fontSize={11} fontFamily="Archivo_500" textAnchor="end">
            {g.val}
          </SvgText>
        </React.Fragment>
      ))}

      {layout.lines.map((line) => (
        <React.Fragment key={line.key}>
          {line.pts.length > 1 ? (
            <Path d={smoothPath(line.pts)} fill="none" stroke={line.color} strokeWidth={3}
              strokeLinecap="round" strokeLinejoin="round" />
          ) : null}
          {line.pts.map((p, idx) => {
            const isLast = idx === line.pts.length - 1;
            return (
              <Circle key={`${line.key}-${idx}`} cx={p.x} cy={p.y} r={isLast ? 4.5 : 3.6}
                fill={isLast ? line.color : C.bg} stroke={line.color} strokeWidth={2.2} />
            );
          })}
        </React.Fragment>
      ))}

      {layout.left === layout.right ? (
        <SvgText x={W / 2} y={H - 8} fill={C.text4} fontSize={11} fontWeight="600" letterSpacing={1.2}
          fontFamily="Archivo_600" textAnchor="middle">
          {layout.left}
        </SvgText>
      ) : (
        <>
          <SvgText x={PAD_L} y={H - 8} fill={C.text4} fontSize={11} fontWeight="600" letterSpacing={1.2} fontFamily="Archivo_600">
            {layout.left}
          </SvgText>
          <SvgText x={W - PAD_R} y={H - 8} fill={C.text4} fontSize={11} fontWeight="600" letterSpacing={1.2}
            fontFamily="Archivo_600" textAnchor="end">
            {layout.right}
          </SvgText>
        </>
      )}
    </Svg>
  );
});
