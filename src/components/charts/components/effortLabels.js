import { CHART_W, EFFORT_PAD_LEFT, PAD_RIGHT } from "../chartStyle.js";

// Cubugun ustundeki sure etiketi: dar alana sigsin diye "2s 15d" bicimi.
export function compactDuration(minutes) {
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  if (h === 0) return `${m}d`;
  return m > 0 ? `${h}s ${m}d` : `${h}s`;
}

// Acik kutulu gun (bugun ve sonrasi): sure etiketi kutunun USTUNE cikar.
// Kutunun icinde kalinca kesikli kenarlara ve taban izine biniyordu.
// Bugunun etiketi sagdaki hedef yazisiyla cakisirsa hedef yazisi cizginin altina iner.
export function effortLabelLayout({ week, todayIndex, goalY, top, slot, width = CHART_W }) {
  const labelYOf = (i, barTop) => {
    const open = todayIndex == null || i >= todayIndex;
    const ceiling = open && goalY != null ? Math.min(barTop, goalY) : barTop;
    return Math.max(top + 9, ceiling - 5);
  };
  return { labelYOf };
}

const GOAL_TEXT_W = 110;   // "GUNLUK HEDEF 150" yaklasik genisligi
const DUR_TEXT_W = 40;     // "2s 45d"
const TEXT_H = 12;

// Hedef yazisinin yeri. Eskiden yalniz BUGUNUN etiketine bakiliyordu; yazi
// sagdaki ~110px boyunca uzandigi icin hedefe yakin diger gunlerin sure
// etiketiyle ("2s 45d") ust uste biniyordu. Sirayla sag-ust, sag-alt,
// sol-ust denenir; hicbir etiket ya da cubukla cakismayan ilki secilir.
// Hicbiri olmazsa null: kesikli cizgi kalir, yazi cizilmez.
export function goalLabelPlacement({ week, goalY, yOf, labelYOf, slot, bottom, width = CHART_W }) {
  if (goalY == null) return null;
  const boxes = [];
  (week.days || []).forEach((d, i) => {
    const cx = EFFORT_PAD_LEFT + slot * i + slot / 2;
    const barTop = yOf(d.questions || 0);
    if ((d.questions || 0) > 0) boxes.push({ x1: cx - slot / 4, x2: cx + slot / 4, y1: barTop, y2: bottom });
    if ((d.minutes || 0) > 0) {
      const ly = labelYOf(i, barTop);
      boxes.push({ x1: cx - DUR_TEXT_W / 2, x2: cx + DUR_TEXT_W / 2, y1: ly - TEXT_H + 2, y2: ly + 2 });
    }
  });
  const right = width - PAD_RIGHT;
  const candidates = [
    { x: right, y: goalY - 7, anchor: "end" },
    { x: right, y: goalY + 14, anchor: "end" },
    { x: EFFORT_PAD_LEFT + 2, y: goalY - 7, anchor: "start" },
  ];
  return candidates.find((c) => {
    const x1 = c.anchor === "end" ? c.x - GOAL_TEXT_W : c.x;
    const box = { x1, x2: x1 + GOAL_TEXT_W, y1: c.y - TEXT_H + 2, y2: c.y + 2 };
    return !boxes.some((b) => b.x1 < box.x2 && box.x1 < b.x2 && b.y1 < box.y2 && box.y1 < b.y2);
  }) || null;
}
