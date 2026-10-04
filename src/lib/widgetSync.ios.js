import { requireOptionalNativeModule } from "expo";
import { getSubjectLabel } from "../themes/subjects";

// expo-widgets native modulu YOKSA (Expo Go, ya da expo-widgets eklenmeden
// once alinmis eski dev build) paket daha import aninda
// "Cannot find native module 'ExpoWidgets'" atip uygulamayi acilista
// dusuruyordu. Once modul var mi bakilir; yoksa widget dosyalari hic
// yuklenmez ve her sync sessizce false doner. require() Metro'nun modul
// grafiginde kalir, gercek build'de davranis degismez.
const HAS_WIDGETS = requireOptionalNativeModule("ExpoWidgets") != null;
const WeekWidget = HAS_WIDGETS ? require("../widgets/WeekWidget").default : null;
const TodayWidget = HAS_WIDGETS ? require("../widgets/TodayWidget").default : null;
const RouteWidget = HAS_WIDGETS ? require("../widgets/RouteWidget").default : null;
const StreakWidget = HAS_WIDGETS ? require("../widgets/StreakWidget").default : null;
const TrialWidget = HAS_WIDGETS ? require("../widgets/TrialWidget").default : null;

// WIDGET'LARA VERI YAZMA — tek gecis noktasi (iOS).
//
// Widget'lar ayri bir calisma zamaninda: uygulamanin state'ini goremez,
// veri cekemez, hook kullanamaz. Gorecekleri her sey buradan
// `updateSnapshot` ile yazilir.
//
// NEDEN .ios.js
// Widget dosyalari modul grafiginde olmali: derleyici `'widget'` direktifli
// fonksiyonu modul grafiginde gorup ayri pakete cikariyor. Ama ayni dosya
// Android'de `@expo/ui/swift-ui` yuklemeye calisirdi. Metro'nun platform
// uzantisi ikisini birden cozuyor: iOS burayi, digerleri yanindaki
// widgetSync.js'i (bos gecis) alir.

// Her yazma widget'i yeniden cizdiriyor; degismeyen veri icin yazmiyoruz.
const last = {};

// Gune bagli widget'lar (Hafta, Rota, Seri) TIMELINE ile yazilir: simdi + sonraki
// 7 gece yarisi, ayni veriyle. Widget environment.date'i her girdide o anin
// tarihi olarak alir; uygulama acilmasa da "bugun", sinav sayaci ve seri
// izgarasi gun gun ilerler. Eskiden tek snapshot yaziliyordu ve widget'in
// "bugun"u son yazma aninda donuyordu (Pazartesi hala Pazar gorunuyordu).
function timelineEntries(props, days = 7) {
  const now = new Date();
  const entries = [{ date: now, props }];
  for (let i = 1; i <= days; i += 1) {
    entries.push({ date: new Date(now.getFullYear(), now.getMonth(), now.getDate() + i, 0, 0, 5), props });
  }
  return entries;
}

// Native taraf props'u UserDefaults'a yaziyor. Icinde null/undefined kalirsa
// NSNull property-list degil: iOS NSInvalidArgumentException atar ve
// uygulama JS'e donmeden kapanir (try/catch yakalayamaz). Bos alanlar
// yazmadan once atilir; widget eksik alani zaten bos sayiyor.
function plistSafe(value) {
  if (Array.isArray(value)) return value.filter((v) => v != null).map(plistSafe);
  if (value && typeof value === "object") {
    const out = {};
    for (const [k, v] of Object.entries(value)) {
      if (v == null || (typeof v === "number" && !Number.isFinite(v))) continue;
      out[k] = plistSafe(v);
    }
    return out;
  }
  return value;
}

function push(key, widget, rawSnapshot, { timeline = false } = {}) {
  if (!widget) return false;
  const snapshot = plistSafe(rawSnapshot);
  // Timeline'li widget'ta ayni veri bile ertesi gun yeniden yazilmali.
  const serialized = JSON.stringify(snapshot) + (timeline ? mondayKey() + new Date().getDate() : "");
  if (serialized === last[key]) return false;
  last[key] = serialized;
  try {
    if (timeline) widget.updateTimeline(timelineEntries(snapshot));
    else widget.updateSnapshot(snapshot);
    return true;
  } catch {
    // Widget bir suslemedir: yazmasi basarisiz olursa uygulama etkilenmez.
    last[key] = null;
    return false;
  }
}

// Widget'ta yalniz gun etiketi ve soru sayisi var; dakika ve diger alanlar
// gonderilmiyor. Props her yazmada seri hale getiriliyor, gereksiz alan
// tasimanin bedeli var faydasi yok.
function toDays(week) {
  return (week?.days || []).map((day) => ({
    label: day.label,
    questions: Number(day.questions) || 0,
  }));
}

// Bu haftanin Pazartesi'si "YYYY-MM-DD". Widget bununla verinin hangi
// haftaya ait oldugunu bilir; hafta donmusse eski sayilari gostermez.
function mondayKey(d = new Date()) {
  const m = new Date(d.getFullYear(), d.getMonth(), d.getDate() - ((d.getDay() + 6) % 7));
  return `${m.getFullYear()}-${String(m.getMonth() + 1).padStart(2, "0")}-${String(m.getDate()).padStart(2, "0")}`;
}

/** Haftanin emegi (cubuklar). Bugunun sayisi widget'ta days'ten okunur. */
export function syncWeekWidget({ week } = {}) {
  if (!week) return false;
  return push("week", WeekWidget, {
    days: toDays(week),
    goal: Number(week.goal) || 0,
    weekStart: mondayKey(),
  }, { timeline: true });
}

/** Bugunun sayisi, seri ve siradaki durak. */
export function syncTodayWidget({
  solved = 0, goal = 0, streak = 0, nextStop = null, week = null,
  stops = [], weeklyMinutesGoal = 0,
} = {}) {
  // Widget'a en fazla uc is gidiyor: daha fazlasi orta boy widget'ta
  // okunmuyor, listeyi kaydiramiyorsun. Bitmemisler once, bitenler sonra --
  // widget'in isi "simdi ne yapayim", gecmisi anlatmak degil.
  // useTodayStops bir DIZI degil { items, doneCount, nextId, toggle } donuyor.
  // Burasi bir sinir: cagiran taraf ne gonderirse gondersin widget'i
  // cokertmemeli -- bir widget susleme, ana ekrani dusurmemeli.
  const list = Array.isArray(stops) ? stops : (Array.isArray(stops?.items) ? stops.items : []);
  const all = list
    .map((stop) => ({
      // "Matematik · EBOB": ders adi konuyu baglamina oturtur. Ic skor
      // ("(%20)") hicbir zaman widget'a gitmez.
      label: (stop?.topic
        ? `${getSubjectLabel(stop.subject).split(" ")[0]} · ${stop.topic}`
        : String(stop?.label || "")).replace(/\s*\(%\d+\)/g, ""),
      minutes: Number(stop?.minutes) || 0,
      done: Boolean(stop?.completed),
    }))
    .filter((t) => t.label);
  // Tasarim 3d: bitenler ustte (ustu cizili), siradaki is altta one cikar.
  // En fazla uc satir; siradaki is her zaman gorunur.
  const open = all.filter((t) => !t.done);
  const closed = all.filter((t) => t.done);
  const openShown = open.slice(0, 3);
  const room = 3 - openShown.length;
  const tasks = [...(room > 0 ? closed.slice(-room) : []), ...openShown];

  const weekMinutes = (week?.days || []).reduce((sum, d) => sum + (Number(d.minutes) || 0), 0);

  return push("today", TodayWidget, {
    solved: Number(solved) || 0,
    goal: Number(goal) || 0,
    tasks,
    total: all.length,
    doneCount: closed.length,
    weekMinutes,
    weeklyMinutesGoal: Number(weeklyMinutesGoal) || 0,
    // Serit icin gun basina dakika: cubuk degil, haftanin yedi parcasi.
    dayMinutes: (week?.days || []).map((d) => Number(d.minutes) || 0),
    streak: Number(streak) || 0,
    nextStop: nextStop || null,
    // Genis boy haftanin cubuklarini da tasiyor: kucuk boyla arasindaki fark
    // tek satirdan ibaret kalmasin, genislik bir ise yarasin.
    days: week ? toDays(week) : [],
  });
}

/** Sinava kalan gun, olculmus rota hatti ve son denemelerdeki artis. */
export function syncRouteWidget({ examDate = null, chart = null, target = 0 } = {}) {
  const stops = chart?.stops || [];
  const first = stops.length ? Number(stops[0].y) : null;
  const last = stops.length ? Number(stops[stops.length - 1].y) : null;
  // Gun sayisi degil TARIH gonderiliyor: widget kendi yenilenirken gunu
  // yeniden hesaplasin, uygulama acilmasa da sayac dogru kalsin.
  const examISO = examDate instanceof Date
    ? examDate.toISOString()
    : (typeof examDate === "string" ? examDate : null);
  return push("route", RouteWidget, {
    examISO,
    // Widget'ta mutlak net YOK: ana ekrani baskasi da gorur, artis gosterilir.
    delta: first != null && last != null ? last - first : null,
    trialCount: stops.length,
    target: Number(target) || 0,
    // Son 8 nokta: fazlasi dar widget'ta ust uste biner.
    points: stops.slice(-8).map((s) => ({ label: s.label, net: Number(s.y) || 0 })),
  }, { timeline: true });
}

/** Tekrar widget'i kaldirildi (4 Ekim, kullanici: fazla widget). Cagri yerleri bozulmasin diye bos. */
export function syncReviewWidget() {
  return false;
}

/**
 * Seri: son 28 gunun izgarasi.
 *
 * 0 = calisilmadi · 1 = calisildi · 2 = calisildi VE suren serinin icinde.
 * Seri uyeligi SONDAN geriye yuruyerek bulunur: bugun (ya da bugun bosken
 * dun) baslayip ilk bos gune kadar. Sunucudaki streak degeriyle carpismasin
 * diye uzunluk oradan aliniyor, izgara yalnizca BOYAMA icin kullaniliyor.
 */
export function syncStreakWidget({ logs = [], streak = 0, longest = 0 } = {}) {
  const DAY = 86400000;
  const key = (d) => {
    const t = new Date(d);
    return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, "0")}-${String(t.getDate()).padStart(2, "0")}`;
  };

  const worked = new Set();
  for (const log of logs || []) {
    const raw = log?.study_date || log?.studyDate;
    if (!raw) continue;
    if ((Number(log.question_count ?? log.questionCount ?? 0) || 0) > 0
      || (Number(log.duration_minutes ?? log.durationMinutes ?? 0) || 0) > 0) {
      worked.add(String(raw).slice(0, 10));
    }
  }

  const today = new Date();
  const days = [];
  for (let i = 27; i >= 0; i -= 1) {
    days.push(worked.has(key(today.getTime() - i * DAY)) ? 1 : 0);
  }

  // Suren seriyi sondan geriye boya. Bugun bos olabilir: seri henuz
  // kirilmadi, gece yarisina kadar suresi var.
  let i = days.length - 1;
  if (days[i] === 0) i -= 1;
  while (i >= 0 && days[i] === 1) { days[i] = 2; i -= 1; }

  return push("streak", StreakWidget, {
    days,
    streak: Number(streak) || 0,
    longest: Number(longest) || 0,
    // Izgaranin son hucresi bu gun; widget sonraki gunlerde kaydirir.
    asOf: key(today),
  }, { timeline: true });
}

/**
 * Deneme netleri: son bes denemenin egrisi + son iki deneme arasindaki
 * ders kirilimi.
 *
 * trials ENIDEN ESKIYE gelir (Redux'ta boyle tutuluyor); widget soldan saga
 * okundugu icin ters cevriliyor.
 */
export function syncTrialWidget({ trials = [] } = {}) {
  // TEK sinav turu: TYT 65 ile AYT 30'u ayni cizgiye koymak anlamsiz dalga
  // cizer. Son ana denemenin turu secilir; brans denemeleri disarda.
  const type = (trials || []).find((t) => t?.trialType && t.trialType !== "BRANCH")?.trialType || null;
  const sameType = (trials || []).filter((t) => t?.trialType === type);
  const recent = sameType.slice(0, 5).reverse();
  const exam = !type ? "" : type.startsWith("AYT") ? "AYT" : type;
  const points = recent.map((t) => ({
    label: t?.date || "",
    net: Number(t?.totalNet ?? t?.rawTotalNet ?? 0) || 0,
  }));

  // Ders kirilimi yalniz SON IKI deneme arasinda. Daha uzun bir pencere
  // ortalamaya doner ve "bu deneme ne oldu" sorusunu cevaplamaz.
  const a = recent.length > 1 ? recent[recent.length - 2] : null;
  const b = recent.length ? recent[recent.length - 1] : null;
  const subjects = [];
  if (a && b && b.subjects) {
    for (const key of Object.keys(b.subjects)) {
      const now = Number(b.subjects[key]?.net) || 0;
      const before = Number(a.subjects?.[key]?.net);
      if (!Number.isFinite(before)) continue;
      // Widget dar: "Türk Dili ve Edebiyatı" satira sigmaz, ilk kelime yeter.
      const label = String(b.subjects[key]?.label || getSubjectLabel(key) || key);
      subjects.push({ key, label: label.split(" ")[0], delta: Number((now - before).toFixed(1)) });
    }
    // En cok DUSEN en altta: cumle onu aliyor, goz oraya insin.
    subjects.sort((x, y) => y.delta - x.delta);
  }

  // Baslik "20. TYT DENEME" demeli; cizgi yalniz son 5 noktayi tasir.
  return push("trial", TrialWidget, { points, subjects, exam, total: sameType.length });
}

/**
 * Cikista widget'lari bosalt. Ana ekran widget'i uygulamadan bagimsiz
 * yasiyor: cikis yapan kullanicinin serisi, sinav tarihi ve denemeleri
 * orada kaliyordu -- paylasilan cihazda bir sonraki kullaniciya gorunuyordu.
 */
export function clearAllWidgets() {
  Object.keys(last).forEach((key) => { delete last[key]; });
  syncWeekWidget({ week: { days: [], goal: 0 } });
  syncTodayWidget({});
  syncRouteWidget({});
  syncStreakWidget({});
  syncTrialWidget({});
}
