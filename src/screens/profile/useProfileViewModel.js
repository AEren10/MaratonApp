import { useMemo } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useExam } from "../../contexts/ExamContext";
import { useAppSelector } from "../../store/hooks";
import { selectLevel, selectStats, selectWeeklyXP } from "../../store/slices/gamificationSlice";
import { selectStreak, selectLongestStreak } from "../../store/slices/studyLogSlice";
import { getTier, getNextTier } from "../../constants/league";

export function useProfileViewModel(C) {
  const { user, loading: authLoading } = useAuth();
  const { examType, field, targetDepartment } = useExam();
  const level = useAppSelector(selectLevel);
  const gStats = useAppSelector(selectStats);
  const streak = useAppSelector(selectStreak);
  const longestStreak = useAppSelector(selectLongestStreak);
  const weeklyXP = useAppSelector(selectWeeklyXP);

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
  const leagueNextTier = getNextTier(weeklyXP);

  return {
    careerStats,
    displayName,
    examLabel,
    leagueNextTier,
    leagueTier,
    level,
    longestStreak,
    streak,
    targetDepartment,
    weeklyXP,
    loading: authLoading,
  };
}
