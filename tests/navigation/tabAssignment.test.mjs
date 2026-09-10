import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import { SCREENS } from "../../src/constants/screens.js";
import { TAB_KEYS, TAB_STACKS, ROOT_ONLY } from "../../src/navigation/tabAssignment.js";
import { LINKING_SCREENS, ROUTE_CONFIGS, ROOT_STACK } from "../../src/navigation/routes.js";

// screenRegistry.js React Native bilesenleri cektigi icin node'da import
// EDILEMEZ; kayitli ekran adlarini metin olarak okuyoruz.
function appStackScreenKeys() {
  const src = readFileSync("src/navigation/screenRegistry.js", "utf8");
  const body = src.slice(src.indexOf("export const APP_STACK_SCREENS"));
  return [...new Set([...body.matchAll(/screen\(SCREENS\.([A-Z_]+)/g)].map((m) => m[1]))];
}

const TAB_ORDER = [TAB_KEYS.ROTA, TAB_KEYS.PROGRAM, TAB_KEYS.ANALIZ, TAB_KEYS.PROFIL];

test("her APP_STACK ekrani bir sekmeye ya da koke atanmis", () => {
  const assigned = new Set([...Object.values(TAB_STACKS).flat(), ...ROOT_ONLY]);
  const missing = appStackScreenKeys()
    .map((key) => SCREENS[key])
    .filter((name) => !assigned.has(name));
  assert.deepEqual(missing, [], "atanmayan ekran navigasyonda ULASILAMAZ olur");
});

test("atanan her ekran gercekten kayitli", () => {
  const registered = new Set(appStackScreenKeys().map((key) => SCREENS[key]));
  const orphan = [...new Set([...Object.values(TAB_STACKS).flat(), ...ROOT_ONLY])]
    .filter((name) => !registered.has(name));
  assert.deepEqual(orphan, [], "tabAssignment ile screenRegistry arasinda kayma var");
});

// Bu proje bir kez "Found conflicting screens with the same pattern" hatasi
// yasadi ve o sirada HICBIR deep link calismadi (bildirim dokunuslari, sifre
// sifirlama dahil). Paylasimli ekranlar agacta iki yerde oldugu icin bu risk
// kalicidir; asagidaki test onu kilitliyor.
test("deep link path'leri ayni konumda cakismiyor", () => {
  const seen = new Map();
  const walk = (node, where) => {
    for (const [name, value] of Object.entries(node || {})) {
      const path = typeof value === "string" ? value : value?.path;
      if (path) {
        const key = `${where}::${path}`;
        assert.ok(
          !seen.has(key),
          `"${path}" iki kez tanimli (${seen.get(key)} ve ${name}) — deep linkler oluyor`,
        );
        seen.set(key, name);
      }
      if (value && typeof value === "object" && value.screens) {
        walk(value.screens, `${where}/${name}`);
      }
    }
  };
  walk(LINKING_SCREENS, "root");
  assert.ok(seen.size > 0);
});

test("paylasimli ekranin path'i YALNIZ kanonik sekmede tanimli", () => {
  const shared = Object.keys(ROUTE_CONFIGS).filter(
    (name) => TAB_ORDER.filter((tab) => (TAB_STACKS[tab] || []).includes(name)).length > 1,
  );
  const tabs = LINKING_SCREENS[ROOT_STACK.MAIN_TABS].screens;

  for (const name of shared) {
    if (!ROUTE_CONFIGS[name]?.deepLink) continue;
    const declaredIn = TAB_ORDER.filter((tab) => tabs[tab]?.screens?.[name]);
    assert.equal(
      declaredIn.length,
      1,
      `${name} ${declaredIn.length} sekmede tanimli, tam 1 olmali`,
    );
    const canonical = TAB_ORDER.find((tab) => (TAB_STACKS[tab] || []).includes(name));
    assert.equal(declaredIn[0], canonical);
  }
  assert.ok(shared.length > 0, "paylasimli ekran kalmadiysa bu test guncellenmeli");
});
