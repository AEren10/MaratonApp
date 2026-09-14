import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { getAccountDataCounts } from "../supabase/accountSummary";

// Veri Indir / Hesap Silme sayilari. Okunamayan alan null kalir; ekran onu
// gostermez.
export function useAccountDataCounts() {
  const { user } = useAuth();
  const [counts, setCounts] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    setError(false);
    try {
      setCounts(await getAccountDataCounts(user.id));
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    load();
  }, [load]);

  return { counts, loading, error, reload: load };
}
