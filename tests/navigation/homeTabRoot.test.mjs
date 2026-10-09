import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import { silentPop, withSilent } from "../../src/navigation/silentPop.js";

// Home -> Rota -> Analiz -> Home: Home kokten acilmali, saga kayan pop yok.
const tabBar = readFileSync("src/navigation/TabBar.js", "utf8");
const nav = readFileSync("src/navigation/AppNavigator.js", "utf8");

test("silentPop bayragi acilir/kapanir ve dinleyiciye haber verir", () => {
  let calls = 0;
  const off = silentPop.subscribe(() => { calls += 1; });
  silentPop.arm("Home");
  assert.equal(silentPop.get("Home"), true);
  assert.equal(silentPop.get("Profile"), false);
  silentPop.arm("Home");
  silentPop.disarm("Home");
  assert.equal(silentPop.get("Home"), false);
  assert.equal(calls, 2);
  off();
});

test("withSilent bayrak acikken animasyonu kapatir, kapaliyken dokunmaz", () => {
  const opts = { animation: "default", gestureEnabled: true };
  assert.equal(withSilent(opts, false), opts);
  assert.deepEqual(withSilent(opts, true), { animation: "none", gestureEnabled: true });
  assert.deepEqual(withSilent(undefined, true), { animation: "none" });
});

test("her sekme ic yigini derinse sessizce koke doner; ayrilirken bayrak once acilir", () => {
  assert.match(tabBar, /if \(isDeep\(route\)\)/);
  assert.match(tabBar, /if \(isDeep\(leaving\)\)/);
  assert.match(tabBar, /silentPop\.arm\(leaving\.name\)/);
  assert.match(tabBar, /StackActions\.popToTop\(\), target: route\.state\.key/);
  assert.match(nav, /silentPop\.get\(root\.name\)/);
  assert.match(nav, /withSilent\(route\.options, silent\)/);
});
