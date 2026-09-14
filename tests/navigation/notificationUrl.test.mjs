import { test } from "node:test";
import assert from "node:assert/strict";

import { SCREENS } from "../../src/constants/screens.js";
import { appUrl, notificationUrl } from "../../src/navigation/routes.js";

test("notificationUrl only allows registered deep-link screens", () => {
  assert.equal(notificationUrl(SCREENS.EXAM_DAY_PLAN), "maraton://sinav/plan");
  assert.equal(notificationUrl(SCREENS.SUMMARY, { period: "week" }), "maraton://ozet/week");

  assert.throws(
    () => notificationUrl(SCREENS.PRO_PREVIEW),
    /deep link olarak kayitli degil/,
    "notification taps must not silently open a non-deeplink modal",
  );
  assert.throws(
    () => notificationUrl("MissingScreen"),
    /deep link olarak kayitli degil/,
    "unknown notification screens must fail closed instead of falling back to Home",
  );
});

test("appUrl keeps the legacy tolerant fallback for non-notification share links", () => {
  assert.equal(appUrl("MissingScreen"), "maraton://home");
});
