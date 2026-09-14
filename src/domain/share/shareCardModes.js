import { formatDelta } from "../../lib/format.js";
import { numberWord } from "../../lib/trWords.js";
import { SHARE_CARD_IDS } from "./shareCards.js";

// KART MODLARI — "Emek / İvme / Tam" (tasarim AKIS 12B · Kart Modları).
//
//   Emek — yalniz emek verisi: sure, soru, durak, seri. Net YOK.
//   İvme — yalniz degisim: "Nerede olduğumu söylemiyorum, ne kadar
//          ilerlediğimi söylüyorum." Mutlak net YOK, fark var.
//   Tam  — verisi olan butun kartlar.

export const SHARE_MODES = Object.freeze({ EMEK: "emek", IVME: "ivme", TAM: "tam" });

export const SHARE_MODE_OPTIONS = [
  { key: SHARE_MODES.EMEK, label: "Emek" },
  { key: SHARE_MODES.IVME, label: "İvme" },
  { key: SHARE_MODES.TAM, label: "Tam" },
];

export const TRIAL_MOMENTUM_ID = "trial_momentum";

const IVME_IDS = new Set([SHARE_CARD_IDS.ROUTE_MOVE, TRIAL_MOMENTUM_ID]);

export function cardMode(card) {
  return IVME_IDS.has(card?.id) ? SHARE_MODES.IVME : SHARE_MODES.EMEK;
}

export function cardsForMode(cards = [], mode = SHARE_MODES.EMEK) {
  if (mode === SHARE_MODES.TAM) return cards;
  return cards.filter((card) => cardMode(card) === mode);
}

function trialNet(t) {
  const n = Number(t?.totalNet ?? t?.total_net);
  return Number.isFinite(n) ? n : null;
}

function trialType(t) {
  return String(t?.trialType || t?.exam_type || "UNKNOWN").toUpperCase();
}

/**
 * SON N DENEME — ayni turdeki son (en fazla) bes denemenin ilk ve son
 * neti arasindaki fark. En az iki deneme yoksa kart yok.
 */
export function trialMomentumCard(trials = [], limit = 5, preferredType = null) {
  const groups = new Map();
  trials.forEach((t) => {
    const net = trialNet(t);
    const time = new Date(t?.date || t?.trial_date).getTime();
    if (net == null || !Number.isFinite(time)) return;
    const type = trialType(t);
    if (!groups.has(type)) groups.set(type, []);
    groups.get(type).push({ net, time });
  });
  const preferredKey = preferredType ? String(preferredType).toUpperCase() : null;
  const group = preferredKey
    ? groups.get(preferredKey) || []
    : [...groups.values()].sort((a, b) => b.length - a.length)[0] || [];
  const last = group.sort((a, b) => a.time - b.time).slice(-limit);
  const n = last.length;
  const delta = n >= 2 ? last[n - 1].net - last[0].net : 0;

  return {
    id: TRIAL_MOMENTUM_ID,
    title: `SON ${n} DENEME`,
    heroValue: formatDelta(delta, 1),
    heroLabel: "net",
    stats: [],
    caption: delta > 0
      ? `${numberWord(n, { capital: true })} denemede rotam yukarı kırıldı. Nerede olduğumu söylemiyorum, ne kadar ilerlediğimi söylüyorum.`
      : null,
    available: n >= 2,
  };
}
