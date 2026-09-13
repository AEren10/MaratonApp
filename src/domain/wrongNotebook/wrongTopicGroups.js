import { daysUntil, isWrongDue, ladderStageOf, REVIEW_LADDER } from "../../lib/wrongReviewLadder.js";

// Defter "KONUYA GÖRE" listesi: yanlislar ders+konu basina tek satirda
// toplanir. Satirin durumu (TEKRAR ZAMANI / N GÜN SONRA / YENİ / KAPATILDI)
// ve uc kademe cizgisi o gruptaki en acil sorudan okunur.

export const NOTEBOOK_FILTER = { OPEN: "open", RESOLVED: "resolved", ALL: "all" };
export const GROUP_STATE = { TODAY: "today", NEW: "new", WAIT: "wait", DONE: "done" };

const ORDER = { today: 0, new: 1, wait: 2, done: 3 };

function subjectKeyOf(item) {
  return typeof item?.subject === "string" ? item.subject : item?.subject?.key;
}

function matchesFilter(item, filter) {
  if (filter === NOTEBOOK_FILTER.OPEN) return !item.is_resolved;
  if (filter === NOTEBOOK_FILTER.RESOLVED) return !!item.is_resolved;
  return true;
}

function dueTime(item) {
  return item.next_review_at ? new Date(item.next_review_at).getTime() : Infinity;
}

function groupState(items, now) {
  const open = items.filter((item) => !item.is_resolved);
  if (!open.length) {
    return { state: GROUP_STATE.DONE, lead: items[0], stage: REVIEW_LADDER.length, days: null };
  }
  const lead = [...open].sort((a, b) => dueTime(a) - dueTime(b))[0];
  const stage = ladderStageOf(lead) + 1;
  if (isWrongDue(lead, now)) return { state: GROUP_STATE.TODAY, lead, stage, days: null };
  if (!lead.last_reviewed_at || !lead.next_review_at) {
    return { state: GROUP_STATE.NEW, lead, stage, days: null };
  }
  return { state: GROUP_STATE.WAIT, lead, stage, days: daysUntil(lead.next_review_at, now) };
}

export function buildNotebookView(items = [], filter = NOTEBOOK_FILTER.OPEN, now = new Date()) {
  const buckets = new Map();
  items.forEach((item) => {
    if (!matchesFilter(item, filter)) return;
    const subjectKey = subjectKeyOf(item);
    const key = `${subjectKey || "?"}|${item.topic || ""}`;
    if (!buckets.has(key)) buckets.set(key, { key, subjectKey, topic: item.topic || "", items: [] });
    buckets.get(key).items.push(item);
  });

  const groups = [...buckets.values()]
    .map((group) => ({ ...group, count: group.items.length, ...groupState(group.items, now) }))
    .sort((a, b) => ORDER[a.state] - ORDER[b.state] || (a.days ?? 0) - (b.days ?? 0) || b.count - a.count);

  return {
    groups,
    total: items.length,
    openCount: items.filter((item) => !item.is_resolved).length,
    dueCount: items.filter((item) => isWrongDue(item, now)).length,
  };
}
