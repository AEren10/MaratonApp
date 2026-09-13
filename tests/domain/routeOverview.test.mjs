import assert from "node:assert/strict";
import test from "node:test";

import {
  flattenRouteStops,
  routeStopCounts,
  routeProgressSegments,
  upcomingRouteStops,
  findRouteStop,
  routeDateTag,
} from "../../src/domain/route/routeOverview.js";

const stop = (subject, topic, lifecycleStatus) => ({
  subject, topic, lifecycleStatus, logicalStopKey: `${subject}:${topic}`,
});

const weeks = [
  { weekStart: "2026-09-07", isCurrent: true, stops: [stop("mat", "A", "completed"), stop("mat", "B", "active")] },
  { weekStart: "2026-09-14", stops: [stop("fiz", "C", "rescheduled"), stop("mat", "D", "upcoming")] },
];

test("stops are numbered across weeks with effective status", () => {
  const flat = flattenRouteStops(weeks);
  assert.deepEqual(flat.map((i) => i.number), [1, 2, 3, 4]);
  assert.equal(flat[2].status, "rescheduled");
  assert.equal(flat[0].isCurrentWeek, true);
});

test("counts split completed, rescheduled and queued", () => {
  assert.deepEqual(routeStopCounts(flattenRouteStops(weeks)), {
    total: 4, completed: 1, rescheduled: 1, queued: 2,
  });
  assert.deepEqual(routeStopCounts([]), { total: 0, completed: 0, rescheduled: 0, queued: 0 });
});

test("frozen route turns open stops frozen, not upcoming", () => {
  const flat = flattenRouteStops(weeks, { routeFrozen: true });
  assert.equal(flat[1].status, "frozen");
  assert.deepEqual(upcomingRouteStops(flat), []);
});

test("segments are per stop, per week when the route is long", () => {
  const flat = flattenRouteStops(weeks);
  assert.deepEqual(routeProgressSegments(weeks, flat), ["completed", "queued", "rescheduled", "queued"]);
  assert.deepEqual(routeProgressSegments(weeks, flat, 2), ["queued", "rescheduled"]);
});

test("upcoming lists only active and upcoming in order", () => {
  const keys = upcomingRouteStops(flattenRouteStops(weeks), 5).map((i) => i.stop.topic);
  assert.deepEqual(keys, ["B", "D"]);
});

test("findRouteStop returns neighbours and subject completion", () => {
  const found = findRouteStop(flattenRouteStops(weeks), "mat:B");
  assert.equal(found.entry.number, 2);
  assert.equal(found.prev.stop.topic, "A");
  assert.equal(found.next.stop.topic, "C");
  assert.equal(found.subjectCompleted, 1);
  assert.equal(findRouteStop(flattenRouteStops(weeks), "nope"), null);
});

test("date tag uses Turkish short upper month", () => {
  assert.equal(routeDateTag("2026-07-12T12:00:00"), "12 TEM");
  assert.equal(routeDateTag("2027-06-20T12:00:00", { withYear: true }), "20 HAZ 2027");
  assert.equal(routeDateTag(null), null);
});

import { routeDetailForecast } from "../../src/domain/route/routeDetailView.js";

test("detail forecast without trials returns the design's empty values", () => {
  const view = routeDetailForecast({ forecast: null, targetNet: 72 });
  assert.equal(view.chart, null);
  assert.equal(view.projectedNet, null);
  assert.equal(view.note, "3. denemeden sonra açılır");
  assert.equal(view.rangeText, "—");
  assert.deepEqual(view.tempoRows, []);
});

test("detail forecast states distance to target and tempo rows", () => {
  const forecast = {
    projected: 70.4, range: { low: 66.2, high: 74.6 },
    dataPoints: [{ net: 50 }, { net: 55 }, { net: 60 }],
  };
  const view = routeDetailForecast({
    forecast, targetNet: 72,
    tempoScenarios: [{ multiplier: 0.9, projectedNet: 68 }, { multiplier: 1, projectedNet: 70.4 }, { multiplier: 1.1, projectedNet: 73 }],
  });
  assert.equal(view.note, "hedefin 2 net altında");
  assert.equal(view.rangeText, "66–75 net");
  assert.equal(view.caption, "3 deneme · bugün · sınav günü tahmini");
  assert.deepEqual(view.tempoRows.map((r) => r.value), ["73 net", "68 net"]);
  assert.equal(routeDetailForecast({ forecast, targetNet: null }).note, null);
});
