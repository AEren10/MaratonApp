import test from "node:test";
import assert from "node:assert/strict";

import {
  isSameExamFamily,
  filterAnalysisTrials,
  buildAnalysisViewModel,
} from "../../src/domain/analysis/analysisModel.js";

const mockTheme = {
  accent: "#E5343F",
  text: "#ECE8E4",
  text3: "#A3A0AB",
  amber: "#E0A93F",
  blue: "#74A9E8",
  green: "#34D399",
  subjects: {
    turkce: "#74A9E8",
    matematik: "#E0A570",
    fen: "#56C6D6",
    sosyal: "#A27BF8",
    ydt_ingilizce: "#74A9E8",
  },
};

test("isSameExamFamily correctly isolates different exam families", () => {
  const tyt = { trialType: "TYT" };
  const ydt = { trialType: "YDT" };
  const aytSay = { trialType: "AYT_SAY" };
  const aytEa = { trialType: "AYT_EA" };
  const lgs = { trialType: "LGS" };
  const branchMat = { trialType: "BRANCH", branchSubject: "matematik" };
  const branchTur = { trialType: "BRANCH", branchSubject: "turkce" };

  assert.equal(isSameExamFamily(tyt, tyt), true);
  assert.equal(isSameExamFamily(ydt, ydt), true);
  assert.equal(isSameExamFamily(aytSay, aytEa), true); // AYT tracks are in the same AYT family
  assert.equal(isSameExamFamily(branchMat, { trialType: "BRANCH", branchSubject: "matematik" }), true);

  // Different exam families must NEVER match
  assert.equal(isSameExamFamily(tyt, ydt), false, "TYT and YDT must not match");
  assert.equal(isSameExamFamily(tyt, aytSay), false, "TYT and AYT must not match");
  assert.equal(isSameExamFamily(ydt, aytSay), false, "YDT and AYT must not match");
  assert.equal(isSameExamFamily(tyt, lgs), false, "TYT and LGS must not match");
  assert.equal(isSameExamFamily(branchMat, branchTur), false, "Different branch subjects must not match");
});

test("filterAnalysisTrials filters YDT trials correctly", () => {
  const trials = [
    { id: "1", trialType: "TYT", totalNet: 34 },
    { id: "2", trialType: "YDT", totalNet: 23.75 },
    { id: "3", trialType: "BRANCH", branchSubject: "matematik" },
  ];

  const ydtTrials = filterAnalysisTrials(trials, "YDT");
  assert.equal(ydtTrials.length, 1);
  assert.equal(ydtTrials[0].id, "2");

  const allTrials = filterAnalysisTrials(trials, "ALL");
  assert.equal(allTrials.length, 2); // Excludes BRANCH
});

test("first YDT trial does not calculate fake drop against TYT trial", () => {
  // Scenario: Student has 1 older TYT trial (34.05 net) and enters their 1st YDT trial (23.75 net)
  const trials = [
    {
      id: "ydt-1",
      date: "2026-09-29",
      trialType: "YDT",
      totalNet: 23.75,
      subjects: { ydt_ingilizce: { net: 23.75 } },
    },
    {
      id: "tyt-1",
      date: "2026-09-20",
      trialType: "TYT",
      totalNet: 34.05,
      subjects: { tyt_turkce: { net: 20 }, tyt_matematik: { net: 14.05 } },
    },
  ];

  const vm = buildAnalysisViewModel({
    C: mockTheme,
    examType: "dil",
    filter: "ALL",
    trials,
  });

  // Latest trial is YDT (23.75)
  assert.equal(vm.latest.net, 23.75);
  // Crucial check: trend MUST be null, NOT -10.3!
  assert.equal(vm.latest.trend, null, "First YDT trial must have trend null, not compare with TYT");

  // History list check
  assert.equal(vm.history[0].id, "ydt-1");
  assert.equal(vm.history[0].trend, null, "History item for first YDT trial must have null trend");
  assert.equal(vm.history[1].id, "tyt-1");
  assert.equal(vm.history[1].trend, null, "History item for first TYT trial must have null trend");

  // Multi-series for dil students includes TYT and YDT, not AYT
  const seriesKeys = vm.heroSeries.map((s) => s.key);
  assert.deepEqual(seriesKeys, ["TYT", "YDT"]);
});

test("second YDT trial calculates trend exclusively against the previous YDT trial", () => {
  const trials = [
    {
      id: "ydt-2",
      date: "2026-10-05",
      trialType: "YDT",
      totalNet: 30.0,
      subjects: { ydt_ingilizce: { net: 30.0 } },
    },
    {
      id: "tyt-1",
      date: "2026-09-29",
      trialType: "TYT",
      totalNet: 45.0,
      subjects: { tyt_turkce: { net: 25 } },
    },
    {
      id: "ydt-1",
      date: "2026-09-20",
      trialType: "YDT",
      totalNet: 23.75,
      subjects: { ydt_ingilizce: { net: 23.75 } },
    },
  ];

  const vm = buildAnalysisViewModel({
    C: mockTheme,
    examType: "dil",
    filter: "ALL",
    trials,
  });

  assert.equal(vm.latest.net, 30.0);
  // Trend should compare ydt-2 (30.0) with ydt-1 (23.75), ignoring tyt-1 (45.0) in between!
  // 30.0 - 23.75 = 6.25
  assert.equal(vm.latest.trend, 6.25, "Trend should compare with previous YDT trial");
});
