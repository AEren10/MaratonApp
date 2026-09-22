import { useCallback, useEffect, useState } from "react";
import { flushQueue, removeFromDeadLetter, retryDeadLetter } from "../lib/offlineQueue";
import { readDeadLetterRows, readQueueRows } from "../lib/offlineQueueView";
import { useNetwork } from "../contexts/NetworkContext";
import * as H from "../lib/haptics";

// Cevrimdisi Kuyruk: BEKLEYEN satirlar + GONDERILEMEYEN satirlar.
//
// Ekran eskiden yalnizca bekleyen kuyrugu okuyordu. Ana ekrandaki "N kayit
// gonderilemedi" seridi buraya yonlendiriyor ama gonderilemeyenler baska bir
// depoda (dead-letter) duruyor: kullanici seride basiyor, bos bir ekran ve
// "Çalışmaya devam edebilirsin." yazisi goruyordu.
export function useOfflineQueueView() {
  const { isConnected } = useNetwork();
  const [view, setView] = useState({ rows: [], total: 0 });
  const [failed, setFailed] = useState({ rows: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const [retrying, setRetrying] = useState(false);

  const refresh = useCallback(async () => {
    const [queued, dead] = await Promise.all([readQueueRows(), readDeadLetterRows()]);
    setView(queued);
    setFailed(dead);
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh, isConnected]);

  // Tek dugme ikisini de dener: kullanici icin ayrim yok, ikisi de "henuz
  // gitmemis kayit". Once olu kutu kuyruga geri konur, sonra kuyruk akitilir.
  const retryNow = useCallback(async () => {
    if (retrying) return;
    setRetrying(true);
    H.tap();
    try {
      await retryDeadLetter().catch(() => ({ requeued: 0 }));
      const result = await flushQueue();
      if (result?.processed > 0) H.success();
    } catch {
      H.warn();
    } finally {
      await refresh();
      setRetrying(false);
    }
  }, [refresh, retrying]);

  const discard = useCallback(async (id) => {
    H.warn();
    await removeFromDeadLetter(id).catch(() => false);
    await refresh();
  }, [refresh]);

  return {
    rows: view.rows,
    total: view.total,
    failedRows: failed.rows,
    failedTotal: failed.total,
    loading,
    retrying,
    retryNow,
    discard,
    isConnected,
  };
}
