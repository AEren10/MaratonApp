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
  // Eski "BU HAFTA" karti kalkti; ozet artik Program > Hafta'da tek satir.
  const view = read("src/screens/program/views/ProgramWeekView.js");
  assert.doesNotMatch(view, /8 sa 40 dk/);
  assert.doesNotMatch(view, /13 sa planlı/);
  assert.match(view, /if \(totalMinutes > 0\)/);
  assert.match(view, /if \(totalQuestions > 0\)/);
});

test("profile hides zero-dashboard stats until real activity exists", () => {
  // "Yol kunyesi" kutulari kalkti (28 Eylul); soru/saat Calisma gecmisi
  // satirinda ve yalniz sifir degilse gorunur.
  const profile = read("src/screens/profile/ProfileScreen.js");
  const route = read("src/screens/profile/components/YearRouteChart.js");
  assert.doesNotMatch(profile, /RouteCredentialsList/);
  assert.match(profile, /if \(totalQuestions > 0\)/);
  assert.match(profile, /if \(totalHours > 0\)/);
  assert.match(route, /hasActivity/);
  assert.match(route, /Rota günlüğün ilk kayıtla başlayacak/);
});

test("curriculum map invites first progress instead of heroing a giant zero", () => {
  const card = read("src/screens/roadmap/components/CurriculumProgressCard.js");
  assert.match(card, /const hasProgress = done > 0/);
  assert.match(card, /İlk etap hazır/);
  assert.match(card, /İlk konunu tamamladığında/);
});
