import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const source = readFileSync(
  new URL("../../src/hooks/useNudgePopup.js", import.meta.url),
  "utf8",
);

test("nudge popup is marked shown only after it becomes visible", () => {
  const showNextStart = source.indexOf("const showNext = useCallback");
  const timerStart = source.indexOf("timerRef.current = setTimeout", showNextStart);
  const addShown = source.indexOf("shownRef.current.add(id)", showNextStart);
  const persistShown = source.indexOf("setJson(shownKey", showNextStart);
  const setVisible = source.indexOf("setPopup(candidate)", showNextStart);

  assert.ok(timerStart > showNextStart);
  assert.ok(setVisible > timerStart);
  assert.ok(addShown > setVisible);
  assert.ok(persistShown > addShown);
});

test("nudge popup keeps pending state in memory during delay", () => {
  assert.match(source, /pendingIdRef = useRef\(null\)/);
  assert.match(source, /pendingIdRef\.current = id;\s*timerRef\.current = setTimeout/);
  assert.match(source, /pendingIdRef\.current = null;\s*clearTimeout\(timerRef\.current\)/);
});
