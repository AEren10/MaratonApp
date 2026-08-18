import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase } from "../supabase/client";
import { STORAGE_KEYS } from "../constants/storageKeys";

// Olay gönderici. Sağlayıcı bağımsız: şu an Supabase'deki analytics_events
// tablosuna yazıyor, ileride PostHog/Amplitude eklenmek istenirse tek yer
// değişir (flush fonksiyonu).
//
// Kural: analytics ASLA uygulamayı bozmaz. Her hata sessizce yutulur ve
// olaylar en fazla yerel tamponda birikip düşer.

const BUFFER_KEY = STORAGE_KEYS.ANALYTICS_BUFFER;
const MAX_BUFFER = 200;
const FLUSH_SIZE = 10;
const FLUSH_INTERVAL_MS = 30_000;

let buffer = [];
let userId = null;
let sessionId = null;
let flushTimer = null;
let flushing = false;

function newSessionId() {
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

export function setAnalyticsUser(id) {
  userId = id || null;
}

export function startAnalyticsSession() {
  sessionId = newSessionId();
}

async function loadBuffer() {
  try {
    const raw = await AsyncStorage.getItem(BUFFER_KEY);
    if (raw) buffer = JSON.parse(raw) || [];
  } catch (_) {
    buffer = [];
  }
}

async function persistBuffer() {
  try {
    await AsyncStorage.setItem(BUFFER_KEY, JSON.stringify(buffer.slice(-MAX_BUFFER)));
  } catch (_) {}
}

export async function flushAnalytics() {
  if (flushing || buffer.length === 0) return;
  flushing = true;
  const batch = buffer.slice(0, FLUSH_SIZE * 5);
  try {
    const { error } = await supabase.from("analytics_events").insert(
      batch.map((e) => ({
        user_id: e.userId,
        session_id: e.sessionId,
        event: e.event,
        props: e.props,
        occurred_at: e.at,
      })),
    );
    if (error) throw error;
    buffer = buffer.slice(batch.length);
    await persistBuffer();
  } catch (_) {
    // Tablo yoksa veya bağlantı yoksa olaylar tamponda kalır, sonra denenir.
  } finally {
    flushing = false;
  }
}

export function track(event, props = {}) {
  if (!event) return;
  try {
    if (!sessionId) startAnalyticsSession();
    buffer.push({
      event,
      props: props && typeof props === "object" ? props : {},
      userId,
      sessionId,
      at: new Date().toISOString(),
    });
    if (buffer.length > MAX_BUFFER) buffer = buffer.slice(-MAX_BUFFER);
    persistBuffer();
    if (buffer.length >= FLUSH_SIZE) flushAnalytics();
  } catch (_) {}
}

export async function initAnalytics(id) {
  setAnalyticsUser(id);
  startAnalyticsSession();
  await loadBuffer();
  clearInterval(flushTimer);
  flushTimer = setInterval(flushAnalytics, FLUSH_INTERVAL_MS);
  flushAnalytics();
}

export function stopAnalytics() {
  clearInterval(flushTimer);
  flushTimer = null;
}
