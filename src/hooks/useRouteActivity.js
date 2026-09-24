import { useEffect, useState, useCallback } from "react";
import { useAuth } from "../contexts/AuthContext";
import { getStudyLogs } from "../supabase/studyLogs";

const MONTHS_SHORT = ["OCA", "ŞUB", "MAR", "NİS", "MAY", "HAZ", "TEM", "AĞU", "EYL", "EKİ", "KAS", "ARA"];
const MONTHS_FULL = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];
const DAYS_SHORT = ["PZT", "SAL", "ÇAR", "PER", "CUM", "CMT", "PAZ"];

function pad2(n) { return String(n).padStart(2, "0"); }
function fmtIso(d) { return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`; }

function levelForMonth(count) {
  if (count <= 0) return 0;
  if (count <= 4) return 1;
  if (count <= 11) return 2;
  if (count <= 19) return 3;
  return 4;
}

function levelForMonthWeek(count) {
  if (count <= 0) return 0;
  if (count <= 1) return 1;
  if (count <= 3) return 2;
  if (count <= 5) return 3;
  return 4;
}

function levelForDay(questions, count) {
  if (count <= 0) return 0;
  if (questions <= 20) return 1;
  if (questions <= 50) return 2;
  if (questions <= 100) return 3;
  return 4;
}

export function useRouteActivity() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  const load = useCallback(async () => {
    if (!user?.id || user.id === "dev") { setLoading(false); return; }
    const now = new Date();
    const year = now.getFullYear();
    const monthIdx = now.getMonth();
    const todayDay = now.getDate();
    const from = `${year}-01-01`;
    const to = `${year}-12-31`;

    try {
      const logs = await getStudyLogs(user.id, { from, to });

      // 1. YIL HESABI
      const daysByMonth = Array.from({ length: 12 }, () => new Set());
      logs.forEach((l) => {
        const d = (l.study_date || l.created_at || "").slice(0, 10);
        if (!d) return;
        const m = Number(d.slice(5, 7)) - 1;
        if (m >= 0 && m < 12) daysByMonth[m].add(d);
      });
      const yearPoints = MONTHS_SHORT.map((label, i) => {
        const count = daysByMonth[i].size;
        return { label, count, level: levelForMonth(count) };
      });

      // 2. AY HESABI
      const daysInMonth = new Date(year, monthIdx + 1, 0).getDate();
      const numWeeks = daysInMonth > 28 ? 5 : 4;
      const weekBuckets = Array.from({ length: numWeeks }, () => new Set());
      const currentMonthStr = `${year}-${pad2(monthIdx + 1)}`;

      logs.forEach((l) => {
        const d = (l.study_date || l.created_at || "").slice(0, 10);
        if (d.startsWith(currentMonthStr)) {
          const dayNum = Number(d.slice(8, 10));
          const wIdx = Math.min(numWeeks - 1, Math.floor((dayNum - 1) / 7));
          weekBuckets[wIdx].add(d);
        }
      });
      const monthPoints = weekBuckets.map((set, i) => {
        const count = set.size;
        return { label: `${i + 1}. HF`, count, level: levelForMonthWeek(count) };
      });
      const currentWeekIndex = Math.min(numWeeks - 1, Math.floor((todayDay - 1) / 7));

      // 3. HAFTA HESABI
      const dayOfWeek = (now.getDay() + 6) % 7; // Pzt: 0, Paz: 6
      const monday = new Date(year, monthIdx, todayDay - dayOfWeek);
      const weekLogsByDay = Array.from({ length: 7 }, () => ({ count: 0, questions: 0 }));

      logs.forEach((l) => {
        const d = (l.study_date || l.created_at || "").slice(0, 10);
        for (let i = 0; i < 7; i++) {
          const targetDate = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + i);
          if (d === fmtIso(targetDate)) {
            weekLogsByDay[i].count += 1;
            weekLogsByDay[i].questions += l.question_count || 0;
            break;
          }
        }
      });
      const weekPoints = DAYS_SHORT.map((label, i) => {
        const item = weekLogsByDay[i];
        return { label, count: item.count, level: levelForDay(item.questions, item.count) };
      });
      const activeThisWeek = weekLogsByDay.filter((d) => d.count > 0).length;
      const activeThisMonth = daysByMonth[monthIdx].size;

      setData({
        year: {
          title: `YILIN ROTASI · ${year}`,
          rightText: `${activeThisMonth} aktif gün · ${MONTHS_FULL[monthIdx]}`,
          points: yearPoints,
          currentIndex: monthIdx,
        },
        month: {
          title: `AYIN ROTASI · ${MONTHS_FULL[monthIdx].toLocaleUpperCase("tr-TR")}`,
          rightText: `${activeThisMonth} aktif gün · ${MONTHS_FULL[monthIdx]}`,
          points: monthPoints,
          currentIndex: currentWeekIndex,
        },
        week: {
          title: "HAFTANIN ROTASI · BU HAFTA",
          rightText: `${activeThisWeek} aktif gün · Bu Hafta`,
          points: weekPoints,
          currentIndex: dayOfWeek,
        },
      });
    } catch {
      // sessiz kal
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => { load(); }, [load]);

  return { data, loading };
}
