import { test } from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";

import { SCREENS } from "../../src/constants/screens.js";
import { LINKING_SCREENS, appUrl } from "../../src/navigation/routes.js";

const require = createRequire(import.meta.url);
const { getStateFromPath } = require("@react-navigation/core");

// Widget'larin ve bildirimlerin actigi yollar gercekten bir ekrana ciksin.
// Eskiden sekme icindeki yollar sekme yoluna ekleniyordu (home/plan) ve
// maraton://plan hicbir yere gitmiyordu.
const leaf = (state) => {
  let route = state?.routes?.[state.routes.length - 1];
  while (route?.state) route = route.state.routes[route.state.routes.length - 1];
  return route?.name;
};

for (const [path, screen] of [
  ["plan", SCREENS.PLAN_DETAIL],
  ["rota", SCREENS.ROADMAP],
  ["yanlis/tekrar", SCREENS.REVIEW_SESSION],
  ["analiz", SCREENS.ANALYSIS],
  ["widget", SCREENS.WIDGET_GUIDE],
]) {
  test(`maraton://${path} -> ${screen}`, () => {
    const state = getStateFromPath(path, { screens: LINKING_SCREENS });
    assert.ok(state, `${path} cozulmedi`);
    assert.equal(leaf(state), screen);
  });
}

test("appUrl ile uretilen her bildirim yolu cozuluyor", () => {
  for (const screen of [SCREENS.PLAN_DETAIL, SCREENS.ROADMAP, SCREENS.REVIEW_SESSION]) {
    const path = appUrl(screen).replace("maraton://", "");
    assert.ok(getStateFromPath(path, { screens: LINKING_SCREENS }), path);
  }
});
