import { useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useAppDispatch } from "../store/hooks";
import { setTrials } from "../store/slices/trialSlice";
import { setTodayLogs, setStreak } from "../store/slices/studyLogSlice";
import { getTrials } from "../supabase/trials";
import { getStudyLogsByDate } from "../supabase/studyLogs";
import { getStreak } from "../supabase/streaks";

export function useDataSync() {
  const { user } = useAuth();
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!user?.id || user.id === "dev") return;

    let cancelled = false;

    async function load() {
      try {
        const [trials, streak, todayLogs] = await Promise.allSettled([
          getTrials(user.id),
          getStreak(user.id),
          getStudyLogsByDate(user.id, new Date().toISOString().split("T")[0]),
        ]);

        if (cancelled) return;

        if (trials.status === "fulfilled" && trials.value) {
          const mapped = trials.value.map((t) => {
            const subjects = {};
            (t.trial_subjects || []).forEach((s) => {
              subjects[s.subject] = {
                correct: s.correct_count,
                wrong: s.wrong_count,
                net: s.net,
              };
            });
            return {
              id: t.id,
              date: t.trial_date,
              totalNet: parseFloat(t.total_net) || 0,
              subjects,
            };
          });
          dispatch(setTrials(mapped));
        }

        if (streak.status === "fulfilled" && streak.value) {
          dispatch(setStreak(streak.value.current_streak || 0));
        }

        if (todayLogs.status === "fulfilled" && todayLogs.value) {
          const mapped = todayLogs.value.map((l) => ({
            id: l.id,
            subject: l.subject,
            topic: l.topic,
            questionCount: l.question_count,
            duration: l.duration_minutes,
            study_date: l.study_date,
          }));
          dispatch(setTodayLogs(mapped));
        }
      } catch (_) {}
    }

    load();
    return () => { cancelled = true; };
  }, [user?.id, dispatch]);
}
