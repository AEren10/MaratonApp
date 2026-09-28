import test from "node:test";
import assert from "node:assert/strict";

import { examTrials, trialBelongsToExam } from "../../src/domain/exam/examScope.js";

const t = (trialType, branchSubject) => ({ trialType, branchSubject });

test("EA student: TYT and AYT_EA count, AYT_SAY and LGS do not", () => {
  assert.equal(trialBelongsToExam(t("TYT"), "tyt_ayt", "ea"), true);
  assert.equal(trialBelongsToExam(t("AYT_EA"), "tyt_ayt", "ea"), true);
  assert.equal(trialBelongsToExam(t("AYT_SAY"), "tyt_ayt", "ea"), false);
  assert.equal(trialBelongsToExam(t("LGS"), "tyt_ayt", "ea"), false);
});

test("LGS student keeps LGS and LGS branch trials only", () => {
  const kept = examTrials([t("LGS"), t("TYT"), t("BRANCH", "lgs_matematik"), t("BRANCH", "tyt_matematik")], "lgs");
  assert.deepEqual(kept.map((x) => `${x.trialType}:${x.branchSubject || ""}`), ["LGS:", "BRANCH:lgs_matematik"]);
});

test("unknown exam does not filter", () => {
  assert.equal(examTrials([t("LGS"), t("TYT")], null).length, 2);
});
