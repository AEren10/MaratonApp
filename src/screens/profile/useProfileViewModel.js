import { useMemo } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useExam } from "../../contexts/ExamContext";
import { useAppSelector } from "../../store/hooks";
import { selectLevel, selectStats, selectWeeklyXP } from "../../store/slices/gamificationSlice";
import { selectStreak, selectLongestStreak } from "../../store/slices/studyLogSlice";
import { selectTrials } from "../../store/slices/trialSlice";
import { useCurriculum } from "../../hooks/useCurriculum";
import { subjectColorOf } from "../../themes/subjectPalette";
import { getTier, getNextTier } from "../../constants/league";

export function useProfileViewModel(C) {
  const { user, loading: authLoading } = useAuth();
  const { examType, field, targetDepartment } = useExam();
  const { subjects = [] } = useCurriculum();
  const level = useAppSelector(selectLevel);
  const gStats = useAppSelector(selectStats);
  const streak = useAppSelector(selectStreak);
  const longestStreak = useAppSelector(selectLongestStreak);
  const weeklyXP = useAppSelector(selectWeeklyXP);
  const trials = useAppSelector(selectTrials);

  const displayName = user?.user_metadata?.name || user?.email?.split("@")[0] || "Kullanıcı";

  const examLabel = useMemo(() => {
    if (examType === "lgs") return "LGS";
    if (examType === "tyt") return "SADECE TYT";
    if (examType === "dil") return "YKS DİL";
    if (field === "sayisal") return "TYT + SAY";
    if (field === "ea") return "TYT + EA";
    if (field === "sozel") return "TYT + SÖZ";
    return "YKS";
  }, [examType, field]);

  const careerStats = useMemo(() => {
    return {
      totalQuestions: gStats?.totalQuestions || 0,
      totalHours: Math.floor((gStats?.totalMinutes || 0) / 60),
    };
  }, [gStats]);

  const leagueTier = getTier(weeklyXP);
  const leagueNextTier = getNextTier(leagueTier);

  const strengths = useMemo(() => {
    if (!trials || trials.length === 0) return [];
    const latest = trials.slice(0, 5);
    const totals = {};
    latest.forEach((t) => {
      Object.entries(t.subjects || {}).forEach(([subj, data]) => {
        if (!totals[subj]) totals[subj] = { correct: 0, total: 0 };
        totals[subj].correct += data.correct || 0;
        totals[subj].total += (data.correct || 0) + (data.wrong || 0) + (data.empty || 0);
      });
    });

    const subjectMap = {};
    subjects.forEach((s) => (subjectMap[s.normName] = s));

    const entries = [];
    Object.entries(totals).forEach(([norm, agg]) => {
      if (agg.total < 5) return;
      const acc = Math.round((agg.correct / agg.total) * 100);
      const subj = subjectMap[norm];
      entries.push({ name: subj?.label || norm, c: subjectColorOf(C, norm), v: acc });
    });
    return entries.sort((a, b) => b.v - a.v).slice(0, 6);
  }, [subjects, trials, C]);

  return {
    careerStats,
    displayName,
    examLabel,
    leagueNextTier,
    leagueTier,
    level,
    longestStreak,
    streak,
    strengths,
    targetDepartment,
    weeklyXP,
    loading: authLoading,
  };
}
