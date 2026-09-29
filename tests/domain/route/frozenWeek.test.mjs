import test from "node:test";
import assert from "node:assert/strict";

import { frozenWeekFromRows } from "../../../src/domain/route/frozenWeek.js";

const row = (topic, status, extra = {}) => ({
  id: `id-${topic}`, week_start: "2026-09-28", subject: "matematik", subject_label: "Matematik", topic,
  logical_key: `k-${topic}`, root_key: "r", segment_index: 0, position: extra.position ?? 0, lifecycle_status: status,
  stop_kind: "learn", metadata: { questions: 20, minutes: 30, planStart: extra.planStart },
});

test("bu hafta kayitliysa sabit set doner; bitenler yerinde kalir; hallettim denen acik durak duser", () => {
  const rows = [
    row("A", "completed", { position: 0, planStart: "2026-09-30" }),
    row("B", "upcoming", { position: 1 }),
    row("C", "upcoming", { position: 2 }),
    { ...row("D", "upcoming"), week_start: "2026-10-05" },
  ];
  const w = frozenWeekFromRows(rows, "2026-09-28", { matematik: { C: "2026-09-30" } });
  assert.deepEqual(w.stops.map((s) => s.topic), ["A", "B"]);
  assert.equal(w.stops[0].lifecycleStatus, "completed");
  assert.equal(w.stops[1].cost.questions, 20);
  assert.equal(w.planStartDay, "2026-09-30");
  assert.equal(frozenWeekFromRows(rows, "2026-10-12"), null);
});
