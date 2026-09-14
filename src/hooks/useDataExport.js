import { useCallback, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useAlert } from "../contexts/AlertContext";
import { collectUserData, summarizeExport, deliverExport } from "../supabase/dataExport";
import * as H from "../lib/haptics";

// VERİLERİMİ İNDİR — eski DataExportRow'daki akis, anlami degismeden
// buraya tasindi (topla -> ozetle -> paylas; eksik bolum sessiz gecilmez).
export function useDataExport() {
  const { user } = useAuth();
  const showAlert = useAlert();
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(null);

  const run = useCallback(async () => {
    if (busy || !user?.id) return;
    setBusy(true);
    H.tap();
    try {
      const result = await collectUserData(user.id, (done, total, label) => {
        setProgress({ done, total, label });
      });
      if (!result) throw new Error("Veri toplanamadı");

      const summary = summarizeExport(result.export);
      const delivered = await deliverExport(result.export);

      if (!delivered?.ok) {
        showAlert("Paylaşılamadı", "Dosya oluşturuldu ama paylaşım açılamadı.");
      } else if (result.errors?.length) {
        showAlert(
          "Verilerin indirildi",
          `${formatExportSummary(summary)} Ancak ${result.errors.length} bölüm alınamadı; dosyada not düşüldü.`,
        );
      }
    } catch (e) {
      H.error();
      showAlert("İndirilemedi", e?.message || "Verilerin alınamadı, tekrar dene.");
    } finally {
      setBusy(false);
      setProgress(null);
    }
  }, [busy, user?.id, showAlert]);

  return { run, busy, progress };
}

function formatExportSummary(summary = []) {
  const visible = summary
    .filter((item) => !item.failed && item.count != null)
    .slice(0, 4)
    .map((item) => `${item.label}: ${item.count}`);
  if (!visible.length) return "";
  const rest = Math.max(0, summary.filter((item) => !item.failed).length - visible.length);
  return rest ? `${visible.join(", ")} ve ${rest} bölüm daha.` : `${visible.join(", ")}.`;
}
