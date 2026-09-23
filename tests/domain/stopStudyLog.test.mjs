import test from "node:test";
import assert from "node:assert/strict";

import { buildStopStudyLog, stopLogOperationId } from "../../src/domain/plan/stopStudyLog.js";

const base = { userId: "u1", studyDate: "2026-09-23" };

test("durak tikinde planlanan soru ve dakika kaydedilir", () => {
  const log = buildStopStudyLog({
    ...base,
    stop: { id: "s1", subject: "tyt_matematik", topic: "EBOB", count: 27, minutes: 32 },
  });
  assert.equal(log.question_count, 27);
  assert.equal(log.duration_minutes, 32);
  assert.equal(log.subject, "tyt_matematik");
  assert.equal(log.study_date, "2026-09-23");
});

test("kayit durakla ayni kimligi tasir — iki tik iki kayit yapmaz", () => {
  const a = buildStopStudyLog({ ...base, stop: { id: "s1", count: 10, minutes: 10 } });
  const b = buildStopStudyLog({ ...base, stop: { id: "s1", count: 10, minutes: 10 } });
  assert.equal(a.client_operation_id, b.client_operation_id);
  assert.equal(a.client_operation_id, stopLogOperationId("s1"));
});

test("soru sayisi olmayan durak yalniz dakika yazar", () => {
  const log = buildStopStudyLog({ ...base, stop: { id: "s2", count: 0, minutes: 40 } });
  assert.equal(log.question_count, 0);
  assert.equal(log.duration_minutes, 40);
});

test("ne soru ne dakika varsa kayit yazilmaz", () => {
  assert.equal(buildStopStudyLog({ ...base, stop: { id: "s3", count: 0, minutes: 0 } }), null);
});

test("eksik girdide cokmez", () => {
  assert.equal(buildStopStudyLog({ ...base, stop: null }), null);
  assert.equal(buildStopStudyLog({ stop: { id: "s1", count: 5 }, userId: null, studyDate: "2026-09-23" }), null);
  assert.equal(stopLogOperationId(null), null);
});
