import { useCallback, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { selectTrials } from "../store/slices/trialSlice";
import { useSync } from "../contexts/DataSyncContext";
import { getTrialTypes, getAllSubjects } from "../domain/trial/trialTypes";

const fmtNet = (v) => Number(v ?? 0).toFixed(1).replace(".", ",");

function fmtDelta(delta) {
  const sign = delta > 0 ? "+" : delta < 0 ? "−" : "";
  return `${sign}${fmtNet(Math.abs(delta))}`;
}

/** "7 HAZ" — tasarimin tarih etiketi. */
function fmtDayMonth(date) {
  if (!date) return "—";
  return new Date(date)
    .toLocaleDateString("tr-TR", { day: "numeric", month: "short" })
    .replace(".", "")
    .toLocaleUpperCase("tr-TR");
}

export function useTrialCompare(C, params = {}) {
  const trials = useSelector(selectTrials);
  const { syncedOnce, error: syncError, refresh } = useSync();
  const readError = syncError?.sourceKeys?.includes("trials") ? syncError : null;

  const sorted = useMemo(
    () => [...trials].sort((a, b) => new Date(b.date) - new Date(a.date)),
    [trials],
  );

  // Secim id olarak tutulur: denemeler senkron sonrasi geldiginde tek seferlik
  // useState baslangici bos listede donup kalir, turetilmis deger toparlanir.
  const [newerId, setNewerId] = useState(params.trial1Id ?? null);
  const [olderId, setOlderId] = useState(params.trial2Id ?? null);

  const newer = useMemo(() => {
    const picked = newerId == null ? null : sorted.find((t) => String(t.id) === String(newerId));
    return picked || sorted[0] || null;
  }, [sorted, newerId]);

  const older = useMemo(() => {
    const picked = olderId == null ? null : sorted.find((t) => String(t.id) === String(olderId));
    if (picked) return picked;
    const rest = sorted.filter((t) => String(t.id) !== String(newer?.id));
    return rest.find((t) => t.trialType === newer?.trialType) || rest[0] || null;
  }, [sorted, olderId, newer]);

  const setNewer = useCallback((t) => setNewerId(t?.id ?? null), []);
  const setOlder = useCallback((t) => setOlderId(t?.id ?? null), []);

  // Ayni turden olmayan iki denemeyi karsilastirmak ders kirilimini
  // anlamsiz kilar; secici yalnizca yeni denemenin turunu listeler.
  const sameTypeTrials = useMemo(
    () => sorted.filter((t) => t.trialType === newer?.trialType),
    [sorted, newer],
  );

  const rows = useMemo(() => {
    if (!newer) return [];
    const types = getTrialTypes(C);
    const meta = types[newer.trialType];
    const subjects =
      meta?.subjects ||
      (newer.trialType === "BRANCH" && newer.branchSubject
        ? getAllSubjects(C).filter((s) => s.key === newer.branchSubject)
        : []);

    return subjects.map((s) => {
      const o = older?.subjects?.[s.key]?.net ?? 0;
      const n = newer.subjects?.[s.key]?.net ?? 0;
      return {
        key: s.key,
        name: s.name,
        color: s.color,
        olderNet: older ? fmtNet(o) : "—",
        newerNet: fmtNet(n),
        diffLabel: older ? fmtDelta(n - o) : "—",
        diffUp: older ? n - o > 0 : false,
      };
    });
  }, [C, newer, older]);

  const newerNet = newer?.totalNet ?? 0;
  const olderNet = older?.totalNet ?? 0;
  const diff = newerNet - olderNet;

  // Yayin farki uyarisi tasarimda kosulsuz durmuyor; yalniz iki deneme
  // farkli yayindan geldiginde anlam tasiyor.
  const publisherMismatch = Boolean(
    newer?.publisherId && older?.publisherId && newer.publisherId !== older.publisherId,
  );

  return {
    newer,
    older,
    setNewer,
    setOlder,
    sameTypeTrials,
    rows,
    canCompare: Boolean(newer && older),
    loading: !syncedOnce && !readError,
    error: readError,
    retry: refresh,
    publisherMismatch,
    titles: {
      older: older?.title?.trim() || (older ? "Eski deneme" : "Deneme seç"),
      newer: newer?.title?.trim() || "Yeni deneme",
    },
    hero: {
      olderLabel: fmtDayMonth(older?.date),
      newerLabel: fmtDayMonth(newer?.date),
      olderNet: older ? fmtNet(olderNet) : "—",
      newerNet: fmtNet(newerNet),
      diffLabel: older ? fmtDelta(diff) : "—",
      diffUp: diff > 0,
    },
  };
}
