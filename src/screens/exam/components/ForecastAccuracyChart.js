import { memo } from "react";
import Svg, { Path, Circle, Text as SvgText } from "react-native-svg";
import { useC } from "../../../contexts/ThemeContext";

// 346x168 cizim. Bant icinde: tek gercek hat + ara deneme dugumleri, tahmin
// dugumu sakin "down" tonunda. Bant disinda: tahmin hatti kesik ve soluk,
// gercek hat kizil; bant da soluklasir. Geometri domain/exam'dan gelir.
const LABEL = { textAnchor: "end", fontFamily: "Archivo_700", fontSize: 11, letterSpacing: 1.2 };

export const ForecastAccuracyChart = memo(function ForecastAccuracyChart({ chart, view }) {
  const C = useC();
  if (!chart) return null;
  const inside = view.inRange !== false;
  const predTone = inside ? C.down : C.text5;

  return (
    <Svg viewBox={chart.viewBox} style={{ width: "100%", aspectRatio: chart.aspectRatio }}>
      {chart.band ? (
        <Path d={chart.band} fill={inside ? C.accent : C.text5} fillOpacity={inside ? 0.08 : 0.14} />
      ) : null}
      {chart.forecastPath ? (
        <Path d={chart.forecastPath} fill="none" stroke={C.text5} strokeWidth={2.4} strokeLinecap="round" strokeDasharray="5 6" />
      ) : null}
      <Path d={chart.actualPath} fill="none" stroke={C.accent} strokeWidth={4.4} strokeLinecap="round" />
      {[chart.start, ...chart.waypoints].map((p) => (
        <Circle key={`${p.x}-${p.y}`} cx={p.x} cy={p.y} r={4.4} fill={C.bg} stroke={C.accent} strokeWidth={2.4} />
      ))}
      <Circle cx={chart.actualNode.x} cy={chart.actualNode.y} r={8.5} fill={C.accent} />
      <Circle
        cx={chart.predictedNode.x}
        cy={chart.predictedNode.y}
        r={inside ? 4 : 4.6}
        fill="none"
        stroke={predTone}
        strokeWidth={2}
      />
      <SvgText x={chart.predictedNode.labelX} y={chart.predictedNode.labelY} fill={inside ? C.down : C.text4} {...LABEL}>
        {`TAHMİN ${view.predictedInt}`}
      </SvgText>
      <SvgText x={chart.actualNode.labelX} y={chart.actualNode.labelY} fill={C.accent} {...LABEL}>
        {`GERÇEK ${view.actualText}`}
      </SvgText>
    </Svg>
  );
});
