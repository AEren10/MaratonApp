import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const tipsSource = readFileSync(
  new URL("../../src/hooks/useDiscoverTips.js", import.meta.url),
  "utf8"
);
const weekViewSource = readFileSync(
  new URL("../../src/screens/program/views/ProgramWeekView.js", import.meta.url),
  "utf8"
);
const homeProSource = readFileSync(
  new URL("../../src/screens/home/components/HomeProBody.js", import.meta.url),
  "utf8"
);
const scheduleCardSource = readFileSync(
  new URL("../../src/screens/program/components/ScheduleDiscoverCard.js", import.meta.url),
  "utf8"
);
const classScheduleSource = readFileSync(
  new URL("../../src/screens/program/ClassScheduleScreen.js", import.meta.url),
  "utf8"
);

test("DISCOVER_TIPS contains SCHEDULE key and isClosed callback", () => {
  assert.match(tipsSource, /SCHEDULE:\s*["']schedule["']/);
  assert.match(tipsSource, /isClosed/);
});

test("ScheduleDiscoverCard targets CLASS_SCHEDULE and dismisses on close", () => {
  assert.match(scheduleCardSource, /navigation\.navigate\(SCREENS\.CLASS_SCHEDULE\)/);
  assert.match(scheduleCardSource, /close\(DISCOVER_TIPS\.SCHEDULE\)/);
  assert.match(scheduleCardSource, /Haftalık programını kur · 2 dakika/);
  assert.match(scheduleCardSource, /activeDayCount\(schedule\)/);
});

test("ScheduleDiscoverCard is mounted in ProgramWeekView and HomeProBody", () => {
  assert.match(weekViewSource, /<ScheduleDiscoverCard/);
  assert.match(homeProSource, /<ScheduleDiscoverCard/);
});

test("ClassScheduleScreen has elevated total summary card", () => {
  assert.match(classScheduleSource, /Haftalık planlanan süre/);
  assert.match(classScheduleSource, /Ders günlerine göre otomatik hesaplandı/);
  assert.match(classScheduleSource, /name="clock"/);
});
