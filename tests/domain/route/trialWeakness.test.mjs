import test from "node:test";
import assert from "node:assert/strict";

import { subjectWeaknessFactors } from "../../../src/domain/route/trialWeakness.js";

const trial = (subjects) => ({ subjects });

test("bos birakilan sorular basariyi dusurur; carpan geriligin olcusu", () => {
  const f = subjectWeaknessFactors([trial({
    tyt_matematik: { correct: 10, wrong: 0, empty: 30 },
    tyt_turkce: { correct: 36, wrong: 4, empty: 0 },
  })]);
  // matematik basari %25 -> gap 0.667 -> 1.4 ; turkce %90 -> 1
  assert.equal(f.matematik, 1.4);
  assert.equal(f.turkce, 1);
});

test("yeni deneme daha agir basar", () => {
  const f = subjectWeaknessFactors([
    trial({ tyt_matematik: { correct: 30, wrong: 0, empty: 10 } }),
    trial({ tyt_matematik: { correct: 0, wrong: 0, empty: 40 } }),
  ]);
  assert.ok(f.matematik > 1 && f.matematik < 1.3);
});
