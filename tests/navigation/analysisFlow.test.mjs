import { readFileSync } from "node:fs";
import test from "node:test";
import assert from "node:assert/strict";

import { SCREENS } from "../../src/constants/screens.js";
import { ANALIZ_STACK } from "../../src/navigation/tabAssignment.js";

test("analysis screenshot flow targets live inside the analysis tab stack", () => {
  for (const screen of [
    SCREENS.TRIAL_RECORDS,
    SCREENS.SUBJECT_LIST,
    SCREENS.WRONG_NOTEBOOK,
    SCREENS.TRIAL_COMPARE,
    SCREENS.COMPARATIVE,
    SCREENS.WEAK_AREAS,
    SCREENS.NET_FORECAST,
    SCREENS.EXAM_SIMULATOR,
  ]) {
    assert.ok(ANALIZ_STACK.includes(screen), `${screen} must stay reachable inside Analiz tab`);
  }
});

test("analysis home uses canonical labels and header trial entry action", () => {
  const screen = readFileSync("src/screens/analysis/AnalysisScreen.js", "utf8");
  const shortcuts = readFileSync("src/screens/analysis/components/AnalysisShortcutRow.js", "utf8");
  const practice = readFileSync("src/screens/analysis/components/AnalysisPracticeSection.js", "utf8");
  const history = readFileSync("src/screens/analysis/components/HistoryList.js", "utf8");
  const subjectList = readFileSync("src/screens/analysis/SubjectListScreen.js", "utf8");

  assert.match(screen, /analysis_header_trial_entry/);
  assert.match(screen, /DERS BAZLI TREND/);
  assert.match(screen, /DENEME KAYITLARI/);
  assert.match(shortcuts, /YAYIN KARŞILAŞTIRMASI/);
  assert.match(practice, /DAHA DERİNE/);
  assert.match(practice, /Net Tahmini/);
  assert.match(practice, /Simülasyon/);
  assert.match(history, /Yayın karşılaştırması/);
  assert.match(subjectList, /Konu ilerlemesi/);
});

test("v1 does not surface community answer copy in live analysis or home notebook surfaces", () => {
  const liveSources = [
    "src/screens/home/components/HomeNotebookCard.js",
    "src/screens/analysis/AnalysisScreen.js",
    "src/screens/analysis/components/AnalysisPracticeSection.js",
    "src/screens/wrong-notebook/WrongNotebookScreen.js",
  ].map((file) => readFileSync(file, "utf8")).join("\n");

  assert.doesNotMatch(liveSources, /Topluluktan|Topluluk cevap|yeni cevap/i);
  assert.doesNotMatch(readFileSync("src/screens/wrong-notebook/WrongNotebookScreen.js", "utf8"), /CommunityTab|WrongNotebookTabs/);
});
