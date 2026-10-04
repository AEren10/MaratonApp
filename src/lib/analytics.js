import { EVENTS } from "../constants/analytics";
import { STORAGE_KEYS } from "../constants/storageKeys";
import { insertAnalyticsEvents } from "../supabase/analyticsEvents";
import {
  acknowledgeAnalyticsPartition,
  createAnalyticsEnvelope,
  canReuseAnalyticsInitialization,
  isActiveAnalyticsIdentity,
  mergeAnalyticsEvents,
  mergeAnalyticsPartitions,
  removeAnalyticsEvents,
} from "./analyticsState";
import * as appStorage from "./storage/appStorage";

// Sağlayıcı bağımsız ürün analitiği kuyruğu. Hatalar hiçbir kullanıcı akışını
// bozmaz; olaylar kullanıcı bazında, kimlikleri değişmeden tekrar denenir.
const BUFFER_KEY = STORAGE_KEYS.ANALYTICS_BUFFER;
const PENDING_KEY = STORAGE_KEYS.ANALYTICS_PENDING;
const MAX_BUFFER = 200;
const FLUSH_TRIGGER_SIZE = 10;
const FLUSH_BATCH_SIZE = 50;
const FLUSH_INTERVAL_MS = 30_000;
const MAX_PENDING = 120;

let buffersByUser = {};
let pendingEvents = [];
let userId = null;
let sessionId = null;
let flushTimer = null;
let identityGeneration = 0;
let storageWrites = Promise.resolve();
const flushesByUser = new Map();
const initializationsByUser = new Map();
let storageLoadPromise = null;

function newSessionId() {
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

function normalizeEvent(item, fallbackUserId = null) {
  if (!item?.event) return null;
  return createAnalyticsEnvelope(item.event, item.props, {
    at: item.at || item.occurred_at,
    clientEventId: item.clientEventId || item.client_event_id,
    sessionId: item.sessionId || item.session_id,
    userId: item.userId || item.user_id || fallbackUserId,
  });
}

function normalizeStoredBuffers(value) {
  const next = {};
  const add = (owner, items) => {
    if (!owner) return;
    const normalized = (Array.isArray(items) ? items : [])
      .map((item) => normalizeEvent(item, owner))
      .filter(Boolean);
    next[owner] = mergeAnalyticsEvents(next[owner], normalized).slice(-MAX_BUFFER);
  };
  if (Array.isArray(value)) {
    for (const item of value) add(item?.userId || item?.user_id, [item]);
  } else {
    for (const [owner, items] of Object.entries(value?.byUser || {})) add(owner, items);
  }
  return next;
}

// Anlik goruntu yazim aninda yeni dizilerden kurulur (olaylar degismez);
// derin kopya gerekmez -- setJson zaten serilestiriyor.
function queueStorageWrite(key, value) {
  storageWrites = storageWrites
    .catch(() => {})
    .then(() => appStorage.setJson(key, value))
    .catch(() => {});
  return storageWrites;
}

// track() diske HER olayda degil, kisa bir sureden sonra TEK SEFERDE yazar.
// Eskiden her sekme gecisi 3 olay = 3 kez 200 olayliga kadar tamponun JSON
// kopyasi + 3 AsyncStorage yazimi, tam yeni ekranin cizildigi karede (kasma).
const PERSIST_DELAY_MS = 2000;
const dirtyKeys = new Set();
let persistTimer = null;

function schedulePersist(key) {
  dirtyKeys.add(key);
  if (persistTimer) return;
  persistTimer = setTimeout(persistDirty, PERSIST_DELAY_MS);
}

function persistDirty() {
  clearTimeout(persistTimer);
  persistTimer = null;
  const keys = [...dirtyKeys];
  dirtyKeys.clear();
  for (const key of keys) {
    if (key === BUFFER_KEY) persistBuffers();
    else if (key === PENDING_KEY) persistPending();
  }
  return storageWrites;
}

function persistBuffers() {
  const byUser = Object.fromEntries(
    Object.entries(buffersByUser).map(([owner, events]) => [owner, events.slice(-MAX_BUFFER)]),
  );
  return queueStorageWrite(BUFFER_KEY, { version: 2, byUser });
}

function persistPending() {
  return queueStorageWrite(PENDING_KEY, pendingEvents.slice(-MAX_PENDING));
}

function appendForUser(owner, event) {
  buffersByUser[owner] = mergeAnalyticsEvents(buffersByUser[owner], [event]).slice(-MAX_BUFFER);
}

export function setAnalyticsUser(id) {
  const next = id || null;
  if (next === userId) {
    if (!next) sessionId = null;
    return;
  }
  userId = next;
  sessionId = null;
  identityGeneration += 1;
}

export function startAnalyticsSession() {
  sessionId = newSessionId();
  return sessionId;
}

async function deliverBatch(batch) {
  const rows = batch.map((event) => ({
    client_event_id: event.clientEventId,
    user_id: event.userId,
    session_id: event.sessionId,
    event: event.event,
    props: event.props,
    occurred_at: event.at,
  }));
  try {
    await insertAnalyticsEvents(rows);
    return batch.map((event) => event.clientEventId);
  } catch (error) {
    if (error?.code !== "23505") return [];
  }

  const delivered = [];
  for (let index = 0; index < rows.length; index += 1) {
    try {
      await insertAnalyticsEvents([rows[index]]);
      delivered.push(batch[index].clientEventId);
    } catch (error) {
      if (error?.code === "23505") delivered.push(batch[index].clientEventId);
      else break;
    }
  }
  return delivered;
}

async function flushUser(owner) {
  if (!owner || !(buffersByUser[owner]?.length)) return;
  if (flushesByUser.has(owner)) return flushesByUser.get(owner);
  const run = (async () => {
    const batch = buffersByUser[owner].slice(0, FLUSH_BATCH_SIZE);
    const deliveredIds = await deliverBatch(batch);
    if (!deliveredIds.length) return;
    buffersByUser = acknowledgeAnalyticsPartition(buffersByUser, owner, deliveredIds);
    await persistBuffers();
  })().catch(() => {}).finally(() => flushesByUser.delete(owner));
  flushesByUser.set(owner, run);
  return run;
}

export function flushAnalytics() {
  // Arka plana geciste bekleyen yazim beklemesin: uygulama orada oldurulebilir.
  persistDirty();
  return flushUser(userId);
}

export function track(event, props = {}) {
  if (!event) return;
  try {
    if (!sessionId) startAnalyticsSession();
    const envelope = createAnalyticsEnvelope(event, props, { userId, sessionId });
    if (!userId) {
      pendingEvents = mergeAnalyticsEvents(pendingEvents, [envelope]).slice(-MAX_PENDING);
      schedulePersist(PENDING_KEY);
      return;
    }
    appendForUser(userId, envelope);
    schedulePersist(BUFFER_KEY);
    if (buffersByUser[userId].length >= FLUSH_TRIGGER_SIZE) flushUser(userId);
  } catch (_) {}
}

export function trackForAnalyticsUser(owner, event, props = {}) {
  if (!owner || owner !== userId) return false;
  track(event, props);
  return true;
}

export function trackButtonTap(id, props = {}) { track(EVENTS.BUTTON_TAP, { id, ...props }); }
export function trackFormStarted(form, props = {}) { track(EVENTS.FORM_STARTED, { form, ...props }); }
export function trackFormCompleted(form, props = {}) { track(EVENTS.FORM_COMPLETED, { form, ...props }); }
export function trackFormAbandoned(form, props = {}) { track(EVENTS.FORM_ABANDONED, { form, ...props }); }
export function trackPaywallViewed(source, props = {}) {
  track(EVENTS.PAYWALL_VIEWED, { source, ...props });
  if (source) track(EVENTS.PAYWALL_SOURCE, { source, ...props });
}
export function trackNotificationOpened(type, props = {}) {
  track(EVENTS.PUSH_OPENED, { type, ...props });
}

async function loadStoredAnalyticsOnce() {
  if (storageLoadPromise) return storageLoadPromise;
  storageLoadPromise = (async () => {
    await storageWrites.catch(() => {});
    let storedBuffers = null;
    let storedPending = null;
    try {
      [storedBuffers, storedPending] = await Promise.all([
        appStorage.getJson(BUFFER_KEY, null),
        appStorage.getJson(PENDING_KEY, null),
      ]);
    } catch (_) {}

    const loaded = normalizeStoredBuffers(storedBuffers);
    buffersByUser = mergeAnalyticsPartitions(loaded, buffersByUser, MAX_BUFFER);
    pendingEvents = mergeAnalyticsEvents(
      (Array.isArray(storedPending) ? storedPending : []).map((item) => normalizeEvent(item)).filter(Boolean),
      pendingEvents,
    ).slice(-MAX_PENDING);
  })().catch(() => {});
  return storageLoadPromise;
}

async function initialize(owner, generation) {
  await loadStoredAnalyticsOnce();
  if (!isActiveAnalyticsIdentity(owner, generation, userId, identityGeneration)) return false;

  const adoptedIds = new Set(pendingEvents.map((event) => event.clientEventId));
  for (const event of pendingEvents) {
    appendForUser(owner, { ...event, userId: owner, sessionId: event.sessionId || sessionId });
  }
  pendingEvents = removeAnalyticsEvents(pendingEvents, adoptedIds);
  await Promise.all([persistBuffers(), persistPending()]);

  clearInterval(flushTimer);
  flushTimer = setInterval(flushAnalytics, FLUSH_INTERVAL_MS);
  flushUser(owner);
  return true;
}

export function initAnalytics(id) {
  const owner = id || null;
  if (!owner) return Promise.resolve();
  const existing = initializationsByUser.get(owner);
  if (canReuseAnalyticsInitialization(existing, userId, identityGeneration)) return existing.promise;
  if (owner === userId && sessionId && flushTimer) return Promise.resolve();
  setAnalyticsUser(owner);
  startAnalyticsSession();
  const generation = identityGeneration;
  const run = initialize(owner, generation).finally(() => {
    if (initializationsByUser.get(owner)?.promise === run) initializationsByUser.delete(owner);
  });
  initializationsByUser.set(owner, { owner, generation, promise: run });
  return run;
}

export function stopAnalytics() {
  clearInterval(flushTimer);
  flushTimer = null;
}

export async function closeAnalytics({ flush = true } = {}) {
  const closingUser = userId;
  persistDirty();
  stopAnalytics();
  if (flush && closingUser) await flushUser(closingUser);
  if (userId === closingUser) setAnalyticsUser(null);
}
