import { readFileSync } from "node:fs";
import test from "node:test";
import assert from "node:assert/strict";

const read = (path) => readFileSync(path, "utf8");

test("study timer route stop context reaches the topic card", () => {
  const controller = read("src/screens/study/useStudyTimerController.js");
  const screen = read("src/screens/study/StudyTimerScreen.js");

  assert.match(controller, /routeStopNumber/);
  assert.match(controller, /\$\{Math\.max\(1, Math\.round\(Number\(taskContext\.routeStopNumber\)\)\)\}\. durak/);
  assert.match(screen, /stopLabel/);
  assert.match(screen, /<SubjectTopicCard C=\{C\} subject=\{subject\} topic=\{topic\} stopLabel=\{stopLabel\}/);
});
