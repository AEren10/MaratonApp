import test from "node:test";
import assert from "node:assert/strict";

import { topicFeelFromLogs } from "../../../src/domain/route/topicFeel.js";
import { toStudyLogRow } from "../../../src/domain/study/studyLogModel.js";

test("en yeni geri bildirim gecerli; gecersiz deger yazilmaz", () => {
  const feel = topicFeelFromLogs([
    { subject: "matematik", topic: "Limit", perceived: "easy", created_at: "2026-09-01T10:00:00Z" },
    { subject: "matematik", topic: "Limit", perceived: "hard", created_at: "2026-09-20T10:00:00Z" },
    { subject: "matematik", topic: "Türev (Kavram)", perceived: null },
  ]);
  assert.deepEqual(feel, { matematik: { Limit: "hard" } });
  assert.equal(toStudyLogRow({ subject: "x", perceived: "bomba" }).perceived, undefined);
  assert.equal(toStudyLogRow({ subject: "x", perceived: "hard" }).perceived, "hard");
});
