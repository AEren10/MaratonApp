import { readFileSync } from "node:fs";
import test from "node:test";
import assert from "node:assert/strict";

import { SCREENS } from "../../src/constants/screens.js";
import { PROFIL_STACK } from "../../src/navigation/tabAssignment.js";

test("league and friend flows stay live in profile stack", () => {
  for (const screen of [
    SCREENS.LEAGUE,
    SCREENS.FRIENDS,
    SCREENS.REFERRAL,
    SCREENS.ROUTE_COMPANION,
    SCREENS.CHALLENGE,
  ]) {
    assert.ok(PROFIL_STACK.includes(screen), `${screen} must stay reachable from Profil stack`);
  }
});

test("social league is not hidden in the orphan allow-list", () => {
  const orphanCheck = readFileSync("scripts/check-orphan-screens.js", "utf8");
  for (const key of ["LEAGUE", "FRIENDS", "REFERRAL", "ROUTE_COMPANION", "CHALLENGE"]) {
    assert.doesNotMatch(orphanCheck, new RegExp(`"${key}"`));
  }
});

test("league screen uses social league copy and visible relationship actions", () => {
  const league = readFileSync("src/screens/league/LeagueScreen.js", "utf8");

  assert.match(league, /Sosyal/);
  assert.match(league, /LİG/);
  assert.match(league, /Arkadaşlar/);
  assert.match(league, /Genel/);
  assert.match(league, /SIRALAMA · SORU SAYISI/);
  assert.match(league, /Arkadaşını davet et/);
  assert.match(league, /Yol arkadaşın/);
  assert.match(league, /SCREENS\.REFERRAL/);
  assert.match(league, /SCREENS\.ROUTE_COMPANION/);
  assert.doesNotMatch(league, />Topluluk</);
});
