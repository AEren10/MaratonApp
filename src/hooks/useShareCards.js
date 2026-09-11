import { useMemo } from "react";
import { useSelector } from "react-redux";

import { buildShareCards, availableShareCards, getShareCard } from "../domain/share/shareCards";
import { useWeeklyReport } from "./useWeeklyReport";
import { useStudyRoute } from "./useStudyRoute";
import { selectStreak, selectTodayLogs } from "../store/slices/studyLogSlice";
import { selectRetentionData } from "../store/slices/gamificationSlice";
import { getSubjectByKey } from "../themes/subjects";
import { dateKey, differenceInDays } from "../lib/dateUtils";

/**
 * Story paylaşım kartlarının veri kaynağı.
 *
 * TASARIM NOTU (AKIŞ 12B — sekiz Story kartı):
 * Bu hook yalnızca İÇERİK üretir; hiçbir görsel karar içermez. Tasarım
 * geldiğinde tek bir render bileşeni yazılıp sekizini de aynı şekille
 * tüketebilirsin:
 *
 *   const { cards } = useShareCards();
 *   cards.map(c => <StoryCard key={c.id} {...c} />)
 *
 * Her kart: { id, title, heroValue, heroLabel, stats[], caption, available }
 * `available: false` olanlar zaten `cards`'ta yok — verisi olmayan kartı
 * boş göstermektense hiç göstermiyoruz.
 */
export function useShareCards() {
  const report = useWeeklyReport();
  const streak = useSelector(selectStreak);
  const todayLogs = useSelector(selectTodayLogs);
  const retention = useSelector(selectRetentionData);
  const { route, currentWeek } = useStudyRoute({ persist: false });

  const today = useMemo(() => {
    const logs = todayLogs || [];
    const subjects = [...new Set(logs.map((l) => l.subject).filter(Boolean))]
      .map((k) => getSubjectByKey(k)?.label || k);
    return {
      minutes: logs.reduce((n, l) => n + (l.duration || l.duration_minutes || 0), 0),
      questions: logs.reduce((n, l) => n + (l.questionCount || l.question_count || 0), 0),
      subjects,
    };
  }, [todayLogs]);

  // Geri dönüş: son aktiflikten bugüne kaç gün geçmişti.
  const comebackAfterDays = useMemo(() => {
    const last = retention?.lastActive;
    if (!last) return null;
    const gap = differenceInDays(new Date(), new Date(last));
    return gap >= 2 ? gap : null;
  }, [retention?.lastActive]);

  const ctx = useMemo(() => ({
    today,
    week: {
      minutes: report.totalMinutes || 0,
      questions: report.totalQuestions || 0,
      activeDays: report.activeDays || 0,
      // useWeeklyReport netleri STRING döndürüyor (toFixed(1)); sayıya çevir.
      // Önceki haftanın ortalaması ayrıca verilmiyor, netDelta'dan türetiliyor.
      netAvg: report.weekNetAvg != null ? Number(report.weekNetAvg) : null,
      prevNetAvg: report.hasPrev && report.weekNetAvg != null && report.netDelta != null
        ? Number(report.weekNetAvg) - Number(report.netDelta)
        : null,
      bestDay: null, // useWeeklyReport bu bilgiyi vermiyor
    },
    streak: streak || 0,
    comebackAfterDays,
    route: {
      currentWeek: currentWeek
        ? {
            plannedQuestions: currentWeek.plannedQuestions || 0,
            // Bu haftanın gerçekleşeni: haftalık rapordan.
            completedQuestions: report.totalQuestions || 0,
          }
        : null,
      nextStop: currentWeek?.stops?.[0]
        ? {
            topic: currentWeek.stops[0].topic,
            subjectLabel: currentWeek.stops[0].subjectLabel,
            questions: currentWeek.stops[0].cost?.questions,
            difficulty: currentWeek.stops[0].cost?.difficulty,
          }
        : null,
      completedStop: null, // ekran, tamamlanan durağı parametre olarak geçer
      progressPct: route?.totals?.progress || 0,
      movedTopics: route?.totals?.mastered || 0,
    },
    generatedOn: dateKey(new Date()),
  }), [today, report, streak, comebackAfterDays, currentWeek, route]);

  const cards = useMemo(() => availableShareCards(ctx), [ctx]);
  const allCards = useMemo(() => buildShareCards(ctx), [ctx]);

  return {
    cards,          // gösterilebilir olanlar
    allCards,       // hepsi (available bayrağıyla)
    context: ctx,   // tek kart için özelleştirme gerekirse
    getCard: (id, override) => getShareCard(id, override ? { ...ctx, ...override } : ctx),
    // Kartların altındaki veri kaynağı haftalık raporun ta kendisi —
    // yükleniyor/hata durumu ekranın state'lerini bundan okur.
    loading: report.loading,
    error: report.error,
  };
}
