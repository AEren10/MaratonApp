import { useMemo, useState, useCallback } from "react";
import { useSelector } from "react-redux";
import { selectTrials, selectTrialsLoading } from "../store/slices/trialSlice";
import { usePremium } from "../contexts/PremiumContext";
import { useSync } from "../contexts/DataSyncContext";
import { canAccessProductFeature } from "../domain/premium/paywallGate";
import { PRODUCT_FEATURES } from "../constants/premium";
import { useFeatureEntry } from "./useFeatureEntry";
import { getSubjectLabel } from "../themes/subjects";

export const FREE_WINDOW_DAYS = 56; // "Son 8 hafta acik" (tasarim, AKIS 17)
const TYPE_TABS = ["ALL", "TYT", "AYT", "BRANCH"];

function typeBadge(trialType) {
  if (trialType === "BRANCH") return "Branş";
  if (trialType?.startsWith("AYT")) return "AYT";
  if (trialType === "LGS") return "LGS";
  return "TYT";
}

function branchExamPrefix(subjectKey) {
  const key = String(subjectKey || "").toLowerCase();
  if (key.startsWith("ayt_")) return "AYT";
  if (key.startsWith("tyt_")) return "TYT";
  if (key.startsWith("lgs_")) return "LGS";
  if (key.startsWith("ydt_")) return "YDT";
  return "";
}

function trialTitle(item, badge) {
  const custom = item.title?.trim();
  if (custom) return custom;
  if (item.trialType === "BRANCH") {
    const subject = item.branchSubjectName || getSubjectLabel(item.branchSubject);
    const prefix = branchExamPrefix(item.branchSubject);
    return subject ? `${[prefix, subject].filter(Boolean).join(" ")} Denemesi` : "Branş Denemesi";
  }
  return `${badge} Denemesi`;
}

function matchesTypeFilter(trial, filter) {
  if (filter === "ALL") return true;
  if (filter === "AYT") return trial.trialType?.startsWith("AYT");
  return trial.trialType === filter;
}

function formatDate(date) {
  return new Date(date).toLocaleDateString("tr-TR", { day: "numeric", month: "long" });
}

function formatNet(value) {
  return Number(value ?? 0).toFixed(2).replace(".", ",");
}

function formatDelta(delta) {
  if (delta == null) return "ilk";
  const sign = delta > 0 ? "+" : delta < 0 ? "−" : "";
  return `${sign}${formatNet(Math.abs(delta))}`;
}

/** Ay adini buyuk harfle dondurur (HAZIRAN, MAYIS...). */
function monthKey(date) {
  return new Date(date).toLocaleDateString("tr-TR", { month: "long" }).toLocaleUpperCase("tr-TR");
}

export function useTrialRecords() {
  const trials = useSelector(selectTrials);
  const trialsLoading = useSelector(selectTrialsLoading);
  const [filter, setFilter] = useState("ALL");
  const { accessLoading, accessError, accessSnapshot } = usePremium();
  const { syncedOnce, error: syncError, refresh } = useSync();
  const { open: openHistoryGate } = useFeatureEntry(PRODUCT_FEATURES.trial_compare, "trial_history");

  const readError = syncError?.sourceKeys?.includes("trials") ? syncError : null;
  const loading = Boolean(trialsLoading || accessLoading || (!syncedOnce && !readError));
  const accessState = accessLoading ? "loading" : accessError ? "error" : "ready";
  const canAccessHistory = canAccessProductFeature({
    accessState,
    features: accessSnapshot?.features,
    featureKey: PRODUCT_FEATURES.trial_compare,
  });

  // Eski kayitlarin kilidi "Paywall · Geçmiş" (trial_history -> topic_progress).
  const requestFullHistory = useCallback(() => openHistoryGate(), [openHistoryGate]);

  const { sections, lockedCount, totalCount } = useMemo(() => {
    const sorted = [...trials].sort((a, b) => new Date(a.date) - new Date(b.date));

    // Delta: ayni tur icindeki bir onceki denemeye gore net farki.
    const lastNetByType = {};
    const withDelta = sorted.map((t) => {
      const badge = typeBadge(t.trialType);
      const net = t.rawTotalNet ?? t.totalNet ?? 0;
      const prev = lastNetByType[badge];
      lastNetByType[badge] = net;
      return { ...t, badge, net, delta: prev == null ? null : net - prev };
    });

    const filtered = withDelta
      .filter((t) => matchesTypeFilter(t, filter))
      .sort((a, b) => new Date(b.date) - new Date(a.date));

    const cutoff = Date.now() - FREE_WINDOW_DAYS * 86400000;
    const visible = canAccessHistory
      ? filtered
      : filtered.filter((t) => new Date(t.date).getTime() >= cutoff);

    const grouped = [];
    const byMonth = new Map();
    visible.forEach((item) => {
      const key = monthKey(item.date);
      if (!byMonth.has(key)) {
        const bucket = { title: key, data: [] };
        byMonth.set(key, bucket);
        grouped.push(bucket);
      }
      byMonth.get(key).data.push({
        id: String(item.id ?? `${item.date}-${item.badge}`),
        trial: item,
        badge: item.badge,
        title: trialTitle(item, item.badge),
        dateLabel: formatDate(item.date),
        netLabel: formatNet(item.net),
        deltaLabel: formatDelta(item.delta),
        deltaUp: item.delta != null && item.delta > 0,
      });
    });

    return {
      sections: grouped,
      lockedCount: filtered.length - visible.length,
      totalCount: trials.length,
    };
  }, [trials, filter, canAccessHistory]);

  return {
    filter,
    setFilter,
    typeTabs: TYPE_TABS,
    sections,
    lockedCount,
    totalCount,
    canAccessHistory,
    requestFullHistory,
    loading,
    error: readError,
    retry: refresh,
    isEmpty: trials.length === 0,
  };
}
