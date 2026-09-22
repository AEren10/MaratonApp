import * as appStorage from "./storage/appStorage";
import { STORAGE_KEYS } from "../constants/storageKeys";
import { getSubjectByKey } from "../themes/subjects";
import {
  OP_STUDY_LOG,
  OP_TRIAL,
  OP_WRONG_QUESTION,
  OP_USER_TASK,
  OP_PLAN_TASK,
  OP_ROUTE_STOP_TRANSITION,
  OP_REVIEW,
} from "./offlineQueue";

// Cevrimdisi Kuyruk ekrani icin SALT OKUNUR gorunum. Kuyrugun anlami
// (yazma, flush, yeniden deneme) offlineQueue.js'te kalir; burada yalniz
// kayitlar adlandirilir.

function clock(ts) {
  if (!ts) return null;
  const d = new Date(ts);
  if (Number.isNaN(d.getTime())) return null;
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

function subjectOrTopic(p) {
  return p?.topic || getSubjectByKey(p?.subject)?.label || null;
}

const join = (parts) => parts.filter(Boolean).join(" · ");

function describe(item) {
  const p = item?.payload || {};
  const at = clock(item?.queuedAt);
  switch (item?.type) {
    case OP_STUDY_LOG:
      return {
        kind: "session",
        title: "Çalışma oturumu",
        meta: join([subjectOrTopic(p), p.duration_minutes ? `${p.duration_minutes} dk` : null, at]),
      };
    case OP_WRONG_QUESTION:
      return { kind: "notebook", title: "Defter kaydı", meta: join([subjectOrTopic(p), "1 soru"]), group: subjectOrTopic(p) || "" };
    case OP_ROUTE_STOP_TRANSITION:
    case OP_PLAN_TASK: {
      const done = p.transition === "completed" || p.completed === true;
      return { kind: "stop", title: done ? "Durak tamamlandı" : "Durak", meta: at };
    }
    case OP_USER_TASK:
      return { kind: "stop", title: "Durak", meta: join([p.title || subjectOrTopic(p), at]) };
    case OP_TRIAL:
      return { kind: "trial", title: "Deneme", meta: join([p.trial?.name, at]) };
    case OP_REVIEW:
      return { kind: "review", title: "Tekrar", meta: at };
    default:
      return { kind: "other", title: "Kayıt", meta: at };
  }
}

// Ayni konudaki defter kayitlari tek satirda: "Permütasyon · 2 soru".
export function describeQueue(items = []) {
  const rows = [];
  const notebookByTopic = new Map();
  for (const item of items) {
    const row = { id: item?.id || `${item?.type}-${item?.queuedAt}`, ...describe(item) };
    if (row.kind !== "notebook") { rows.push(row); continue; }
    const existing = notebookByTopic.get(row.group);
    if (existing) {
      existing.count += 1;
      existing.meta = join([row.group, `${existing.count} soru`]);
    } else {
      const grouped = { ...row, count: 1 };
      notebookByTopic.set(row.group, grouped);
      rows.push(grouped);
    }
  }
  return rows;
}

// GONDERILEMEYEN kayitlar. Gruplanmaz: her satir tek tek silinebilmeli,
// gruplanan satirin arkasinda kac kayit oldugu belli olmaz.
export async function readDeadLetterRows() {
  try {
    const raw = await appStorage.getJson(STORAGE_KEYS.OFFLINE_DEAD_LETTER, []);
    const list = Array.isArray(raw) ? raw : [];
    return {
      rows: list.map((item, index) => ({
        id: item?.clientOperationId || item?.id || `dead-${index}`,
        ...describe(item),
      })),
      total: list.length,
    };
  } catch {
    return { rows: [], total: 0 };
  }
}

export async function readQueueRows() {
  try {
    const raw = await appStorage.getJson(STORAGE_KEYS.OFFLINE_QUEUE, []);
    const list = Array.isArray(raw) ? raw : [];
    return { rows: describeQueue(list), total: list.length };
  } catch {
    return { rows: [], total: 0 };
  }
}
