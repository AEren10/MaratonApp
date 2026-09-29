import { useEffect, useMemo } from "react";
import { useSelector } from "react-redux";
import { selectTrials } from "../store/slices/trialSlice";
import { examSeries as buildExamSeries, showExamSeries } from "../domain/analysis/examSeries";
import { selectWeeklyMinutesGoal } from "../store/slices/goalsSlice";
import { useForecastTarget } from "./useForecastTarget";
import { useExam } from "../contexts/ExamContext";
import { buildPlanTaskKey } from "../domain/plan/planTaskIdentity";
import { useStudyRoute } from "./useStudyRoute";
import { useTodayKey } from "./useTodayKey";
import { getEffectiveRouteStopStatus, ROUTE_STOP_STATUS } from "../domain/route/stopStatus";
import { buildComebackRecommendation } from "../domain/route/comebackRecommendation";
import { routeDeclaredPath } from "../domain/route/declaredPath";
import { baselineTarget } from "../domain/forecast/forecastTarget";
import { forecastSentence, chartAxisLabels } from "../domain/route/forecastSentence";
import { buildWeeklyEffort } from "../domain/home/weeklyEffort";
import { syncRouteWidget, syncTodayWidget, syncWeekWidget } from "../lib/widgetSync";
import { updateReminderContent } from "../lib/notifications";
import { todayTR } from "../lib/dateUtils";
import { useAuth } from "../contexts/AuthContext";

// Hero'nun ihtiyac duydugu her seyi tek yerden turetir: rota erisimi, grafik
// verisi, ozet seridi ve CTA. Ekran dosyasi sadece render eder.
export function useHomeHeroData({ solvedToday, dailyGoal, generatedTasks, todayStops = [], weekLogs, previousQuestions = null, streak = 0 }) {
  const { targetNet, targetNetTYT, baselineNet, daysUntilExam, examType, examDate } = useExam();
  const weeklyMinutesGoal = useSelector(selectWeeklyMinutesGoal);
  const trials = useSelector(selectTrials);
  const { user } = useAuth();
  // Iki sinavli kullanicida ana sayfa grafiginin TYT · AYT sayfasi.
  const examSeries = useMemo(() => {
    if (examType !== "tyt_ayt" && examType !== "dil") return null;
    const series = buildExamSeries(trials);
    return showExamSeries(series) ? series : null;
  }, [examType, trials]);
  const {
    weeks,
    forecast,
    forecastTypes,
    debt,
    hasRouteAccess,
    routeAccessLoading,
    isPaused,
    pausedAt,
  } = useStudyRoute();

  const examTarget = useForecastTarget(forecastTypes);

  const stopCounts = useMemo(() => {
    let total = 0;
    let done = 0;
    for (const week of weeks || []) {
      for (const stop of week.stops || []) {
        total += 1;
        if (getEffectiveRouteStopStatus(stop.lifecycleStatus) === ROUTE_STOP_STATUS.COMPLETED) done += 1;
      }
    }
    return { total, done };
  }, [weeks]);

  // Rota dondurulduginda "kacinci durakta birakildi" bilgisi - hero'nun
  // "Rota Donduruldu" varyaminda kullaniliyor. Duraklar hafta-hafta duz
  // sirali oldugundan ilk ACTIVE durak, birakilan noktadir.
  const frozenAtStop = useMemo(() => {
    if (!isPaused) return null;
    let index = 0;
    for (const week of weeks || []) {
      for (const stop of week.stops || []) {
        index += 1;
        if (getEffectiveRouteStopStatus(stop.lifecycleStatus) === ROUTE_STOP_STATUS.ACTIVE) {
          return { number: index, subjectLabel: stop.subjectLabel, topic: stop.topic };
        }
      }
    }
    return null;
  }, [isPaused, weeks]);

  const chartData = useMemo(() => {
    if (!forecast?.dataPoints?.length) return null;
    const stops = forecast.dataPoints.map((p) => ({
      y: p.net,
      status: ROUTE_STOP_STATUS.COMPLETED,
      label: p.dateStr,
    }));
    const todayIndex = stops.length - 1;
    // Az sayida deneme dususte olunca dogrusal uzatma sinav gunune 0 net
    // cikariyordu ("TAHMIN 0 · hedefin 126 net altinda"). Anlamsiz ve moral
    // bozucu: son netin yarisinin altina dusen tahmin gosterilmez.
    const lastNet = forecast.dataPoints[todayIndex]?.net;
    const plausible = Number.isFinite(forecast.projected)
      && forecast.projected > 0
      && (!Number.isFinite(lastNet) || forecast.projected >= lastNet * 0.5);
    const projection = plausible ? [forecast.projected] : [];
    const band = projection.length
      ? { upper: [forecast.range?.high ?? forecast.projected], lower: [forecast.range?.low ?? forecast.projected] }
      : undefined;
    // Hattin iki ucu ve zaman ekseni adlandiriliyor — tasarimda grafik
    // etiketsiz degil: "BUGÜN", "TAHMİN 71", ve altta uc tarih.
    return {
      stops,
      todayIndex,
      projection,
      band,
      todayLabel: "BUGÜN",
      endLabel: projection.length ? `TAHMİN ${Math.round(forecast.projected)}` : null,
      axisLabels: chartAxisLabels({
        firstDate: forecast.dataPoints[0]?.date,
        examDate,
      }),
      sentence: plausible
        ? forecastSentence({ projected: forecast.projected, target: examTarget.target, label: examTarget.label })
        : "Tahmin için birkaç deneme daha gerekiyor.",
    };
  }, [forecast, examDate, examTarget]);

  // Olculmus tahmin (3 deneme) gelene kadar grafik bos kalmasin: kurulumda
  // kullanicinin KENDI girdigi baslangic ve hedef netini gosteririz.
  const declared = useMemo(
    // Baslangic TYT seviye testinden: hedefi de TYT (toplam degil).
    () => routeDeclaredPath({
      baselineNet,
      targetNet: baselineTarget({ examType, targetNet, targetNetTYT }).target,
      daysLeft: daysUntilExam,
      stopCount: stopCounts.total,
    }),
    [baselineNet, examType, targetNet, targetNetTYT, daysUntilExam, stopCounts.total],
  );

  // Beyan hattinin zaman ekseni: bugun -> sinav gunu. Olculmus grafikteki
  // eksenle ayni bicim, boylece veri gelince serit yerinden oynamiyor.
  const declaredAxis = useMemo(
    () => chartAxisLabels({ firstDate: new Date(), examDate }),
    [examDate],
  );

  // Haftalik emek: deneme GEREKTIRMEZ, her calisilan gun degisir. Grafik
  // alanindaki ilk sayfa bu; rota ikinci sayfada.
  const weeklyEffort = useMemo(
    () => buildWeeklyEffort({ logs: weekLogs || [], dailyGoal, previousQuestions }),
    [weekLogs, dailyGoal, previousQuestions],
  );
  // Gun degisince (gece yarisi / uygulama one gelince) yeniden hesaplanir.
  const todayKey = useTodayKey();
  const todayIndex = useMemo(() => {
    const js = new Date().getDay();
    return js === 0 ? 6 : js - 1;
  }, [todayKey]);

  // Bugun biten duraklar planin BASINDA duruyor; ana buton bitmis duragi
  // gostermesin diye ilk ACIK gorev alinir (ŞİMDİ karti ile ayni kural).
  const listKnown = Array.isArray(todayStops) && todayStops.length > 0;
  const openIds = new Set((Array.isArray(todayStops) ? todayStops : []).filter((i) => !i.completed).map((i) => i.id));
  const nextTask = (generatedTasks || []).find((task) => !task.completed
    && (!listKnown || openIds.has(task.planTaskKey || buildPlanTaskKey(task)))) || null;

  // Ana ekran widget'lari ayni verilerden besleniyor. Burada yaziliyor cunku
  // veri burada doguyor; ekran dosyasinin haberi olmasina gerek yok.
  // nextTask'tan SONRA: yukarida olsaydi const henuz tanimli olmazdi.
  useEffect(() => {
    syncWeekWidget({ week: weeklyEffort, solved: solvedToday });
    syncTodayWidget({
      solved: solvedToday,
      goal: dailyGoal,
      streak,
      // Widget'ta BITEN isler de var: tasarim ustu cizili satir istiyor,
      // generatedTasks ise yalnizca bitmemisleri tutuyor (planEngine eliyor).
      // Bu yuzden kaynak stops.
      stops: todayStops,
      weeklyMinutesGoal,
      // Konu adi bos olabiliyor; birlestirmeden once eleniyor, yoksa
      // widget'ta "Türkçe · null" yaziyordu.
      nextStop: nextTask
        ? [nextTask.subjectLabel, nextTask.topicLabel].filter(Boolean).join(" · ")
        : null,
      week: weeklyEffort,
    });
    syncRouteWidget({ examDate, chart: chartData, target: examTarget.target });
    // Bildirimler de ayni gunu anlatsin: gunluk hatirlatma ve Pazar karnesi.
    const openStops = (Array.isArray(todayStops) ? todayStops : []).filter((i) => !i.completed);
    updateReminderContent({
      todayPlan: {
        day: todayTR(),
        open: openStops.length,
        next: nextTask ? { label: [nextTask.subjectLabel, nextTask.topicLabel].filter(Boolean).join(" · "), minutes: nextTask.estimatedMinutes || 0 } : null,
      },
      weeklyVars: { questions: weeklyEffort?.totalQuestions || 0, minutes: weeklyEffort?.totalMinutes || 0 },
    }, user?.id && user.id !== "dev" ? user.id : null);
  }, [weeklyEffort, solvedToday, dailyGoal, streak, nextTask, todayStops, weeklyMinutesGoal, examDate, chartData, examTarget.target, user?.id]);
  const comebackRecommendation = buildComebackRecommendation(nextTask);
  // Ana buton yalniz rota gorevlerine bakiyordu: rota yokken listede
  // baslanabilir bir durak (kullanicinin ekledigi ya da oneri) olsa bile
  // "Ilk duragini ekle" diyordu. Artik ilk acik durak da sayilir.
  const openStop = Array.isArray(todayStops) ? todayStops.find((item) => !item.completed) : null;
  const ctaTask = nextTask || openStop || null;
  const ctaSubtitle = nextTask
    ? `${nextTask.subjectLabel} · ${nextTask.topicLabel}${nextTask.estimatedMinutes ? ` · ${nextTask.estimatedMinutes} dk` : ""}`
    : openStop
      ? `${openStop.label}${openStop.minutes ? ` · ${openStop.minutes} dk` : ""}`
      : null;

  const remainingToGoal = Math.max(0, (dailyGoal || 0) - (solvedToday || 0));

  return {
    solvedToday,
    dailyGoal,
    remainingToGoal,
    daysUntilExam,
    examType,
    examDate,
    targetNet,
    chartTarget: examTarget.target,
    hasRouteAccess,
    routeAccessLoading,
    isPaused,
    frozenAtStop,
    chartData,
    examSeries,
    declared,
    declaredAxis,
    weeklyEffort,
    todayIndex,
    stopCounts,
    // Tasarim borcu SAAT gosteriyor: "12 sa borc". Kaynak haftalik toplam
    // degil, overdueStops'un buldugu tamamlanmamis route duraklari.
    debtHours: debt?.totalMinutes ? Math.round(debt.totalMinutes / 60) : 0,
    // Rota kac gundur donuk. pausedAt yoksa null kalir, cumle sayisiz yazilir.
    frozenDays: pausedAt
      ? Math.max(0, Math.floor((Date.now() - new Date(pausedAt).getTime()) / 86400000))
      : null,
    hasDebt: !!debt?.hasDebt,
    comebackRecommendation,
    nextTask: ctaTask,
    // Gunun listesi dolu ve hepsi bitti: ana buton 'Gunu kapattin'.
    dayDone: !ctaTask && Array.isArray(todayStops) && todayStops.length > 0 && todayStops.every((i) => i.completed),
    ctaSubtitle,
  };
}
