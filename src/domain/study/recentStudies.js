import { dateKey } from "../../lib/dateUtils.js";
import { clockLabel, formatStudyMinutes } from "./studyHistoryModel.js";

const DAY_MS = 86400000;

function logDate(log) {
  return String(log.study_date || dateKey(log.created_at) || "").slice(0, 10);
}

function dayDiff(fromKey, toKey) {
  const a = Date.parse(`${fromKey}T12:00:00Z`);
  const b = Date.parse(`${toKey}T12:00:00Z`);
  if (Number.isNaN(a) || Number.isNaN(b)) return null;
  return Math.round((b - a) / DAY_MS);
}

// "bugün 21:10" · "dün" · "2 gün önce" — Ücretsiz Ana Sayfa artboardi.
export function recentWhenLabel(log, now = new Date()) {
  const diff = dayDiff(logDate(log), dateKey(now));
  if (diff == null) return "";
  if (diff <= 0) {
    const clock = clockLabel(log.created_at);
    return clock ? `bugün ${clock}` : "bugün";
  }
  if (diff === 1) return "dün";
  return `${diff} gün önce`;
}

// "SON ÇALIŞMALARIN" satirlari: en yeni kayit ustte, en fazla `limit` satir.
// Satir basligi konu (yoksa ders), meta "zaman · süre · soru"; sifir olan
// parca yazilmaz, sayi uydurulmaz.
export function buildRecentStudies(logs = [], { limit = 3, now = new Date(), subjectLabel } = {}) {
  const seen = new Set();
  const sorted = [...logs]
    .filter((log) => {
      const id = log.id ?? log.client_operation_id;
      if (id == null) return true;
      if (seen.has(id)) return false;
      seen.add(id);
      return true;
    })
    .sort((a, b) => logDate(b).localeCompare(logDate(a))
      || String(b.created_at || "").localeCompare(String(a.created_at || "")));

  return sorted.slice(0, limit).map((log, index) => {
    const minutes = Number(log.duration ?? log.duration_minutes) || 0;
    const questions = Number(log.questionCount ?? log.question_count) || 0;
    const subjectName = subjectLabel?.(log.subject) || log.subject || "";
    const meta = [
      recentWhenLabel(log, now),
      minutes > 0 ? formatStudyMinutes(minutes) : null,
      questions > 0 ? `${questions} soru` : null,
    ].filter(Boolean).join(" · ");
    return {
      key: String(log.id ?? log.client_operation_id ?? `recent-${index}`),
      subject: log.subject,
      title: log.topic || subjectName,
      meta,
    };
  });
}
