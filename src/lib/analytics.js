import { EVENTS } from "../constants/analytics";
import { STORAGE_KEYS } from "../constants/storageKeys";
import { insertAnalyticsEvents } from "../supabase/analyticsEvents";
import * as appStorage from "./storage/appStorage";

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
  // Çıkışta oturumu da kapat: aksi halde sonraki giriş eski sessionId'yi
  // devralıyor ve iki kullanıcının olayları tek oturumda birleşiyordu.
  if (!userId) sessionId = null;
}

export function startAnalyticsSession() {
  sessionId = newSessionId();
}

async function loadBuffer() {
  try {
    const loaded = await appStorage.getJson(BUFFER_KEY, null);
    if (loaded) {
      buffer = loaded.filter((e) => e.userId && (!userId || e.userId === userId));
    }
  } catch (_) {
    buffer = [];
  }
}

async function persistBuffer() {
  try {
    await appStorage.setJson(BUFFER_KEY, buffer.slice(-MAX_BUFFER));
  } catch (_) {}
}

export async function flushAnalytics() {
  if (flushing || buffer.length === 0 || !userId) return;
  flushing = true;
  buffer = buffer.filter((e) => e.userId === userId);
  const batch = buffer.slice(0, FLUSH_SIZE * 5);
  if (!batch.length) {
    flushing = false;
    await persistBuffer();
    return;
  }
  try {
    await insertAnalyticsEvents(
      batch.map((e) => ({
        user_id: e.userId,
        session_id: e.sessionId,
        event: e.event,
        props: e.props,
        occurred_at: e.at,
      })),
    );
    buffer = buffer.slice(batch.length);
    await persistBuffer();
  } catch (_) {
    // Tablo yoksa veya bağlantı yoksa olaylar tamponda kalır, sonra denenir.
  } finally {
    flushing = false;
  }
}

// Kullanıcı kimliği daha atanmadan gelen olaylar. Soğuk açılışta bildirime
// dokunup uygulamayı açan kullanıcının PUSH_OPENED olayı burada tutulur:
// linking.js getInitialURL() içinde track çağırıyor ama initAnalytics henüz
// çalışmamış oluyordu, olay sessizce düşüyordu — push→açılış hunisi ölçülemez
// haldeydi. initAnalytics kimliği atadıktan sonra bunlar akıtılır.
let pendingEvents = [];
const MAX_PENDING = 20;

export function track(event, props = {}) {
  if (!event) return;
  try {
    if (!userId) {
      pendingEvents.push({
        event,
        props: props && typeof props === "object" ? props : {},
        at: new Date().toISOString(),
      });
      if (pendingEvents.length > MAX_PENDING) {
        pendingEvents = pendingEvents.slice(-MAX_PENDING);
      }
      return;
    }
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

export function trackButtonTap(id, props = {}) {
  track(EVENTS.BUTTON_TAP, { id, ...props });
}

export function trackFormStarted(form, props = {}) {
  track(EVENTS.FORM_STARTED, { form, ...props });
}

export function trackFormCompleted(form, props = {}) {
  track(EVENTS.FORM_COMPLETED, { form, ...props });
}

export function trackFormAbandoned(form, props = {}) {
  track(EVENTS.FORM_ABANDONED, { form, ...props });
}

export function trackPaywallViewed(source, props = {}) {
  track(EVENTS.PAYWALL_VIEWED, { source, ...props });
  if (source) track(EVENTS.PAYWALL_SOURCE, { source, ...props });
}

export function trackNotificationOpened(type, props = {}) {
  track(EVENTS.PUSH_OPENED, { type, ...props });
}

export async function initAnalytics(id) {
  // onAuthStateChange her TOKEN_REFRESHED'de de tetikleniyor. Koşulsuz init
  // her seferinde yeni bir sessionId üretip oturum sayısını/süresini şişiriyor,
  // ayrıca loadBuffer() bellekteki henüz yazılmamış olayları diskle eziyordu.
  if (id && id === userId && sessionId) return;

  setAnalyticsUser(id);
  startAnalyticsSession();
  await loadBuffer();

  // Kimlik yokken tamponlanan olayları (soğuk açılış push'u gibi) şimdi akıt.
  if (pendingEvents.length) {
    const drained = pendingEvents;
    pendingEvents = [];
    for (const e of drained) track(e.event, e.props);
  }

  clearInterval(flushTimer);
  flushTimer = setInterval(flushAnalytics, FLUSH_INTERVAL_MS);
  flushAnalytics();
}

export function stopAnalytics() {
  clearInterval(flushTimer);
  flushTimer = null;
}
