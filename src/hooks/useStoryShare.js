import { useCallback, useMemo, useState } from "react";
import { useSelector } from "react-redux";

import { useExam } from "../contexts/ExamContext";
import { selectStreak, selectTodayLogs } from "../store/slices/studyLogSlice";
import { selectTrials } from "../store/slices/trialSlice";
import { getSubjectByKey } from "../themes/subjects";
import { useWeeklyReport } from "./useWeeklyReport";
import { buildStoryVariants, STORY_MOMENT } from "../domain/share/storySticker";
import { shareStoryToInstagram, saveStoryToGallery, STORY_SHARE } from "../lib/storyShare";
import { pickStoryPhoto } from "../lib/storyPhoto";
import { STORY_BG } from "../domain/share/storySticker";

const EXAM_NAME = { tyt: "YKS", ayt: "YKS", lgs: "LGS" };

function examLabel(examType, examDate) {
  if (!examDate) return null;
  const d = new Date(examDate);
  if (Number.isNaN(d.getTime())) return null;
  const name = EXAM_NAME[String(examType || "").toLowerCase()] || "SINAV";
  const day = d.toLocaleDateString("tr-TR", { day: "numeric", month: "long" });
  return `${name} ${d.getFullYear()} · ${day}`;
}

function lastTrialOf(trials) {
  if (!trials?.length) return null;
  const sorted = (trials || [])
    .map((t, index) => ({ trial: t, orderIndex: index }))
    .sort((a, b) => {
      const diff = new Date(b.trial.date) - new Date(a.trial.date);
      if (diff !== 0) return diff;
      const timeA = a.trial.created_at || a.trial.createdAt ? new Date(a.trial.created_at || a.trial.createdAt).getTime() : (Number(a.trial.id) > 1e9 ? Number(a.trial.id) : 0);
      const timeB = b.trial.created_at || b.trial.createdAt ? new Date(b.trial.created_at || b.trial.createdAt).getTime() : (Number(b.trial.id) > 1e9 ? Number(b.trial.id) : 0);
      if (timeA !== timeB) return timeB - timeA;
      return a.orderIndex - b.orderIndex;
    })
    .map(({ trial }) => trial);
  const latest = sorted[0];
  const net = Number(latest?.totalNet ?? latest?.total_net);
  if (!Number.isFinite(net)) return null;

  const prev = sorted.find((t, i) => i > 0 && t.trialType === latest.trialType);
  const prevNet = Number(prev?.totalNet ?? prev?.total_net);

  const subjects = Object.entries(latest.subjects || {})
    .map(([key, v]) => ({ key: getSubjectByKey(key)?.label || key, net: Number(v?.net) }))
    .filter((s) => Number.isFinite(s.net))
    .sort((a, b) => b.net - a.net);

  return {
    net,
    delta: Number.isFinite(prevNet) ? net - prevNet : null,
    label: latest.name || latest.trialType || null,
    subjects,
  };
}

/**
 * Story paylasim blogunun tek veri kaynagi. Ham veriyi toplar, saf katmana
 * verir, geri donen varyantlari ve paylasim eylemlerini sunar.
 */
export function useStoryShare(moment = STORY_MOMENT.GENERIC) {
  const report = useWeeklyReport();
  const streak = useSelector(selectStreak);
  const todayLogs = useSelector(selectTodayLogs);
  const trials = useSelector(selectTrials);
  const { examType, examDate, daysUntilExam } = useExam();

  const [index, setIndex] = useState(0);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);
  // Fotografli varyantin arka plani: { uri, share } ya da null.
  const [photo, setPhoto] = useState(null);

  const ctx = useMemo(() => {
    const logs = todayLogs || [];
    const questions = logs.reduce((n, l) => n + (l.questionCount || 0), 0);
    const correct = logs.reduce((n, l) => n + (l.correctCount || 0), 0);
    const heat = report.dailyHeatmap || [];

    return {
      today: {
        questions,
        minutes: logs.reduce((n, l) => n + (l.duration || 0), 0),
        accuracy: questions > 0 ? Math.round((correct / questions) * 100) : null,
        stops: logs.length || null,
      },
      week: {
        questions: report.totalQuestions || 0,
        series: heat.map((d) => d.questions),
        dayLabels: heat.map((d) => String(d.label || "").slice(0, 1).toLocaleUpperCase("tr")),
      },
      streak: streak || 0,
      daysToExam: daysUntilExam ?? null,
      examLabel: examLabel(examType, examDate),
      lastTrial: lastTrialOf(trials),
    };
  }, [todayLogs, report.dailyHeatmap, report.totalQuestions, streak, daysUntilExam, examType, examDate, trials]);

  const variants = useMemo(() => buildStoryVariants(ctx, moment), [ctx, moment]);
  const selected = variants[Math.min(index, Math.max(0, variants.length - 1))] || null;

  const run = useCallback(async (action, ref) => {
    if (busy) return null;
    setBusy(true);
    setResult(null);
    const outcome = await action(ref);
    setBusy(false);
    setResult(outcome);
    return outcome;
  }, [busy]);

  return {
    variants,
    selected,
    select: setIndex,
    selectedIndex: index,
    busy,
    result,
    clearResult: () => setResult(null),
    photo,
    pickPhoto: async (source) => { const p = await pickStoryPhoto(source); if (p) setPhoto(p); return p; },
    clearPhoto: () => setPhoto(null),
    // STRAVA MODELI: etiket HER ZAMAN seffaf (overlay) olarak yakalanir.
    // Fotograf secildiyse: sticker + arka plan dogrudan Instagram'a gider
    // (kullanici yerlesmis halde gorur, tasiyip buyutebilir).
    // Fotograf secilmediyse: seffaf etiket panoya kopyalanir, Instagram story
    // kamerasi acilir — kullanici kendi karesini cekerken yapistirir.
    share: async (overlayRef) => {
      // Fotograf varsa dogrudan gonder (Strava'nin birincil yolu)
      const bg = photo;
      if (bg) {
        return run((ref) => shareStoryToInstagram(ref, { backgroundImage: bg.share }), overlayRef);
      }
      // Fotograf yoksa: panoya kopyala + Instagram kamera ac (Strava fallback)
      return run(shareStoryToInstagram, overlayRef);
    },
    save: (ref) => run(saveStoryToGallery, ref),
    loading: report.loading,
    STORY_SHARE,
  };
}
