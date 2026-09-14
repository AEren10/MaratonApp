import { useCallback, useEffect, useState } from "react";
import { flushQueue } from "../lib/offlineQueue";
import { readQueueRows } from "../lib/offlineQueueView";
import { useNetwork } from "../contexts/NetworkContext";
import * as H from "../lib/haptics";

// Cevrimdisi Kuyruk: satirlar + "Şimdi yüklemeyi dene". Flush anlami
// offlineQueue.js'te; burada yalniz tetiklenir ve liste tazelenir.
export function useOfflineQueueView() {
  const { isConnected } = useNetwork();
  const [view, setView] = useState({ rows: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const [retrying, setRetrying] = useState(false);

  const refresh = useCallback(async () => {
    setView(await readQueueRows());
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh, isConnected]);

  const retryNow = useCallback(async () => {
    if (retrying) return;
    setRetrying(true);
    H.tap();
    try {
      const result = await flushQueue();
      if (result?.processed > 0) H.success();
    } catch {
      H.warn();
    } finally {
      await refresh();
      setRetrying(false);
    }
  }, [refresh, retrying]);

  return { rows: view.rows, total: view.total, loading, retrying, retryNow, isConnected };
}
