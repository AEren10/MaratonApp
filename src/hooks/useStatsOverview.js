import { useCallback, useEffect, useState } from "react";

import { useAuth } from "../contexts/AuthContext";
import { useExam } from "../contexts/ExamContext";
import { statsOverview } from "../domain/stats/statsOverview";
import { captureError } from "../lib/errorReporting";
import { getStudyTotals } from "../supabase/stats";

export function useStatsOverview() {
  const { user } = useAuth();
  const { examType, field } = useExam();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const reload = useCallback(async () => {
    if (!user?.id) {
      setData(null);
      setError(null);
      return null;
    }
    setLoading(true);
    setError(null);
    try {
      const studyTotals = await getStudyTotals({ examType, field });
      const next = statsOverview({ studyTotals, examType, field });
      setData(next);
      return next;
    } catch (e) {
      setError(e);
      captureError(e, { context: "useStatsOverview" });
      throw e;
    } finally {
      setLoading(false);
    }
  }, [examType, field, user?.id]);

  useEffect(() => {
    reload().catch(() => {});
  }, [reload]);

  return {
    data,
    loading,
    error,
    reload,
    isEmpty: !loading && !error && !data,
  };
}
