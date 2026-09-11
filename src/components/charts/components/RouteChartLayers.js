import { Path, Line } from "react-native-svg";

// Grafigin arka katmanlari, tasarimin siralamasiyla:
// alan dolgusu -> guven bandi -> hedef cizgisi -> projeksiyon.
// Gecmis hat ve dugumler animasyonlu oldugu icin ana bilesende kaldi.
export function RouteChartLayers({ areaD, bandD, targetY, futD, width, C }) {
  return (
    <>
      <Path d={areaD} fill="url(#hglow)" />
      {bandD ? <Path d={bandD} fill={C.accent} fillOpacity={0.1} /> : null}
      {targetY != null ? (
          <Line
            x1={0}
            y1={targetY}
            x2={width}
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
