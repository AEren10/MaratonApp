import Svg, { Circle, Path, Rect } from "react-native-svg";

import { ROUTE_STOP_STATUS as S } from "../../../domain/route/stopStatus";

// "DURAK DURUMLARI" lejantindaki 26px isaretler. Durum yalniz renkle degil
// dugum sekli, cizgi stili ve ikonla ayrilir (tasarimin kendi notu).
function Shape({ status, C }) {
  switch (status) {
    case S.COMPLETED:
      return (<>
        <Path d="M0 13h26" stroke={C.accent} strokeWidth={3.4} strokeLinecap="round" />
        <Circle cx={13} cy={13} r={6.5} fill={C.accent} />
      </>);
    case S.ACTIVE:
      return (<>
        <Path d="M0 13h13" stroke={C.accent} strokeWidth={3.4} strokeLinecap="round" />
        <Path d="M13 13h26" stroke={C.proj} strokeWidth={2} strokeDasharray="2 6" strokeLinecap="round" />
        <Circle cx={13} cy={13} r={9} fill="none" stroke={C.accent} strokeWidth={2} opacity={0.35} />
        <Circle cx={13} cy={13} r={5} fill={C.bg} stroke={C.accent} strokeWidth={2.6} />
      </>);
    case S.UPCOMING:
      return (<>
        <Path d="M0 13h26" stroke={C.proj} strokeWidth={2} strokeDasharray="2 6" strokeLinecap="round" />
        <Circle cx={13} cy={13} r={5} fill={C.bg} stroke={C.projNode} strokeWidth={2.2} />
      </>);
    case S.RESCHEDULED:
      return (<>
        <Path d="M0 13h26" stroke={C.accent} strokeWidth={2} strokeDasharray="4 4" strokeLinecap="round" opacity={0.7} />
        <Circle cx={13} cy={13} r={6} fill={C.bg} stroke={C.accent} strokeWidth={2.2} strokeDasharray="3 3" />
      </>);
    case S.SKIPPED:
      return (<>
        <Path d="M0 13h26" stroke={C.text5} strokeWidth={1.6} strokeDasharray="2 5" strokeLinecap="round" />
        <Circle cx={13} cy={13} r={6} fill={C.bg} stroke={C.text4} strokeWidth={1.8} />
        <Path d="M9.4 9.4l7.2 7.2M16.6 9.4l-7.2 7.2" stroke={C.text3} strokeWidth={1.7} strokeLinecap="round" />
      </>);
    case S.LOCKED:
      return (<>
        <Path d="M0 13h26" stroke={C.text5} strokeWidth={1.6} strokeDasharray="2 5" strokeLinecap="round" />
        <Circle cx={13} cy={13} r={6.4} fill={C.bg} stroke={C.text4} strokeWidth={1.7} />
        <Rect x={10.4} y={12.3} width={5.2} height={4} rx={1.1} fill="none" stroke={C.text3} strokeWidth={1.3} />
        <Path d="M11.7 12.3v-1a1.3 1.3 0 0 1 2.6 0v1" fill="none" stroke={C.text3} strokeWidth={1.3} />
      </>);
    default:
      return (<>
        <Path d="M0 13h26" stroke={C.text5} strokeWidth={3} strokeLinecap="round" opacity={0.5} />
        <Circle cx={13} cy={13} r={6} fill={C.track} stroke={C.text5} strokeWidth={1.7} />
        <Path d="M13 9.6v6.8M10.1 11.3l5.8 3.4M15.9 11.3l-5.8 3.4" stroke={C.text4} strokeWidth={1.2} strokeLinecap="round" />
      </>);
  }
}

export function RouteStatusGlyph({ status, C }) {
  return (
    <Svg width={26} height={26} viewBox="0 0 26 26" fill="none">
      <Shape status={status} C={C} />
    </Svg>
  );
}
