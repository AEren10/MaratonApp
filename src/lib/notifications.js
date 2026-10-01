import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { STORAGE_KEYS, userScopedKey } from "../constants/storageKeys";
import { SCREENS } from "../constants/screens";
import { notificationUrl } from "../navigation/routes";
import { getOptimalHour } from "./notificationTemplates";
import { getNotificationPrefs, updateNotificationPrefs, registerPushToken } from "../supabase/profiles";
import * as appStorage from "./storage/appStorage";
import { buildNotificationPlan, PLAN_TYPES } from "../domain/notify/notificationPlan";
import { getSession } from "../supabase/auth";
import { registerSessionReset } from "./session/sessionReset";

const STORAGE_KEY = STORAGE_KEYS.NOTIF_PREFS;
const CONTEXT_KEY = STORAGE_KEYS.NOTIF_CONTEXT;

function notifPrefsKey(userId) {
  return userScopedKey(STORAGE_KEY, userId);
}

function notifContextKey(userId) {
  return userScopedKey(CONTEXT_KEY, userId);
}

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    // Uygulama öndeyken OS banner'ı basma. Kullanıcı zaten içerideyse bilgi
    // ekran içinde görünmeli; push banner'ı aynı anda ikinci bir bağırış olur.
    shouldShowAlert: false,
    shouldPlaySound: false,
    shouldSetBadge: true,
    shouldShowBanner: false,
    shouldShowList: false,
  }),
});

if (Platform.OS === "android") {
  Notifications.setNotificationChannelAsync("default", {
    name: "Genel Bildirimler",
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 250, 250, 250],
    sound: "default",
  }).catch(() => {});
}

export async function requestNotificationPermissions() {
  if (Platform.OS === "web") return false;
  try {
    const { status: existing } = await Notifications.getPermissionsAsync();
    let finalStatus = existing;
    if (existing !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    return finalStatus === "granted";
  } catch (_) {
    return false;
  }
}

export async function getNotifPrefs(userId = null) {
  try {
    const prefs = await appStorage.getJson(notifPrefsKey(userId), null);
    if (prefs) return prefs;
  } catch (_) {}
  return {
    dailyReminderEnabled: true,
    dailyReminderHour: 19,
    dailyReminderMinute: 0,
    streakRiskEnabled: true,
    trialReminderEnabled: false,
    taskReminderEnabled: true,
    weeklySummaryEnabled: true,
  };
}

export async function setNotifPrefs(prefs, userId) {
  try {
    await appStorage.setJson(notifPrefsKey(userId), prefs);
  } catch (_) {}
  if (userId && userId !== "dev") {
    await updateNotificationPrefs(userId, prefs);
  }
}

export async function loadNotifPrefsFromServer(userId) {
  if (!userId || userId === "dev") return null;
  try {
    const prefs = await getNotificationPrefs(userId);
    if (prefs) {
      await appStorage.setJson(notifPrefsKey(userId), prefs);
      return prefs;
    }
  } catch {}
  return null;
}

// Cikis iptali de siraya girer: ucustaki bir kurulumun ONUNE gecip sonra
// onun kurduklarini ortada birakmasin.
export async function cancelAllScheduled() {
  return serial(async () => {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
    } catch (_) {}
  });
}

// Sadece verilen tipleri iptal eder. applyNotifPrefs'in her açılışta
// cancelAllScheduled çağırması, plan akışının kurduğu task_reminder
// bildirimlerini de siliyordu — retention'ın en güçlü kancası sessizce
// ölüyordu. Tercih uygulaması artık yalnızca kendi kurduklarına dokunur.
export async function cancelScheduledByType(types) {
  if (Platform.OS === "web") return;
  const wanted = new Set(types);
  try {
    const all = await Notifications.getAllScheduledNotificationsAsync();
    for (const n of all) {
      if (wanted.has(n.content?.data?.type)) {
        await Notifications.cancelScheduledNotificationAsync(n.identifier);
      }
    }
  } catch (_) {}
}

// Bildirim kurma islemleri TEK SIRADA: "iptal et + kur" adimlari ayni anda
// iki yerden (acilis senkronu, ana sayfa, calisma kaydi) calisirsa ayni
// bildirim iki kez kurulabiliyordu.
let notifQueue = Promise.resolve();
function serial(fn) {
  const run = notifQueue.then(fn, fn);
  notifQueue = run.catch(() => {});
  return run;
}

// Gec donen bir cagri (A'nin acilis senkronu, ana sayfasi) cikistan SONRA
// A'nin hatirlatmalarini yeniden kurmasin: userId verildiyse aktif oturumun
// sahibi olmali. Sira icinde calisir, yani cikis iptalinden once/sonra net.
async function isActiveOwner(userId) {
  if (!userId || userId === "dev") return true;
  try {
    const session = await getSession();
    return session?.user?.id === userId;
  } catch (_) {
    return false;
  }
}

// applyNotifPrefs'in yönettiği tipler (bkz. domain/notify/notificationPlan).
// "trial_reminder" eskiden haftalik tekrarlayan tetikti; kurulu kalmis olanlar da temizlensin.
const PREF_MANAGED_TYPES = PLAN_TYPES;

function hashString(value = "") {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = ((hash << 5) - hash + value.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

function notificationJitterMinutes(userId, type, window = 40) {
  if (!userId) return 0;
  const span = Math.max(0, Math.floor(window));
  return (hashString(`${userId}:${type}`) % (span + 1)) - Math.floor(span / 2);
}

// Ekran anahtari -> derin baglanti. Plan saf kalsin diye ekran adlari burada.
const PLAN_SCREENS = {
  plan: () => notificationUrl(SCREENS.PLAN_DETAIL),
  review: () => notificationUrl(SCREENS.REVIEW_SESSION),
  summary: () => notificationUrl(SCREENS.SUMMARY, { period: "week" }),
  comparative: () => notificationUrl(SCREENS.COMPARATIVE),
  trial: () => notificationUrl(SCREENS.TRIAL_ENTRY),
  route: () => notificationUrl(SCREENS.ROADMAP),
};

// Yonetilen tum bildirimleri plandan kurar. Cagiran once iptal eder.
// Aliskanlik saati secilen saatten en fazla 1 saat sapabilir (19:00 secene
// 16:00 hata gibi okunuyordu).
async function schedulePlan(prefs, context, userId) {
  if (Platform.OS === "web" || !prefs) return;
  const chosen = Number(prefs.dailyReminderHour ?? 19);
  const optHour = await getOptimalHour(userId).catch(() => chosen);
  const habitHour = Math.abs(optHour - chosen) <= 1 ? optHour : chosen;
  const items = buildNotificationPlan({
    now: new Date(),
    prefs,
    context,
    habitHour,
    jitter: (type) => notificationJitterMinutes(userId, type, 30),
  });
  for (const item of items) {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: item.title,
          body: item.body,
          data: { type: item.type, url: (PLAN_SCREENS[item.screen] || PLAN_SCREENS.plan)() },
        },
        trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: item.date },
      });
    } catch (_) {}
  }
}

/**
 * Bildirim bağlamının son bilinen hâli.
 *
 * Neden var: applyNotifPrefs her çağrıldığında yönettiği TÜM bildirimleri
 * iptal edip yeniden kuruyor. Ama üç yer (App.js açılışı, onboarding'de
 * hedef kaydı, bildirim ayarları) bunu bağlam VERMEDEN çağırıyordu.
 * Bağlam boş olunca streak=0 ve studiedToday=false varsayılıyor; sonuç:
 * bugün çalışmış, 40 günlük serisi olan kullanıcı yanlış bir seri uyarısı
 * alıyordu. Üstelik useDataSync'in
 * doğru bağlamla kurduğu bildirim de bu sırada siliniyordu.
 *
 * Artık bağlam diske yazılıyor ve verilmediğinde oradan okunuyor.
 */
async function readNotifContext(userId = null) {
  try { return (await appStorage.getJson(notifContextKey(userId), null)) || {}; } catch { return {}; }
}

const EXAM_EVE_TYPE = "exam_eve_reminder";

// Sinav gunu planinin "Bir gün önce hatırlat" anahtari. PREF_MANAGED_TYPES'a
// BILEREK eklenmedi: tercih uygulamasi kendi kurduklarini iptal ediyor, bu
// tek seferlik hatirlatma o temizlige takilmamali. Once eski kayit iptal
// edilir — tarih degisince iki bildirim kalmasin.
// Metin tasarimdan: Sinav Gunu Plani basligi + "Son Hafta Geride" satiri.
export async function scheduleExamEveReminder(date) {
  if (Platform.OS === "web") return null;
  await cancelScheduledByType([EXAM_EVE_TYPE]);
  if (!date) return null;
  const when = date instanceof Date ? date : new Date(date);
  if (Number.isNaN(when.getTime()) || when.getTime() <= Date.now()) return null;
  try {
    return await Notifications.scheduleNotificationAsync({
      content: {
        title: "Sınav günü planı",
        body: "Saat, çanta, yol · şimdi hazırla",
        data: { type: EXAM_EVE_TYPE, url: notificationUrl(SCREENS.EXAM_DAY_PLAN) },
      },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: when },
    });
  } catch {
    return null;
  }
}

export async function cancelExamEveReminder() {
  if (Platform.OS === "web") return;
  await cancelScheduledByType([EXAM_EVE_TYPE]);
}

const REHEARSAL_TYPE = "exam_rehearsal_reminder";

// Deneme provasi: "Sabah 09:45'te tek hatırlatma". Metin tasarimin prova
// ekranindan. Tek seferlik, tercih temizligine takilmaz (bkz. yukarisi).
export async function scheduleRehearsalReminder(date) {
  if (Platform.OS === "web") return null;
  await cancelScheduledByType([REHEARSAL_TYPE]);
  const when = date instanceof Date ? date : new Date(date);
  if (Number.isNaN(when.getTime()) || when.getTime() <= Date.now()) return null;
  try {
    return await Notifications.scheduleNotificationAsync({
      content: {
        title: "Sınav saatinde prova.",
        body: "Gerçek oturum uzunluğu, gerçek saat.",
        data: { type: REHEARSAL_TYPE, url: notificationUrl(SCREENS.EXAM_SIMULATOR) },
      },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: when },
    });
  } catch {
    return null;
  }
}

export async function cancelRehearsalReminder() {
  if (Platform.OS === "web") return;
  await cancelScheduledByType([REHEARSAL_TYPE]);
}

export async function saveNotifContext(context = {}, userId = null) {
  try { await appStorage.setJson(notifContextKey(userId), context); } catch (_) {}
}

export function applyNotifPrefs(prefs, context, userId = null) {
  return serial(() => applyNotifPrefsNow(prefs, context, userId));
}

async function applyNotifPrefsNow(prefs, context, userId = null) {
  if (!(await isActiveOwner(userId))) return;
  await cancelScheduledByType(PREF_MANAGED_TYPES);
  if (!prefs) return;
  // Birlestir: acilis senkronu seri bilgisini, ana sayfa gunun planini ve
  // hafta toplamini yazar; biri digerini silmesin.
  const stored = await readNotifContext(userId);
  if (context) {
    context = { ...stored, ...context };
    await saveNotifContext(context, userId);
  } else context = stored;
  // Bağlam hiç bilinmiyorsa (ilk açılış) seri bildirimi plan tarafinda
  // kurulmaz: studiedToday tanimsizken plan seri dilimini atlar.
  await schedulePlan(prefs, context, userId);
}

/**
 * Bugun calisma kaydedildi: o gecenin seri-riski bildirimi iptal, yarina kur.
 *
 * Seri bildirimi yalniz acilis senkronunda kuruluyordu. Uygulama acikken
 * kayit giren ogrenciye gece 22:00'de yine "Bugun kayit yok gibi gorunuyor"
 * gidiyordu -- bildirimleri kapattiran turden bir yanlis-pozitif.
 * Yalniz "calisti" yonunde calisir: "calismadi" kararini acilis senkronu
 * (dogru veriyle) verir.
 */
export function onStudiedToday(streak = 0, userId = null) {
  if (Platform.OS === "web") return Promise.resolve();
  return serial(() => onStudiedTodayNow(streak, userId));
}

async function onStudiedTodayNow(streak, userId) {
  try {
    if (!(await isActiveOwner(userId))) return;
    const prefs = await getNotifPrefs(userId);
    await cancelScheduledByType(PREF_MANAGED_TYPES);
    const context = { ...(await readNotifContext(userId)), streak, studiedToday: true };
    await saveNotifContext(context, userId);
    await schedulePlan(prefs, context, userId);
  } catch (_) {}
}

/**
 * Ana sayfadan: bugunun plani (acik durak, siradaki), tekrari gelen yanlis
 * sayisi ve hafta toplami. Degismediyse bir sey yapmaz; degistiyse gunluk
 * hatirlatma ve Pazar karnesi yeni metinle yeniden kurulur. Kismi alan
 * gonderilebilir (ornegin yalniz reviewDue).
 */
let lastReminderKey = null;
// Cikis tum bildirimleri siler; ayni kullanici geri girince "degismedi" deyip
// gunluk hatirlatmayi yeniden kurmamazlik etmesin.
registerSessionReset(() => { lastReminderKey = null; });
export function updateReminderContent(partial = {}, userId = null) {
  if (Platform.OS === "web") return Promise.resolve();
  return serial(() => updateReminderContentNow(partial, userId));
}

async function updateReminderContentNow(partial, userId) {
  try {
    if (!(await isActiveOwner(userId))) return;
    const context = await readNotifContext(userId);
    const next = { ...context, ...partial };
    const key = JSON.stringify([userId, next]);
    if (key === lastReminderKey) return;
    lastReminderKey = key;
    await saveNotifContext(next, userId);
    const prefs = await getNotifPrefs(userId);
    if (!prefs) return;
    await cancelScheduledByType(PREF_MANAGED_TYPES);
    await schedulePlan(prefs, next, userId);
  } catch (_) {}
}

export async function scheduleTaskNotifications(taskCount, userId = null) {
  if (Platform.OS === "web") return;
  return serial(() => scheduleTaskNotificationsNow(taskCount, userId));
}

async function scheduleTaskNotificationsNow(taskCount, userId) {
  if (!(await isActiveOwner(userId))) return;
  // Eskiden her gun 20:00'de TEKRARLAYAN "hedeflerine ulasmadin" kuruluyordu;
  // uygulamayi birakana aylarca gidiyordu. Acik duraklar artik planin aksam
  // dilimiyle ("gun bitmedi") hatirlatiliyor; burada yalniz eskiler temizlenir.
  await cancelTaskReminders();
}

export async function cancelTaskReminders() {
  if (Platform.OS === "web") return;
  try {
    const all = await Notifications.getAllScheduledNotificationsAsync();
    for (const n of all) {
      if (n.content?.data?.type === "task_reminder") {
        await Notifications.cancelScheduledNotificationAsync(n.identifier);
      }
    }
  } catch (_) {}
}

/**
 * İzin verildikten HEMEN SONRA push token'ı sunucuya yazar.
 *
 * Boşluk şuydu: registerPushToken yalnızca useDataSync'teki loadAll içinde
 * çağrılıyordu. Onboarding'de kullanıcı izni verdiğinde loadAll çoktan
 * çalışmış oluyor ve o an izin yokken getExpoPushToken() null dönmüştü —
 * yani yeni kullanıcının token'ı hiç kaydedilmiyordu. Sonuç: sunucu
 * tarafındaki re-engagement push'u (send-push) o kullanıcıya ulaşamıyordu;
 * token ancak uygulama arka plana alınıp geri açılınca yazılıyordu.
 */
export async function ensurePushTokenRegistered(userId) {
  if (!userId || userId === "dev" || Platform.OS === "web") return false;
  try {
    const token = await getExpoPushToken();
    if (!token) return false;
    await registerPushToken(userId, token);
    return true;
  } catch (_) {
    return false;
  }
}

export async function getExpoPushToken() {
  if (Platform.OS === "web") return null;
  try {
    const { status } = await Notifications.getPermissionsAsync();
    if (status !== "granted") return null;
    const { data } = await Notifications.getExpoPushTokenAsync({
      projectId: "b7c40c1c-f724-4c07-ad36-696ef890ce64",
    });
    return data;
  } catch {
    return null;
  }
}
