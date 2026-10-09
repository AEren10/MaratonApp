import { test } from "node:test";
import assert from "node:assert/strict";

import { stopLogOperationId } from "../../src/domain/plan/stopStudyLog.js";
import { normalizeSchedule } from "../../src/domain/program/classSchedule.js";
import { assignWeekStops } from "../../src/domain/program/assignStopsToDays.js";

// 9 Ekim denetimi: tarih tasimayan durak her gun ayni kayit kimligini aliyordu.
test("tarihsiz durak (oneri / plan_) kayit kimligine gunu katar; rota duragi degismez", () => {
  assert.equal(stopLogOperationId("ai_suggestion", "2026-10-09"), "stop_log_ai_suggestion_2026-10-09");
  assert.notEqual(stopLogOperationId("ai_suggestion", "2026-10-09"), stopLogOperationId("ai_suggestion", "2026-10-10"));
  assert.equal(stopLogOperationId("plan_tyt_matematik_Problemler", "2026-10-09"), "stop_log_plan_tyt_matematik_Problemler_2026-10-09");
  assert.equal(stopLogOperationId("route_abc", "2026-10-09"), "stop_log_route_abc");
  assert.equal(stopLogOperationId(null), null);
});

// Pzt-Cum calisan ogrenci Cumartesi kayit oldu: duraklar gecmis gunlere degil
// haftanin kalan gunlerine (Cmt/Paz) yerlesir.
test("plan hafta sonu basladi, kalan gunlerde calisma gunu yok: durak gecmise dusmez", () => {
  const schedule = normalizeSchedule([
    { weekday: 5, kind: "off", minutes: 0 },
    { weekday: 6, kind: "off", minutes: 0 },
  ]);
  const stop = (subject) => ({ subject, subjectLabel: subject, topic: `${subject} konu`, cost: { questions: 40, minutes: 40 } });
  const days = assignWeekStops([stop("tyt_matematik"), stop("tyt_turkce")], schedule, {
    monday: "2026-10-05", firstDate: "2026-10-10",
  });
  assert.equal(days.slice(0, 5).reduce((n, d) => n + d.length, 0), 0);
  assert.equal(days[5].length + days[6].length, 2);
});
