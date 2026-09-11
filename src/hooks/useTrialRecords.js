import { useMemo, useState, useCallback } from "react";
import { useSelector } from "react-redux";
import { selectTrials } from "../store/slices/trialSlice";
import { usePremium } from "../contexts/PremiumContext";
import { canAccessProductFeature } from "../domain/premium/paywallGate";
import { PRODUCT_FEATURES } from "../constants/premium";

const FREE_WINDOW_DAYS = 56; // "Son 8 hafta acik" (tasarim, AKIS 17)
const TYPE_TABS = ["ALL", "TYT", "AYT", "BRANCH"];

function typeBadge(trialType) {
  if (trialType === "BRANCH") return "Branş";
  if (trialType?.startsWith("AYT")) return "AYT";
  if (trialType === "LGS") return "LGS";
  return "TYT";
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
  const [filter, setFilter] = useState("ALL");
  const { accessLoading, accessError, accessSnapshot, showPaywall } = usePremium();

  const accessState = accessLoading ? "loading" : accessError ? "error" : "ready";
  const canAccessHistory = canAccessProductFeature({
    accessState,
    features: accessSnapshot?.features,
    featureKey: PRODUCT_FEATURES.trial_compare,
  });

  const requestFullHistory = useCallback(() => showPaywall("trial_compare"), [showPaywall]);

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
        title: item.title?.trim() || `${item.badge} Denemesi`,
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
    isEmpty: trials.length === 0,
  };
}
