import assert from "node:assert/strict";
import test from "node:test";

import { buildStudyTimerParams } from "../../src/domain/plan/studyTimerParams.js";

test("planEngine görevi: plan anahtarı ve rota durağı taşınır", () => {
  const params = buildStudyTimerParams({
    subject: "matematik", subjectLabel: "Matematik", topicLabel: "Türev", topic: "Türev",
    planTaskKey: "plan_matematik_türev", stopId: "s1", version: 3,
  });
  assert.deepEqual(params, {
    taskId: "plan_matematik_türev", planTaskKey: "plan_matematik_türev", subjectKey: "matematik",
    topicName: "Türev", planSubjectKey: "matematik", planTopicName: "Türev",
    routeStopId: "s1", routeStopVersion: 3,
  });
});

test("kullanıcı görevi: plan bağlamı yok", () => {
  const params = buildStudyTimerParams({ id: "u1", source: "user", subject: "fizik", label: "Optik" });
  assert.equal(params.taskId, "u1");
  assert.equal(params.planTaskKey, undefined);
  assert.equal(params.planSubjectKey, undefined);
  assert.equal(params.routeStopId, undefined);
});

test("birleşik plan satırı: routeStop ve planTopicName", () => {
  const params = buildStudyTimerParams({
    id: "plan_kimya_mol", source: "plan", subject: "kimya", label: "Mol", planTopicName: "Mol",
    routeStop: { stopId: "s9", version: 1 },
  });
  assert.equal(params.planTaskKey, "plan_kimya_mol");
  assert.equal(params.planTopicName, "Mol");
  assert.equal(params.routeStopId, "s9");
  assert.equal(params.routeStopVersion, 1);
  assert.equal(buildStudyTimerParams(null), null);
});
