import { Circle, Text as SvgText } from "react-native-svg";
import { NODE, STROKE, LABEL } from "../chartStyle";

// Rota grafigindeki dugumler ve uclardaki baslik etiketleri
export function RouteChartNodes({ pastPoints = [], todayPoint, endPoint, hasFuture, todayLabel, endLabel, C }) {
  return (
    <>
      {pastPoints.slice(0, -1).map((p, i) => (
        <Circle
          key={`pt-${i}`}
          cx={p.x}
          cy={p.y}
          r={NODE.past}
          fill={C.bg}
          stroke={C.past}
          strokeWidth={STROKE.pastNode}
        />
      ))}

      {todayPoint ? (
        <>
          <Circle cx={todayPoint.x} cy={todayPoint.y} r={NODE.todayGlow} fill={C.accent} fillOpacity={0.18} />
          <Circle cx={todayPoint.x} cy={todayPoint.y} r={NODE.today} fill={C.accent} />
        </>
      ) : null}

      {endPoint && hasFuture ? (
        <Circle cx={endPoint.x} cy={endPoint.y} r={NODE.end} fill={C.bg} stroke={C.projNode} strokeWidth={STROKE.endNode} />
      ) : null}

      {todayLabel && todayPoint ? (
        <SvgText
          x={todayPoint.x + 12}
          y={todayPoint.y + 20}
          fill={C.accentBright}
          fontSize={LABEL.size}
          fontWeight={LABEL.weight}
          letterSpacing={LABEL.tracking}
        >
          {todayLabel}
        </SvgText>
      ) : null}

      {endLabel && endPoint && hasFuture ? (
        <SvgText
          x={endPoint.x - 10}
          y={endPoint.y - 14}
          fill={C.text2}
          fontSize={LABEL.size}
          fontWeight={LABEL.weight}
          letterSpacing={LABEL.tracking}
          textAnchor="end"
        >
          {endLabel}
        </SvgText>
      ) : null}
    </>
  );
}
