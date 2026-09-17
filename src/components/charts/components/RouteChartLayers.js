import { Path, Line } from "react-native-svg";

// Grafigin arka katmanlari, tasarimin siralamasiyla:
// alan dolgusu -> guven bandi -> hedef cizgisi -> projeksiyon.
// Gecmis hat ve dugumler animasyonlu oldugu icin ana bilesende kaldi.
export function RouteChartLayers({ areaD, bandD, targetY, futD, width, ticks, C }) {
  return (
    <>
      {ticks?.map((t, i) => (
        <Line
          key={`tick-${i}`}
          x1={30}
          y1={t.y}
          x2={width - 22}
          y2={t.y}
          stroke={C.line}
          strokeWidth={1}
        />
      ))}
      <Path d={areaD} fill="url(#hglow)" />
      {bandD ? <Path d={bandD} fill={C.accent} fillOpacity={0.1} /> : null}
      {targetY != null ? (
        <Line
          x1={30}
          y1={targetY}
          x2={width - 22}
          y2={targetY}
          stroke={C.targetLine}
          strokeWidth={1.5}
          strokeDasharray="4 6"
        />
      ) : null}
      {futD ? (
        <Path
          d={futD}
          fill="none"
          stroke={C.proj}
          strokeWidth={2.4}
          strokeLinecap="round"
          strokeDasharray="2 8"
        />
      ) : null}
    </>
  );
}
