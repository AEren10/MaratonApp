import { readFileSync } from "node:fs";
import test from "node:test";
import assert from "node:assert/strict";

// Rota, Rotanin tamami ve Durak detayi ekranlari kaldirildi (27 Eylul);
// ayni kontrol simdi Program ekraninda.
const FILES = [
  "src/screens/program/ProgramScreen.js",
  "src/screens/program/views/ProgramWeekView.js",
  "src/screens/dersler/components/SelectedDayPanel.js",
];

test("roadmap jsx props do not contain bare template placeholders", () => {
  for (const file of FILES) {
    const src = readFileSync(file, "utf8");
    assert.doesNotMatch(src, /=\{\$\{/, `${file} has invalid JSX template syntax`);
    assert.doesNotMatch(src, /\?\s*\$\{/, `${file} has invalid ternary template syntax`);
  }
});
