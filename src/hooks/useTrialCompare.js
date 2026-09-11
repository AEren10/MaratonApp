import { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { selectTrials } from "../store/slices/trialSlice";
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

  const sorted = useMemo(
    () => [...trials].sort((a, b) => new Date(b.date) - new Date(a.date)),
    [trials],
  );

  const defaultNewer = sorted[0];
  const defaultOlder =
    sorted.find((t, i) => i > 0 && t.trialType === defaultNewer?.trialType) || sorted[1] || null;

  const [newer, setNewer] = useState(
    () => (params.trial1Id && sorted.find((t) => t.id === params.trial1Id)) || defaultNewer,
  );
  const [older, setOlder] = useState(
    () => (params.trial2Id && sorted.find((t) => t.id === params.trial2Id)) || defaultOlder,
  );

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
