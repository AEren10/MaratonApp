import { test } from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";

import { SCREENS } from "../../src/constants/screens.js";
import { LINKING_SCREENS, ROUTE_CONFIGS, notificationUrl } from "../../src/navigation/routes.js";

const require = createRequire(import.meta.url);
const { getStateFromPath } = require("@react-navigation/core");

// Bildirim dokunusu URL'yi linking agacindan cozer. URL agacta bir ekrana
// inmiyorsa React Navigation sessizce varsayilan ekrani acar.
function leafRoute(state) {
  let node = state;
  let route = null;
  while (node?.routes?.length) {
    route = node.routes[node.index ?? node.routes.length - 1];
    node = route.state;
  }
  return route;
}

const TARGETS = [
  [SCREENS.PLAN_DETAIL, {}],
  [SCREENS.SUMMARY, { period: "week" }],
  [SCREENS.TRIAL_ENTRY, {}],
  [SCREENS.EXAM_DAY_PLAN, {}],
  [SCREENS.EXAM_SIMULATOR, {}],
  [SCREENS.REVIEW_SESSION, {}],
];

test("weekly summary push carries the period param", () => {
  const state = getStateFromPath("ozet/week", { screens: LINKING_SCREENS });
  assert.equal(leafRoute(state)?.params?.period, "week");
});

test("every static deep-link route resolves to its own screen", () => {
  for (const [screen, config] of Object.entries(ROUTE_CONFIGS)) {
    if (!config.deepLink || config.path.includes(":")) continue;
    const state = getStateFromPath(config.path, { screens: LINKING_SCREENS });
    const leaf = leafRoute(state);
    // Sekme kokleri sekmenin kendisine iner (ic stack ilk ekranini acar).
    assert.equal(leaf?.name, screen, `${config.path} -> ${leaf?.name}`);
  }
});

for (const [screen, params] of TARGETS) {
  test(`notification url for ${screen} resolves to that screen`, () => {
    const url = notificationUrl(screen, params);
    const path = url.replace("maraton://", "");
    const state = getStateFromPath(path, { screens: LINKING_SCREENS });
    assert.ok(state, `${url} linking agacinda cozulmedi`);
    assert.equal(leafRoute(state)?.name, screen, `${url} yanlis ekrana gidiyor`);
  });
}
