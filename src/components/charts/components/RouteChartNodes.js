import { Text as SvgText } from "react-native-svg";
import { NODE, STROKE, LABEL } from "../chartStyle";
import { SettlingNode, nodeDelays } from "./SettlingNode";

// DrawnPath.DRAW_MS ile ayni: dugum, hat ona vardiginda oturur.
const DRAW_MS = 900;

// Rota grafigindeki dugumler ve uclardaki baslik etiketleri
export function RouteChartNodes({ pastPoints = [], todayPoint, endPoint, hasFuture, todayLabel, endLabel, C }) {
  const delays = nodeDelays(pastPoints, DRAW_MS);

  return (
    <>
      {pastPoints.slice(0, -1).map((p, i) => (
        <SettlingNode
          key={`pt-${i}`}
          delay={delays[i]}
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
          <SettlingNode delay={DRAW_MS} cx={todayPoint.x} cy={todayPoint.y} r={NODE.todayGlow} fill={C.accent} fillOpacity={0.18} />
          <SettlingNode delay={DRAW_MS} cx={todayPoint.x} cy={todayPoint.y} r={NODE.today} fill={C.accent} />
        </>
      ) : null}

      {endPoint && hasFuture ? (
        <SettlingNode delay={DRAW_MS + 120} cx={endPoint.x} cy={endPoint.y} r={NODE.end} fill={C.bg} stroke={C.projNode} strokeWidth={STROKE.endNode} />
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
          // Tasarimda uc etiketi dugumun SOL ALTINDA duruyor, ustunde degil:
          // hattin ucu tuvalin en ustune kadar cikabilsin diye.
          x={endPoint.x - 14}
          y={endPoint.y + 26}
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
