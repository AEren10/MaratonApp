import { Circle, G, Line } from "react-native-svg";
import { ROUTE_STOP_STATUS } from "../../../domain/route/stopStatus";

// Rota grafiğindeki tek bir durağın düğüm şekli. 7 durum, 7 ayrı çizim —
// RouteWeekCard.js'teki ICON_BY_STATUS ile tutarlı (check/repeat/x/lock/pause).
export function RouteChartNode({ x, y, status, C }) {
  switch (status) {
    case ROUTE_STOP_STATUS.COMPLETED:
      return <Circle cx={x} cy={y} r={4} fill={C.bg} stroke={C.past} strokeWidth={2.2} />;

    case ROUTE_STOP_STATUS.ACTIVE:
      return (
        <G>
          <Circle cx={x} cy={y} r={9} fill={C.accent} fillOpacity={0.18} />
          <Circle cx={x} cy={y} r={7} fill={C.accent} />
        </G>
      );

    case ROUTE_STOP_STATUS.RESCHEDULED:
      // Yeniden planlandı: dış halka + iç boşluk, "tekrar" hissi.
      return (
        <G>
          <Circle cx={x} cy={y} r={6.5} fill={C.bg} stroke={C.proj} strokeWidth={2} strokeDasharray="3 3" />
          <Circle cx={x} cy={y} r={2} fill={C.proj} />
        </G>
      );

    case ROUTE_STOP_STATUS.SKIPPED:
      // Atlandı: içi boş, X işaretli düğüm.
      return (
        <G>
          <Circle cx={x} cy={y} r={5.5} fill={C.bg} stroke={C.text3} strokeWidth={2} />
          <Line x1={x - 2.4} y1={y - 2.4} x2={x + 2.4} y2={y + 2.4} stroke={C.text3} strokeWidth={1.6} strokeLinecap="round" />
          <Line x1={x - 2.4} y1={y + 2.4} x2={x + 2.4} y2={y - 2.4} stroke={C.text3} strokeWidth={1.6} strokeLinecap="round" />
        </G>
      );

    case ROUTE_STOP_STATUS.LOCKED:
      // Kilitli: soluk, düşük opaklıklı düz düğüm.
      return <Circle cx={x} cy={y} r={5} fill={C.bg} stroke={C.text4} strokeWidth={2} strokeOpacity={0.6} fillOpacity={0.6} />;

    case ROUTE_STOP_STATUS.FROZEN:
      // Donduruldu: iki dikey çubuklu (duraklat) düğüm.
      return (
        <G>
          <Circle cx={x} cy={y} r={6.5} fill={C.bg} stroke={C.projNode} strokeWidth={2} />
          <Line x1={x - 1.6} y1={y - 2.5} x2={x - 1.6} y2={y + 2.5} stroke={C.projNode} strokeWidth={1.6} strokeLinecap="round" />
          <Line x1={x + 1.6} y1={y - 2.5} x2={x + 1.6} y2={y + 2.5} stroke={C.projNode} strokeWidth={1.6} strokeLinecap="round" />
        </G>
      );

    case ROUTE_STOP_STATUS.UPCOMING:
    default:
      // Sırada (gelecek/tahmin): boş, kesikli çevre.
      return <Circle cx={x} cy={y} r={6.5} fill={C.bg} stroke={C.projNode} strokeWidth={2.4} strokeDasharray="2 3" />;
  }
}
