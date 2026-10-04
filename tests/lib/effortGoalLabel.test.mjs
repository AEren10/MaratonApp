import assert from "node:assert/strict";
import test from "node:test";
import { effortLabelLayout, goalLabelPlacement } from "../../src/components/charts/components/effortLabels.js";

const slot = 46, top = 20, bottom = 160, goalY = 70;
const yOf = (q) => bottom - (q / 200) * (bottom - top);
const day = (questions, minutes) => ({ questions, minutes });

test("hedef yazisi sagdaki gunlerin sure etiketine binmez", () => {
  // Cuma/Cumartesi hedefe yakin: sag-ust yazi onlarin etiketine carpardi.
  const week = { days: [day(128, 150), day(164, 185), day(96, 120), day(182, 210), day(140, 165), day(158, 175), day(105, 90)] };
  const { labelYOf } = effortLabelLayout({ week, todayIndex: 6, goalY, top, slot, width: 360 });
  const p = goalLabelPlacement({ week, goalY, yOf, labelYOf, slot, bottom, width: 360 });
  assert.ok(p === null || !(p.anchor === "end" && p.y === goalY - 7));
});

test("bos haftada hedef yazisi sag-ustte kalir", () => {
  const week = { days: Array.from({ length: 7 }, () => day(0, 0)) };
  const { labelYOf } = effortLabelLayout({ week, todayIndex: 0, goalY, top, slot, width: 360 });
  const p = goalLabelPlacement({ week, goalY, yOf, labelYOf, slot, bottom, width: 360 });
  assert.deepEqual(p && [p.anchor, p.y], ["end", goalY - 7]);
});
