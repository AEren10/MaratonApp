import { addStudyLog } from "../supabase/studyLogs";
import { addTrial } from "../supabase/trials";
import { addWrongQuestion } from "../supabase/wrongQuestions";
import { createUserTask } from "../supabase/userTasks";
import { uploadWrongQuestionImage } from "../supabase/storage";
import { STORAGE_KEYS } from "../constants/storageKeys";
import { getSession } from "../supabase/auth";
import { touchStreak } from "../supabase/streaks";
import { syncChallengeProgress } from "./challengeSync";
import { studyLogFingerprint } from "../domain/study/studyLogModel";
import { trialFingerprint } from "../domain/trial/trialModel";
import { userTaskFingerprint } from "../domain/tasks/userTaskModel";
import * as appStorage from "./storage/appStorage";

const QUEUE_KEY = STORAGE_KEYS.OFFLINE_QUEUE;
const DEAD_LETTER_KEY = STORAGE_KEYS.OFFLINE_DEAD_LETTER;
const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;
const MAX_RETRIES = 10;
const FLUSH_TIMEOUT_MS = 60_000;

// Operation types
export const OP_STUDY_LOG = "STUDY_LOG";
export const OP_TRIAL = "TRIAL";
export const OP_WRONG_QUESTION = "WRONG_QUESTION";
export const OP_USER_TASK = "USER_TASK";

async function readQueue() {
  try {
    return await appStorage.getJson(QUEUE_KEY, []);
  } catch (e) {
    if (__DEV__) console.warn("[offlineQueue] readQueue", e);
    return [];
  }
}

// Yazma BAŞARISIZLIĞI YUTULMAMALI. Eskiden hata yutuluyor, enqueue yine de
// başarı dönüyordu: depo doluysa ya da AsyncStorage bozuksa kullanıcı
// "bağlantı gelince gönderilecek" mesajını görüyor ama kayıt hiç
// saklanmamış oluyordu. Sessiz veri kaybının en kötü türü.
async function writeQueue(items) {
  let ok = false;
  try {
    ok = await appStorage.setJson(QUEUE_KEY, items);
  } catch (e) {
    if (__DEV__) console.warn("[offlineQueue] writeQueue", e);
    ok = false;
  }
  if (!ok) throw new Error("offline_queue_write_failed");
  return true;
}

// Kuyruk mutasyonları SIRAYA ALINIR.
//
// enqueue ve flushQueue "oku → değiştir → yaz" yapıyor. Kilit olmadığı için
// aynı anda iki kayıt eklendiğinde (ör. çalışma kaydı + yanlış soru) ikisi de
// aynı eski listeyi okuyup üstüne yazıyor ve biri sessizce kayboluyordu.
let _queueLock = Promise.resolve();
function withQueueLock(fn) {
  const run = _queueLock.then(fn, fn);
  // Zincirin bir hatayla kopmaması için yut; hatayı çağırana geri veriyoruz.
  _queueLock = run.then(() => {}, () => {});
  return run;
}

const MAX_QUEUE_SIZE = 200;

function createClientOperationId(type) {
  return `${type}_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

function withClientOperationId(payload, clientOperationId) {
  if (!payload || !clientOperationId) return payload;
  return { ...payload, client_operation_id: payload.client_operation_id || clientOperationId };
}

function getOperationUserId(item) {
  return item?.payload?.user_id || item?.payload?.trial?.user_id || null;
}

function getOperationFingerprint(op) {
  switch (op.type) {
    case OP_STUDY_LOG:
      return studyLogFingerprint(op.payload);
    case OP_TRIAL:
      return trialFingerprint(op.payload?.trial, op.payload?.subjects);
    case OP_USER_TASK:
      return userTaskFingerprint(op.payload);
    case OP_WRONG_QUESTION:
      return [
        op.payload?.user_id || "",
        op.payload?.subject || "",
        op.payload?.topic || "",
        op.payload?.question_text || "",
        op.payload?.image_path || op.payload?.image_local_uri || "",
      ].join("|");
    default:
      return "";
  }
}

export async function enqueue(op) {
  return withQueueLock(() => enqueueLocked(op));
}

async function enqueueLocked(op) {
  let list = await readQueue();
  const clientOperationId = op.clientOperationId || createClientOperationId(op.type);
  const fingerprint = op.fingerprint || getOperationFingerprint(op);
  if (list.some((item) =>
    item.clientOperationId === clientOperationId ||
    item.id === clientOperationId ||
    (fingerprint && item.fingerprint === fingerprint)
  )) {
    return clientOperationId;
  }
  const payload = op.type === OP_TRIAL
    ? { ...op.payload, trial: withClientOperationId(op.payload?.trial, clientOperationId) }
    : withClientOperationId(op.payload, clientOperationId);
  list.push({
    ...op,
    payload,
    queuedAt: Date.now(),
    id: clientOperationId,
    clientOperationId,
    fingerprint,
  });
  if (list.length > MAX_QUEUE_SIZE) {
    // Taşma sessiz veri kaybıydı: en eski kayıtlar hiçbir iz bırakmadan
    // atılıyordu. Artık dead-letter'a taşınıyorlar — kurtarılabilir kalsın.
    const dropped = list.slice(0, list.length - MAX_QUEUE_SIZE);
    list = list.slice(-MAX_QUEUE_SIZE);
    if (dropped.length) {
      await moveToDeadLetter(dropped.map((d) => ({ ...d, deadReason: "queue_overflow" })));
    }
  }
  await writeQueue(list);
  return clientOperationId;
}

export async function getQueueSize() {
  const list = await readQueue();
  return list.length;
}

async function runOne(item) {
  switch (item.type) {
    case OP_STUDY_LOG: {
      await addStudyLog(item.payload);
      const questions = item.payload?.question_count || 0;
      const minutes = item.payload?.duration_minutes || 0;
      const userId = item.payload?.user_id;
      if (userId) {
        await refreshStudySideEffects(userId, {
          questions,
          minutes,
          studyDate: item.payload?.study_date,
        });
      }
      break;
    }
    case OP_TRIAL: {
      await addTrial(item.payload.trial, item.payload.subjects);
      const userId = item.payload?.trial?.user_id;
      const solvedCount = (item.payload?.subjects || []).reduce(
        (sum, s) => sum + (s.correct_count || 0) + (s.wrong_count || 0),
        0,
      );
      if (userId && solvedCount > 0) {
        await syncChallengeProgress(userId, { questions: solvedCount });
      }
      break;
    }
    case OP_WRONG_QUESTION: {
      const p = { ...item.payload };
      if (p.image_local_uri && !p.image_path) {
        p.image_path = await uploadWrongQuestionImage(p.user_id, p.image_local_uri);
      }
      delete p.image_local_uri;
      await addWrongQuestion(p);
      break;
    }
    case OP_USER_TASK:
      await createUserTask(item.payload);
      break;
    default:
      throw new Error(`Unknown op type: ${item.type}`);
  }
}

async function refreshStudySideEffects(userId, { questions = 0, minutes = 0, studyDate } = {}) {
  try {
    // Seri sayısını sunucu hesaplıyor; istemci yalnızca tarihi bildiriyor.
    await touchStreak(userId, studyDate || null);
  } catch (_) {}

  try {
    await syncChallengeProgress(userId, { questions, minutes });
  } catch (_) {}
}

let _flushing = false;

function isAuthError(e) {
  const msg = e?.message || "";
  const status = e?.status || e?.statusCode;
  // 42501 = RLS reddi. PostgREST bunu 403 ile döner ama bu kimlik hatası
  // değil; auth sayılırsa TÜM kuyruk kalıcı olarak duraklıyordu.
  if (e?.code === "42501") return false;
  return status === 401 || status === 403 || msg.includes("JWT") || msg.includes("token");
}

// Tekrar denemenin asla işe yaramayacağı hatalar. Bunlar 10 kez denenip
// üstel backoff'la pil ve ağ harcıyor, sonunda yine dead-letter'a düşüyordu.
const PERMANENT_PG_CODES = new Set([
  "42501", // RLS politika reddi
  "22P02", // geçersiz metin gösterimi
  "23502", // not-null ihlali
  "23503", // yabancı anahtar ihlali
  "23514", // check kısıtı ihlali
  "23505", // unique ihlali (idempotency çakışması ayrıca ele alınıyor)
  "42703", // kolon yok
  "42P01", // tablo yok
]);

function isPermanentError(e) {
  if (!e) return false;
  if (PERMANENT_PG_CODES.has(e.code)) return true;
  const status = e.status || e.statusCode;
  // 4xx (401/403/408/429 hariç) istemci hatasıdır, tekrar denemek düzeltmez.
  if (typeof status === "number" && status >= 400 && status < 500) {
    return ![401, 403, 408, 429].includes(status);
  }
  return false;
}

function shouldSkipByBackoff(item) {
  if (!item.retryCount || !item.lastAttempt) return false;
  const delay = Math.min(1000 * Math.pow(2, item.retryCount), 300_000);
  return Date.now() - item.lastAttempt < delay;
}

async function moveToDeadLetter(items) {
  if (!items.length) return;
  try {
    const existing = await appStorage.getJson(DEAD_LETTER_KEY, []);
    const merged = [...existing, ...items].slice(-50);
    await appStorage.setJson(DEAD_LETTER_KEY, merged);
  } catch {}
}

export async function getDeadLetterCount() {
  try {
    return (await appStorage.getJson(DEAD_LETTER_KEY, [])).length;
  } catch { return 0; }
}

export async function flushQueue() {
  if (_flushing) return { processed: 0, failed: 0, types: [] };
  _flushing = true;
  const startTime = Date.now();
  try {
    const session = await getSession();
    if (!session) return { processed: 0, failed: 0, types: [] };
    const activeUserId = session.user?.id;

    const list = await readQueue();
    if (!list.length) return { processed: 0, failed: 0, types: [] };

    const now = Date.now();
    const remaining = [];
    const dead = [];
    let processed = 0;
    let failed = 0;
    const processedTypes = [];

    const valid = [];
    for (const item of list) {
      const itemUserId = getOperationUserId(item);
      if (activeUserId && itemUserId && itemUserId !== activeUserId) {
        remaining.push(item);
        continue;
      }
      if (item.queuedAt && now - item.queuedAt > MAX_AGE_MS) {
        dead.push(item);
      } else if ((item.retryCount || 0) >= MAX_RETRIES) {
        dead.push(item);
      } else {
        valid.push(item);
      }
    }

    for (let i = 0; i < valid.length; i++) {
      if (Date.now() - startTime > FLUSH_TIMEOUT_MS) {
        for (let j = i; j < valid.length; j++) remaining.push(valid[j]);
        break;
      }

      const item = valid[i];
      if (shouldSkipByBackoff(item)) {
        remaining.push(item);
        continue;
      }

      try {
        await runOne(item);
        processed += 1;
        if (!processedTypes.includes(item.type)) processedTypes.push(item.type);
      } catch (e) {
        const bumped = { ...item, retryCount: (item.retryCount || 0) + 1, lastAttempt: Date.now() };
        if (isAuthError(e)) {
          remaining.push(bumped);
          for (let j = i + 1; j < valid.length; j++) remaining.push(valid[j]);
          break;
        }
        if (isPermanentError(e)) {
          dead.push({ ...item, deadReason: e?.code || e?.status || "permanent" });
          failed += 1;
          continue;
        }
        remaining.push(bumped);
        failed += 1;
      }
    }

    if (dead.length) await moveToDeadLetter(dead);
    await writeQueue(remaining);
    return { processed, failed, types: processedTypes };
  } finally { _flushing = false; }
}

export async function clearQueue() {
  await writeQueue([]);
}

export async function getPendingStudyLogs(userId) {
  const list = await readQueue();
  return list
    .filter((item) => item.type === OP_STUDY_LOG)
    .filter((item) => !userId || item.payload?.user_id === userId)
    .map((item) => item.payload);
}

export async function saveStudyLogOffline(payload) {
  const clientOperationId = payload?.client_operation_id || createClientOperationId(OP_STUDY_LOG);
  const payloadWithId = withClientOperationId(payload, clientOperationId);
  try {
    await addStudyLog(payloadWithId);
    return { saved: true, queued: false };
  } catch (e) {
    await enqueue({ type: OP_STUDY_LOG, payload: payloadWithId, clientOperationId });
    return { saved: false, queued: true, error: e };
  }
}

export async function saveTrialOffline(trial, subjects) {
  const clientOperationId = trial?.client_operation_id || createClientOperationId(OP_TRIAL);
  const trialWithId = withClientOperationId(trial, clientOperationId);
  try {
    await addTrial(trialWithId, subjects);
    return { saved: true, queued: false };
  } catch (e) {
    await enqueue({ type: OP_TRIAL, payload: { trial: trialWithId, subjects }, clientOperationId });
    return { saved: false, queued: true, error: e };
  }
}

export async function saveWrongQuestionOffline(payload) {
  const clientOperationId = payload?.client_operation_id || createClientOperationId(OP_WRONG_QUESTION);
  const payloadWithId = withClientOperationId(payload, clientOperationId);
  try {
    const saved = await addWrongQuestion(payloadWithId);
    return { saved: true, queued: false, data: saved };
  } catch (e) {
    await enqueue({ type: OP_WRONG_QUESTION, payload: payloadWithId, clientOperationId });
    return { saved: false, queued: true, error: e };
  }
}

export async function saveUserTaskOffline(payload) {
  const clientOperationId = payload?.client_operation_id || createClientOperationId(OP_USER_TASK);
  const payloadWithId = withClientOperationId(payload, clientOperationId);
  try {
    const saved = await createUserTask(payloadWithId);
    return { saved: true, queued: false, data: saved };
  } catch (e) {
    await enqueue({ type: OP_USER_TASK, payload: payloadWithId, clientOperationId });
    return { saved: false, queued: true, error: e };
  }
}

// KUYRUKTAKİ KAYITLARI EKRANDA GÖSTERMEK İÇİN OKUYUCULAR
//
// Sorun: çevrimdışı deneme girildiğinde "bağlantı gelince gönderilecek"
// deniyordu ama liste yalnızca sunucudan besleniyordu. Kullanıcı ekranı bir
// kez tazeleyince deneme listeden yok oluyordu — veri aslında kuyruktaydı,
// ama kullanıcı için kaybolmuş demekti. Çalışma logları için bu köprü
// (getPendingStudyLogs) zaten vardı; deneme ve yanlış soru için yoktu.

/** Kuyruktaki denemeler — sunucu listesine eklenmek üzere. */
export async function getPendingTrials(userId) {
  const list = await readQueue();
  return list
    .filter((item) => item.type === OP_TRIAL)
    .filter((item) => !userId || item.payload?.trial?.user_id === userId)
    .map((item) => ({
      ...item.payload.trial,
      // normalizeTrial trial_subjects'i bekliyor; kuyrukta ayrı duruyor.
      trial_subjects: item.payload.subjects || [],
      id: item.clientOperationId || item.id,
      pending: true,
    }));
}

/** Kuyruktaki yanlış sorular. */
export async function getPendingWrongQuestions(userId) {
  const list = await readQueue();
  return list
    .filter((item) => item.type === OP_WRONG_QUESTION)
    .filter((item) => !userId || item.payload?.user_id === userId)
    .map((item) => ({
      ...item.payload,
      id: item.clientOperationId || item.id,
      pending: true,
    }));
}

/** Kalıcı olarak başarısız olmuş kayıtlar — kullanıcıya gösterilebilir. */
export async function getDeadLetterItems() {
  try {
    return await appStorage.getJson(DEAD_LETTER_KEY, []);
  } catch { return []; }
}

/**
 * Dead-letter'daki kayıtları kuyruğa geri koyar.
 * Sayaçlar sıfırlanır ki backoff/retry limiti baştan başlasın.
 */
export async function retryDeadLetter() {
  const items = await getDeadLetterItems();
  if (!items.length) return { requeued: 0 };
  const list = await readQueue();
  const known = new Set(list.map((i) => i.clientOperationId || i.id));
  const requeued = [];
  for (const item of items) {
    const id = item.clientOperationId || item.id;
    if (id && known.has(id)) continue;
    requeued.push({ ...item, retryCount: 0, lastAttempt: null, queuedAt: Date.now(), deadReason: undefined });
  }
  await writeQueue([...list, ...requeued].slice(-MAX_QUEUE_SIZE));
  await appStorage.setJson(DEAD_LETTER_KEY, []);
  return { requeued: requeued.length };
}

/** Kullanıcı "vazgeç" derse — kayıtları kalıcı olarak siler. */
export async function clearDeadLetter() {
  try { await appStorage.setJson(DEAD_LETTER_KEY, []); } catch {}
}

/** Kuyruktan tek bir kaydı çıkarır (kullanıcı henüz gönderilmemiş kaydı silerse). */
export async function removeFromQueue(id) {
  if (!id) return false;
  const list = await readQueue();
  const next = list.filter((item) => (item.clientOperationId || item.id) !== id);
  if (next.length === list.length) return false;
  await writeQueue(next);
  return true;
}
