import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { selectTrials } from "../store/slices/trialSlice";
import { selectTodayLogs, selectStreak } from "../store/slices/studyLogSlice";
import { useExam } from "../contexts/ExamContext";
import { getAISuggestions } from "../lib/aiSuggestions";
import { trialSubjectsToCurriculumWeakAreas } from "../screens/trial/trialKeyMap";

export function useAISuggestions() {
  const trials = useSelector(selectTrials);
  const todayLogs = useSelector(selectTodayLogs);
  const streak = useSelector(selectStreak);
  const { examType, field } = useExam();

  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);

      // Build weakAreas keyed by trial subject keys (tyt_*/ayt_*)
      const weakAreasTrialKeyed = {};
      if (trials.length > 0) {
        Object.entries(trials[0].subjects || {}).forEach(([key, s]) => {
          const total = (s.correct || 0) + (s.wrong || 0);
          if (total > 0) {
            weakAreasTrialKeyed[key] = Math.round(((s.correct || 0) / total) * 100);
          }
        });
      }

      const examLabel = `${examType?.toUpperCase() || "TYT"}${field ? "/" + field : ""}`;
      try {
        const data = await getAISuggestions({
          trials,
          todayLogs,
          streak,
          weakAreas: weakAreasTrialKeyed,
          examLabel,
        });
        if (!cancelled) {
          setSuggestions(data || []);
          setLoading(false);
        }
      } catch (e) {
        if (!cancelled) { setLoading(false); setError(e); }
      }
    }
    load();
    return () => { cancelled = true; };
  }, [trials, todayLogs, streak, examType, field]);

  return { suggestions, loading, error };
}
