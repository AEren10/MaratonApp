import test from "node:test";
import assert from "node:assert/strict";

import { EVENTS } from "../../src/constants/analytics.js";
import { createNavigationTracker } from "../../src/navigation/analytics/navigationTracker.js";

test("navigation lifecycle preserves short sessions and renews sessions at 30 minutes", () => {
  let now = 10_000;
  let sessions = 0;
  const events = [];
  const route = { name: "Home", key: "home-1" };
  const tracker = createNavigationTracker(
    (event, props) => events.push({ event, props }),
    { now: () => now, startSession: () => { sessions += 1; } },
  );

  tracker.ready(route);
  now += 5_000;
  tracker.pause(route);
  now += 29 * 60 * 1000;
  tracker.resume(route);
  assert.equal(sessions, 0);

  now += 2_000;
  tracker.pause(route);
  now += 30 * 60 * 1000;
  tracker.resume(route);
  assert.equal(sessions, 1);
  assert.equal(events.filter(({ event }) => event === EVENTS.SCREEN_VIEW).length, 3);
  assert.equal(events.filter(({ event }) => event === EVENTS.SCREEN_EXIT).length, 2);
  assert.equal(events.filter(({ event }) => event === EVENTS.SCREEN_DURATION).length, 2);
});
