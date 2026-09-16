import { readFileSync } from "node:fs";
import test from "node:test";
import assert from "node:assert/strict";

function src(path) {
  return readFileSync(new URL(`../../${path}`, import.meta.url), "utf8");
}

test("legacy design buttons still render labels and intended sizes", () => {
  const button = src("src/components/design/Button.js");

  assert.match(button, /title,/);
  assert.match(button, /const label = children \?\? title;/);
  assert.match(button, /SIZES\.small = SIZES\.sm;/);
  assert.match(button, /SIZES\.large = SIZES\.lg;/);
});

test("first week guide sends active steps to their own flow instead of one dead action", () => {
  const screen = src("src/screens/premium/FirstWeekScreen.js");

  assert.match(screen, /handleTaskAction = useCallback\(\(step\)/);
  assert.match(screen, /navigation\.navigate\(step\.screen\)/);
  assert.match(screen, /step\?\.key === "second_day"/);
  assert.match(screen, /navigation\.navigate\(SCREENS\.ADD_TASK\)/);
  assert.match(screen, /resetToTabStackScreen\(navigation, TAB_KEYS\.ROTA, SCREENS\.ROADMAP\)/);
  assert.doesNotMatch(screen, /title="4\. adımı yap"/);
  assert.doesNotMatch(screen, /variant="tint"/);
});

test("eighth day lock opens the real paywall, not the old mock card flow", () => {
  const screen = src("src/screens/premium/EighthDayLockScreen.js");

  assert.match(screen, /SCREENS\.PAYWALL/);
  assert.match(screen, /source: "route_gate"/);
  assert.doesNotMatch(screen, /PAYMENT_CARD/);
  assert.doesNotMatch(screen, /snrsz|zetler/);
});
