import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const stepper = readFileSync("src/screens/settings/components/GoalNetStepper.js", "utf8");
const multi = readFileSync("src/screens/settings/components/GoalMultiNetSection.js", "utf8");
const slider = readFileSync("src/screens/onboarding/components/GoalSlider.js", "utf8");
const valueInput = readFileSync("src/screens/settings/components/GoalValueInput.js", "utf8");

test("hedef cubugu suruklenebilir ve sayi dokunarak duzenlenebilir", () => {
  assert.match(stepper, /GoalSlider/);
  assert.match(stepper, /GoalValueInput/);
  assert.match(stepper, /onChange/);
  assert.match(stepper, /step/);
});

test("toplam net satiri label yerine daha okunur govde tipografisi kullanir", () => {
  assert.match(multi, /TYPOGRAPHY\.metaSemiBold[\s\S]{0,160}TOPLAM:/);
});

test("dikey kaydirma suruklemeden once kazanir ve onboarding gorunumu korunur", () => {
  assert.match(slider, /activeOffsetX\(\[-10, 10\]\)/);
  assert.match(slider, /failOffsetY\(\[-6, 6\]\)/);
  assert.match(slider, /thumbHalfSize = THUMB_R, thumbCornerRadius = 6/);
});

test("sayi girisi ust durumu aninda gunceller ve acik bitirme kontrolu sunar", () => {
  assert.match(valueInput, /changeDraft[\s\S]*onChange\(next\)/);
  assert.match(valueInput, />Tamam<\/Text>/);
  assert.match(valueInput, /height: CONTROL\.tapMin/);
  assert.match(valueInput, /minWidth: CONTROL\.tapMin/);
});
