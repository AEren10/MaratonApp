import { supabase } from "./client";
import { handleSupabaseError } from "./handleError";
import { STORAGE_KEYS } from "../constants/storageKeys";
import * as appStorage from "../lib/storage/appStorage";

const BUFFER_KEY = STORAGE_KEYS.RETENTION_BUFFER;
const MAX_BUFFER = 100;
const FLUSH_LIMIT = 20;

function clientEventId(event) {
  const stamp = Date.now().toString(36);
  const rand = Math.random().toString(36).slice(2, 10);
  return `${event}:${stamp}:${rand}`;
}

async function readBuffer() {
  try {
    const buffered = await appStorage.getJson(BUFFER_KEY, []);
    return Array.isArray(buffered) ? buffered : [];
  } catch (_) {
    return [];
  }
}

async function writeBuffer(rows) {
  try {
    await appStorage.setJson(BUFFER_KEY, rows.slice(-MAX_BUFFER));
  } catch (_) {}
}

async function bufferRow(row) {
  const rows = await readBuffer();
  if (rows.some((item) => item.client_event_id === row.client_event_id)) return;
  rows.push(row);
  await writeBuffer(rows);
}

async function insertRetentionRow(row) {
  const { data, error } = await supabase
    .from("retention_events")
    .insert(row)
    .select("id")
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function flushRetentionEvents(userId) {
  if (!userId || userId === "dev") return { processed: 0 };
  const rows = await readBuffer();
  const mine = rows.filter((row) => row.user_id === userId).slice(0, FLUSH_LIMIT);
  if (!mine.length) return { processed: 0 };

  const remaining = rows.filter((row) => row.user_id !== userId || !mine.includes(row));
  let processed = 0;
  for (const row of mine) {
    try {
      await insertRetentionRow(row);
      processed += 1;
    } catch (e) {
      // Idempotency replay: event already made it to Supabase on a prior
      // uncertain attempt, so keeping it buffered would block later events.
      if (e?.code === "23505") {
        processed += 1;
        continue;
      }
      remaining.push(...mine.slice(processed));
      await writeBuffer(remaining);
      throw e;
    }
  }

  await writeBuffer(remaining);
  return { processed };
}

export const recordRetentionEvent = async (userId, event, props = {}, source = null) => {
  if (!userId || userId === "dev" || !event) return null;
  const row = {
    user_id: userId,
    event,
    source,
    props: props && typeof props === "object" ? props : {},
    client_event_id: props?.clientEventId || clientEventId(event),
    occurred_at: new Date().toISOString(),
  };

  try {
    await flushRetentionEvents(userId);
    return await insertRetentionRow(row);
  } catch (e) {
    handleSupabaseError(e, "recordRetentionEvent");
    await bufferRow(row);
    return null;
  }
};
