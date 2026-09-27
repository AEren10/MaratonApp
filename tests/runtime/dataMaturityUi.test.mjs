import { readFileSync } from "node:fs";
import test from "node:test";
import assert from "node:assert/strict";

const read = (path) => readFileSync(path, "utf8");

test("analysis empty state does not manufacture a zero-net trial", () => {
  const model = read("src/domain/analysis/analysisModel.js");
  assert.match(model, /latest:\s*\{\s*net:\s*null,\s*trend:\s*null,\s*date:\s*null,\s*typeLabel:\s*null\s*\}/);
  assert.doesNotMatch(model, /latest:\s*\{\s*net:\s*0,\s*trend:\s*0/);
});

test("weekly program summary does not fall back to mock time or stop counts", () => {
  const card = read("src/screens/dersler/components/WeekProgressCard.js");
  assert.doesNotMatch(card, /8 sa 40 dk/);
  assert.doesNotMatch(card, /13 sa planlı/);
  assert.doesNotMatch(card, /:\s*12\b/);
  assert.match(card, /Henüz çalışma yok/);
});

test("profile hides zero-dashboard stats until real activity exists", () => {
  const credentials = read("src/screens/profile/components/RouteCredentialsList.js");
  const route = read("src/screens/profile/components/YearRouteChart.js");
  assert.match(credentials, /hasAnyStat/);
  assert.match(credentials, /İlk çalışma günün burada iz bırakacak/);
  assert.match(route, /hasActivity/);
  assert.match(route, /Rota günlüğün ilk kayıtla başlayacak/);
});

test("curriculum map invites first progress instead of heroing a giant zero", () => {
  const card = read("src/screens/roadmap/components/CurriculumProgressCard.js");
  assert.match(card, /const hasProgress = done > 0/);
  assert.match(card, /İlk etap hazır/);
  assert.match(card, /İlk konunu tamamladığında/);
});
