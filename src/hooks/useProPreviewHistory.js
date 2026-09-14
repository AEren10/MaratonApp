import { useMemo } from "react";
import { useSelector } from "react-redux";

import { selectTrials } from "../store/slices/trialSlice";
import { FREE_WINDOW_DAYS } from "./useTrialRecords";

const MAX_ROWS = 6;
const netOf = (t) => Number(t?.rawTotalNet ?? t?.totalNet ?? 0);

function dateLabel(date) {
  const d = new Date(date);
  const month = d.toLocaleDateString("tr-TR", { month: "short" }).replace(".", "");
  return `${d.getDate()} ${month.toLocaleUpperCase("tr-TR")}`;
}

function typeLabel(trialType) {
  if (trialType === "BRANCH") return "Branş";
  if (trialType?.startsWith("AYT")) return "AYT";
  return trialType === "LGS" ? "LGS" : "TYT";
}

// "Önizleme · Geçmiş": kullanicinin GERCEK kayit listesi. Acik/kilitli
// ayrimi Deneme Kayitlari'yla ayni pencere (useTrialRecords).
export function useProPreviewHistory() {
  const trials = useSelector(selectTrials);

  return useMemo(() => {
    const cutoff = Date.now() - FREE_WINDOW_DAYS * 86400000;
    const sorted = [...(trials || [])].sort((a, b) => new Date(b.date) - new Date(a.date));
    const rows = sorted.map((t) => {
      const badge = typeLabel(t.trialType);
      const title = t.title?.trim();
      return {
        id: String(t.id ?? `${t.date}-${badge}`),
        date: dateLabel(t.date),
        name: title ? `${badge} · ${title}` : badge,
        net: netOf(t),
        locked: new Date(t.date).getTime() < cutoff,
      };
    });
    return {
      total: rows.length,
      open: rows.filter((r) => !r.locked).length,
      rows: rows.slice(0, MAX_ROWS),
    };
  }, [trials]);
}
