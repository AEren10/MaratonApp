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
  silentPop.arm();
  assert.equal(silentPop.get(), true);
  silentPop.arm();
  silentPop.disarm();
  assert.equal(silentPop.get(), false);
  assert.equal(calls, 2);
  off();
});

test("withSilent bayrak acikken animasyonu kapatir, kapaliyken dokunmaz", () => {
  const opts = { animation: "default", gestureEnabled: true };
  assert.equal(withSilent(opts, false), opts);
  assert.deepEqual(withSilent(opts, true), { animation: "none", gestureEnabled: true });
  assert.deepEqual(withSilent(undefined, true), { animation: "none" });
});

test("Ana Sayfa sekmesi ic yiginda ekran varsa sessizce koke doner", () => {
  assert.match(tabBar, /tab\.key === SCREENS\.HOME && route\?\.state\?\.key && route\.state\.index > 0/);
  assert.match(tabBar, /silentPop\.arm\(\)/);
  assert.match(tabBar, /StackActions\.popToTop\(\), target: route\.state\.key/);
  assert.match(nav, /useSyncExternalStore\(silentPop\.subscribe, silentPop\.get\)/);
  assert.match(nav, /withSilent\(route\.options, silent\)/);
});
