import { CHART_W, EFFORT_PAD_LEFT, PAD_RIGHT } from "../chartStyle";

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
  const todayCx = todayIndex != null ? EFFORT_PAD_LEFT + slot * todayIndex + slot / 2 : null;
  const todayLabelled = todayIndex != null && (week.days[todayIndex]?.minutes || 0) > 0;
  const goalLabelBelow = todayLabelled && todayCx > width - PAD_RIGHT - 110;
  return { labelYOf, goalLabelBelow };
}
