import test from "node:test";
import assert from "node:assert/strict";

import { forecastTarget } from "../../src/domain/forecast/forecastTarget.js";

const multi = { examType: "tyt_ayt", targetNet: 126, targetNetTYT: 78, targetNetAYT: 48 };

test("TYT forecast compares to TYT target, never the sum", () => {
  assert.deepEqual(forecastTarget({ ...multi, types: ["TYT"] }), { label: "TYT", target: 78 });
});

test("AYT and YDT forecasts compare to the second target", () => {
  assert.deepEqual(forecastTarget({ ...multi, types: ["AYT_SAY", "AYT"] }), { label: "AYT", target: 48 });
  assert.deepEqual(forecastTarget({ ...multi, types: ["YDT"] }), { label: "YDT", target: 48 });
});

test("unknown split target gives no comparison instead of the sum", () => {
  const r = forecastTarget({ examType: "tyt_ayt", targetNet: 126, types: ["TYT"] });
  assert.equal(r.target, null);
});

test("single-exam users keep their one target", () => {
  assert.deepEqual(forecastTarget({ examType: "lgs", targetNet: 70, types: ["LGS"] }), { label: "LGS", target: 70 });
  assert.deepEqual(forecastTarget({ examType: "tyt", targetNet: 90, types: ["TYT"] }), { label: "TYT", target: 90 });
});

test("dil users: TYT forecast uses TYT target, not TYT+YDT", () => {
  const r = forecastTarget({ examType: "dil", targetNet: 118, targetNetTYT: 70, targetNetAYT: 48, types: ["TYT"] });
  assert.deepEqual(r, { label: "TYT", target: 70 });
});
