import { useEffect, useMemo, useState, useCallback } from "react";
import { useAuth } from "../contexts/AuthContext";
import { getStudyLogs } from "../supabase/studyLogs";
import { dateKey, startOfWeek, todayTR } from "../lib/dateUtils";
import { getSubjectByKey } from "../themes/subjects";

const DAY_LETTERS = ["PZT", "SAL", "ÇAR", "PER", "CUM", "CMT", "PAZ"];
const MONTHS_TR = [
  "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
  "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık",
];

function weekRangeLabel(start) {
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  const sameMonth = start.getMonth() === end.getMonth();
  const monthLabel = MONTHS_TR[end.getMonth()];
  return sameMonth
    ? `${start.getDate()} – ${end.getDate()} ${monthLabel}`
    : `${start.getDate()} ${MONTHS_TR[start.getMonth()]} – ${end.getDate()} ${monthLabel}`;
}

// Programım (Program Hub) haftalik gorunumunun veri katmani. Gercek
// calisma kayitlarindan (study_logs) beslenir; "durak" kavrami gunluk
// plan motoruna ozgu oldugu icin haftalik geriye donuk hesaplanamiyor —
// bu yuzden hero metrik "aktif gun" ve "soru/dakika" gibi dogrulanabilir
// degerlere dayanir.
export function useWeekProgram({ initialOffset = 0 } = {}) {
  const { user } = useAuth();
  const todayKey = todayTR();
  const [weekOffset, setWeekOffset] = useState(initialOffset);

  const weekStart = useMemo(() => {
    const base = startOfWeek();
    if (weekOffset === 0) return base;
    const d = new Date(base);
    d.setDate(d.getDate() + weekOffset * 7);
    return d;
  }, [todayKey, weekOffset]);

  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(() => (weekOffset === 0 ? todayKey : dateKey(weekStart)));

  useEffect(() => {
    if (weekOffset === 0) {
      setSelectedDate(todayKey);
    } else {
      setSelectedDate(dateKey(weekStart));
    }
  }, [weekOffset, weekStart, todayKey]);

  const prevWeek = useCallback(() => setWeekOffset((o) => o - 1), []);
  const nextWeek = useCallback(() => setWeekOffset((o) => o + 1), []);

  const load = useCallback(() => {
    if (!user?.id || user.id === "dev") { setLoading(false); return Promise.resolve(); }
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    setLoading(true);
    return getStudyLogs(user.id, { from: dateKey(weekStart), to: dateKey(weekEnd) })
      .then((rows) => setLogs(rows || []))
      .catch(() => setLogs([]))
      .finally(() => setLoading(false));
  }, [user?.id, weekStart]);

  useEffect(() => { load(); }, [load]);

  const days = useMemo(() => DAY_LETTERS.map((letter, i) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    const key = dateKey(d);
    const dayLogs = logs.filter((l) => l.study_date === key);
    return {
      key,
      letter,
      dayNum: d.getDate(),
      isToday: key === todayKey,
      isFuture: key > todayKey,
      active: dayLogs.length > 0,
      minutes: dayLogs.reduce((s, l) => s + (l.duration ?? l.duration_minutes ?? 0), 0),
    };
  }), [weekStart, logs, todayKey]);

  const totalMinutes = useMemo(() => logs.reduce((s, l) => s + (l.duration ?? l.duration_minutes ?? 0), 0), [logs]);
  const totalQuestions = useMemo(() => logs.reduce((s, l) => s + (l.questionCount ?? l.question_count ?? 0), 0), [logs]);
  const activeDaysCount = days.filter((d) => d.active).length;

  const selectedDay = days.find((d) => d.key === selectedDate) || days[0];

  const selectedDayLogs = useMemo(() => logs
    .filter((l) => l.study_date === selectedDate)
    .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
    .map((l) => {
      const subj = getSubjectByKey(l.subject);
      const time = l.created_at
        ? new Date(l.created_at).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })
        : null;
      return {
        id: l.id,
        time,
        subjectKey: l.subject,
        subjectLabel: subj?.label || l.subject || "Genel",
        topic: l.topic,
        minutes: l.duration ?? l.duration_minutes ?? 0,
      };
    }), [logs, selectedDate]);

  return {
    loading,
    weekRangeLabel: weekRangeLabel(weekStart),
    days,
    totalMinutes,
    totalQuestions,
    activeDaysCount,
    selectedDate,
    setSelectedDate,
    selectedDay,
    selectedDayLogs,
    weekOffset,
    setWeekOffset,
    prevWeek,
    nextWeek,
    refresh: load,
  };
}
