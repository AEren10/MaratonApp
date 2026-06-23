import AsyncStorage from "@react-native-async-storage/async-storage";
import { addStudyLog } from "../supabase/studyLogs";
import { addTrial } from "../supabase/trials";
import { addWrongQuestion } from "../supabase/wrongQuestions";
import { createUserTask } from "../supabase/userTasks";
import { uploadWrongQuestionImage } from "../supabase/storage";

const QUEUE_KEY = "@maraton:offlineQueue";
const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 7 gün

// Operation types
export const OP_STUDY_LOG = "STUDY_LOG";
export const OP_TRIAL = "TRIAL";
export const OP_WRONG_QUESTION = "WRONG_QUESTION";
export const OP_USER_TASK = "USER_TASK";

async function readQueue() {
  try {
    const raw = await AsyncStorage.getItem(QUEUE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    if (__DEV__) console.warn("[offlineQueue] readQueue", e);
    return [];
  }
}

async function writeQueue(items) {
  try {
    await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(items));
  } catch (e) {
    if (__DEV__) console.warn("[offlineQueue] writeQueue", e);
  }
}

const MAX_QUEUE_SIZE = 200;

export async function enqueue(op) {
  let list = await readQueue();
  list.push({
    ...op,
    queuedAt: Date.now(),
    id: `${op.type}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
  });
  if (list.length > MAX_QUEUE_SIZE) {
    list = list.slice(-MAX_QUEUE_SIZE);
  }
  await writeQueue(list);
}

export async function getQueueSize() {
  const list = await readQueue();
  return list.length;
}

async function runOne(item) {
  switch (item.type) {
    case OP_STUDY_LOG:
      await addStudyLog(item.payload);
      break;
    case OP_TRIAL:
      await addTrial(item.payload.trial, item.payload.subjects);
      break;
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

let _flushing = false;

export async function flushQueue() {
  if (_flushing) return { processed: 0, failed: 0, types: [] };
  _flushing = true;
  try {
  const list = await readQueue();
  if (!list.length) return { processed: 0, failed: 0, types: [] };

  const now = Date.now();
  const remaining = [];
  let processed = 0;
  let failed = 0;
  const processedTypes = [];

  for (const item of list) {
    if (item.queuedAt && now - item.queuedAt > MAX_AGE_MS) continue;
    try {
      await runOne(item);
      processed += 1;
      if (!processedTypes.includes(item.type)) processedTypes.push(item.type);
    } catch (e) {
      remaining.push(item);
      failed += 1;
    }
  }

  await writeQueue(remaining);
  return { processed, failed, types: processedTypes };
  } finally { _flushing = false; }
}

export async function clearQueue() {
  await writeQueue([]);
}

// Save with offline fallback. Returns { saved: boolean, queued: boolean }
export async function getPendingStudyLogs() {
  const list = await readQueue();
  return list
    .filter((item) => item.type === OP_STUDY_LOG)
    .map((item) => item.payload);
}

export async function saveStudyLogOffline(payload) {
  try {
    await addStudyLog(payload);
    return { saved: true, queued: false };
  } catch (e) {
    await enqueue({ type: OP_STUDY_LOG, payload });
    return { saved: false, queued: true, error: e };
  }
}

export async function saveTrialOffline(trial, subjects) {
  try {
    await addTrial(trial, subjects);
    return { saved: true, queued: false };
  } catch (e) {
    await enqueue({ type: OP_TRIAL, payload: { trial, subjects } });
    return { saved: false, queued: true, error: e };
  }
}

export async function saveWrongQuestionOffline(payload) {
  try {
    const saved = await addWrongQuestion(payload);
    return { saved: true, queued: false, data: saved };
  } catch (e) {
    await enqueue({ type: OP_WRONG_QUESTION, payload });
    return { saved: false, queued: true, error: e };
  }
}

export async function saveUserTaskOffline(payload) {
  try {
    const saved = await createUserTask(payload);
    return { saved: true, queued: false, data: saved };
  } catch (e) {
    await enqueue({ type: OP_USER_TASK, payload });
    return { saved: false, queued: true, error: e };
  }
}
