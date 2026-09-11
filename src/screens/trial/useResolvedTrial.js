import { useEffect, useMemo, useState } from "react";

import { getTrialById } from "../../supabase/trials";

// Deep link (`deneme/:id`) yalnızca id taşıyor, trial nesnesi taşımıyor.
// Önce store'dan, yoksa sunucudan çözülür — sessizce yanlış denemeyi
// açmamak için fallback YOK.
export function useResolvedTrial({ trial, linkedId, trials, user }) {
  const [fetchedTrial, setFetchedTrial] = useState(null);

  useEffect(() => {
    if (trial || !linkedId || !user?.id) return;
    if (trials.some((t) => String(t.id) === String(linkedId))) return;
    let cancelled = false;
    getTrialById(linkedId, user.id)
      .then((t) => { if (!cancelled && t) setFetchedTrial(t); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [trial, linkedId, user?.id, trials]);

  return useMemo(() => {
    const wanted = trial?.id ?? linkedId;
    const sorted = [...trials].sort((a, b) => new Date(b.date) - new Date(a.date));
    if (wanted == null) return sorted[0] || null;
    return trials.find((t) => String(t.id) === String(wanted)) || trial || fetchedTrial || null;
  }, [trial, linkedId, fetchedTrial, trials]);
}
