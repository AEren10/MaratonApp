import { useMemo, useState, useCallback, useEffect } from "react";
import { useSelector } from "react-redux";
import { selectTrials, selectTrialsLoading } from "../store/slices/trialSlice";
import { usePremium } from "../contexts/PremiumContext";
import { useSync } from "../contexts/DataSyncContext";
import { useExam } from "../contexts/ExamContext";
import { canAccessProductFeature } from "../domain/premium/paywallGate";
import { PRODUCT_FEATURES } from "../constants/premium";
import { useFeatureEntry } from "./useFeatureEntry";
import { getSubjectLabel } from "../themes/subjects";
import { getTrialPublishers } from "../supabase/productAccess";

export const FREE_WINDOW_DAYS = 56; // "Son 8 hafta acik" (tasarim, AKIS 17)
// Sekmeler kullanicinin sinavina gore: LGS'ciye AYT, YKS'liye LGS sekmesi
// cikmiyordu / cikiyordu. Sinav disi eski denemeler "Tumu"de kalir.
export function trialRecordTabs(examType) {
  if (examType === "lgs") return ["ALL", "LGS", "BRANCH"];
  if (examType === "tyt") return ["ALL", "TYT", "BRANCH"];
  if (examType === "dil") return ["ALL", "TYT", "YDT", "BRANCH"];
  return ["ALL", "TYT", "AYT", "BRANCH"];
}

function typeBadge(trialType) {
  if (trialType === "BRANCH") return "Branş";
  if (trialType?.startsWith("AYT")) return "AYT";
  if (trialType === "LGS") return "LGS";
  if (trialType === "YDT") return "YDT";
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

export function getTrialPublisher(item, publisherMap) {
  const p = item.publisherNameSnapshot || item.publisher_name_snapshot || item.publisher;
  if (typeof p === "string" && p.trim()) return p.trim();
  const pubId = item.publisherId || item.publisher_id;
  if (pubId && publisherMap?.has(pubId)) {
    return publisherMap.get(pubId);
  }
  return "";
}

export function getCustomTitle(item, badge, publisher) {
  const raw = (item.title || item.name || "").trim();
  if (!raw) return "";

  const lower = raw.toLowerCase();
  const pubLower = (publisher || "").toLowerCase();

  if (pubLower && (lower === pubLower || lower === `${pubLower} denemesi`)) {
    return "";
  }

  const genericExamNames = [
    "tyt", "ayt", "lgs", "ydt",
    "ayt say", "ayt ea", "ayt soz", "ayt söz",
    "ayt_say", "ayt_ea", "ayt_soz",
    "branch", "brans", "branş",
    "deneme",
    `${badge?.toLowerCase?.() || ""} denemesi`,
    "branş denemesi", "brans denemesi",
  ];
  if (genericExamNames.includes(lower)) return "";

  if (lower.endsWith(" branş") || lower.endsWith(" brans")) return "";
  if (lower.endsWith(" denemesi")) {
    const base = lower.replace(" denemesi", "").trim();
    if (genericExamNames.includes(base)) return "";
  }

  return raw;
}

export function trialTitle(item, badge, publisherMap) {
  const publisher = getTrialPublisher(item, publisherMap);
  const custom = getCustomTitle(item, badge, publisher);

  if (publisher) {
    if (custom) return `${publisher} · ${custom}`;
    return publisher;
  }

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

/** Ay adini cumle duzeninde dondurur (Haziran, Mayis...). */
function monthKey(date) {
  const m = new Date(date).toLocaleDateString("tr-TR", { month: "long" });
  return m ? m[0].toLocaleUpperCase("tr-TR") + m.slice(1).toLocaleLowerCase("tr-TR") : "";
}

export function useTrialRecords() {
  const trials = useSelector(selectTrials);
  const trialsLoading = useSelector(selectTrialsLoading);
  const { examType } = useExam();
  // YDT deneme turu henuz yoksa bos sekme gostermeyelim.
  const typeTabs = useMemo(
    () => trialRecordTabs(examType).filter((t) => t !== "YDT" || trials.some((x) => x.trialType === "YDT")),
    [examType, trials],
  );
  const [filter, setFilter] = useState("ALL");
  const [publishers, setPublishers] = useState([]);
  const { accessLoading, accessError, accessSnapshot } = usePremium();
  const { syncedOnce, error: syncError, refresh } = useSync();
  const { open: openHistoryGate } = useFeatureEntry(PRODUCT_FEATURES.trial_compare, "trial_history");

  useEffect(() => {
    let cancelled = false;
    getTrialPublishers()
      .then((rows) => { if (!cancelled) setPublishers(rows || []); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  const publisherMap = useMemo(() => {
    const map = new Map();
    (publishers || []).forEach((p) => {
      if (p?.id && p?.name) map.set(p.id, p.name);
    });
    return map;
  }, [publishers]);

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
    const sorted = (trials || [])
      .map((t, index) => ({ trial: t, orderIndex: index }))
      .sort((a, b) => {
        const diff = new Date(a.trial.date) - new Date(b.trial.date);
        if (diff !== 0) return diff;
        const timeA = a.trial.created_at || a.trial.createdAt ? new Date(a.trial.created_at || a.trial.createdAt).getTime() : (Number(a.trial.id) > 1e9 ? Number(a.trial.id) : 0);
        const timeB = b.trial.created_at || b.trial.createdAt ? new Date(b.trial.created_at || b.trial.createdAt).getTime() : (Number(b.trial.id) > 1e9 ? Number(b.trial.id) : 0);
        if (timeA !== timeB) return timeA - timeB;
        return b.orderIndex - a.orderIndex;
      })
      .map(({ trial }) => trial);

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
      .sort((a, b) => {
        const diff = new Date(b.date) - new Date(a.date);
        if (diff !== 0) return diff;
        const timeA = a.created_at || a.createdAt ? new Date(a.created_at || a.createdAt).getTime() : (Number(a.id) > 1e9 ? Number(a.id) : 0);
        const timeB = b.created_at || b.createdAt ? new Date(b.created_at || b.createdAt).getTime() : (Number(b.id) > 1e9 ? Number(b.id) : 0);
        return timeB - timeA;
      });

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
        title: trialTitle(item, item.badge, publisherMap),
        publisher: getTrialPublisher(item, publisherMap) || null,
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
  }, [trials, filter, canAccessHistory, publisherMap]);

  return {
    filter,
    setFilter,
    typeTabs,
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
