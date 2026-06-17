import AsyncStorage from "@react-native-async-storage/async-storage";
import { addStudyLog } from "../supabase/studyLogs";
import { addTrial } from "../supabase/trials";

const QUEUE_KEY = "@maraton:offlineQueue";

// Operation types
export const OP_STUDY_LOG = "STUDY_LOG";
export const OP_TRIAL = "TRIAL";

async function readQueue() {
  try {
    const raw = await AsyncStorage.getItem(QUEUE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (_) {
    return [];
  }
}

async function writeQueue(items) {
  try {
    await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(items));
  } catch (_) {}
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
    default:
      throw new Error(`Unknown op type: ${item.type}`);
  }
}

export async function flushQueue() {
  const list = await readQueue();
  if (!list.length) return { processed: 0, failed: 0 };

  const remaining = [];
  let processed = 0;
  let failed = 0;

  for (const item of list) {
    try {
      await runOne(item);
      processed += 1;
    } catch (e) {
      remaining.push(item);
      failed += 1;
    }
  }

  await writeQueue(remaining);
  return { processed, failed };
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
