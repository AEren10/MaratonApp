import { useMemo } from "react";
import { makeScale, netTicks } from "../../../lib/routeChartPath";
import { CHART_W, CHART_H, lineScaleOptions } from "../../../components/charts/chartStyle";

const W = CHART_W;
const H = CHART_H;

export function useRouteChartPos({ stops = [], projection = [], hasTarget, target, xs }) {
  return useMemo(() => {
    if (!stops.length) {
      return { today: { x: W / 2, y: H / 2 }, end: null, targetY: null, ticks: [], points: [] };
    }
    const values = stops.map((p) => (typeof p === "number" ? p : p?.y ?? 0));
    const allValues = [...values, ...projection, ...(hasTarget ? [target] : [])];
    const total = values.length + projection.length;
    const sc = makeScale(allValues, lineScaleOptions({ flagged: hasTarget && projection.length > 0, xs: xs || null }));
    const last = Math.max(0, values.length - 1);
    const [todayPoint] = sc.toPoints([values[last]], { count: total, offset: last });
    const points = sc.toPoints(values, { count: total });
    const endValue = projection.length ? projection[projection.length - 1] : null;
    const minVal = Math.min(...allValues);
    const maxVal = Math.max(...allValues);
    const tickVals = netTicks(minVal, maxVal);
    const ticks = tickVals.map((v) => ({ val: v, y: sc.toY(v) }));

    return {
      today: { x: todayPoint?.x ?? W / 2, y: todayPoint?.y ?? H / 2 },
      end: endValue != null ? { y: sc.toY(endValue) } : null,
      targetY: hasTarget ? sc.toY(target) : null,
      ticks,
      points,
    };
  }, [stops, projection, hasTarget, target, xs]);
}
