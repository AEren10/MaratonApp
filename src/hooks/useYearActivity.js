import { useEffect, useState, useCallback } from "react";
import { useAuth } from "../contexts/AuthContext";
import { getStudyLogs } from "../supabase/studyLogs";

const MONTHS = ["OCA", "ŞUB", "MAR", "NİS", "MAY", "HAZ", "TEM", "AĞU", "EYL", "EKİ", "KAS", "ARA"];

// Yildaki her ayin aktif gun sayisini 0-4 yogunluk kademesine indirger.
//
// Esikler AY olcegine gore: bir ay ~30 gun. Gunluk izgaranin esikleri
// (0/1/2/3-4/5+) burada kullanilamaz -- 5 gun calisan ile 25 gun calisan
// ayni tavana yapisir ve grafik ayirt etmez hale gelirdi.
function levelFor(count) {
  if (count <= 0) return 0;
  if (count <= 4) return 1;     // baslangic
  if (count <= 11) return 2;    // haftada ~1-2 gun
  if (count <= 19) return 3;    // haftada ~3-4 gun
  return 4;                     // neredeyse her gun
}

export function useYearActivity() {
  const { user } = useAuth();
  const [months, setMonths] = useState(() => MONTHS.map((label) => ({ label, count: 0, level: 0 })));
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user?.id || user.id === "dev") { setLoading(false); return; }
    const now = new Date();
    const year = now.getFullYear();
    const from = `${year}-01-01`;
    const to = `${year}-12-31`;
    try {
      const logs = await getStudyLogs(user.id, { from, to });
      const daysByMonth = Array.from({ length: 12 }, () => new Set());
      logs.forEach((l) => {
        const d = (l.study_date || l.created_at || "").slice(0, 10);
        if (!d) return;
        const m = Number(d.slice(5, 7)) - 1;
        if (m >= 0 && m < 12) daysByMonth[m].add(d);
      });
      setMonths(MONTHS.map((label, i) => {
        const count = daysByMonth[i].size;
        return { label, count, level: levelFor(count) };
      }));
    } catch {
      // sessiz kal — grafik bos gorunur, ekran cokmez
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => { load(); }, [load]);

  const now = new Date();
  const currentMonthIndex = now.getMonth();
  const activeThisMonth = months[currentMonthIndex]?.count || 0;
  const currentMonthLabel = MONTHS[currentMonthIndex];

  return { months, loading, currentMonthIndex, activeThisMonth, currentMonthLabel, year: now.getFullYear() };
}
