import { STORAGE_KEYS, userScopedKey } from "../constants/storageKeys";
import * as appStorage from "./storage/appStorage";

const DAILY = [
  { title: "Bugünkü rota hazır", body: "İstersen sıradaki durağı şimdi açabilirsin." },
  { title: "Kısa bir oturum yeter", body: "Bugün için küçük bir başlangıç rotayı canlı tutar." },
  { title: "Planında bekleyen durak var", body: "Kaldığın yerden devam etmek için rota hazır." },
  { title: "Bugünün ritmi açık", body: "Bir sonraki adımı görmek için planına bakabilirsin." },
  { title: "Hedefe sakin bir adım", body: "Bugünkü yükünü küçük parçalara bölebilirsin." },
];

const STREAK_RISK = [
  { title: "{streak} günlük seri donmak üzere", body: "Bugün kısa bir kayıt seriyi canlı tutar." },
  { title: "Seri için son pencere", body: "{streak} günlük ritmi korumak için küçük bir oturum yeter." },
  { title: "Bugün kayıt yok gibi görünüyor", body: "Planına dönersen seri kaldığı yerden devam eder." },
];

const ZEIGARNIK = [
  { title: "Yarım kalan konun var", body: "{subject} konusunda kaldığın yerden devam et." },
  { title: "Bitmemiş görevlerin var", body: "{count} durak hâlâ açık. Uygunsa birini kapatabilirsin." },
  { title: "Rota yarım kaldı", body: "Günlük hedefinin %{percent}'i tamam. Kalan parçayı görebilirsin." },
];

const WEEKLY = [
  { title: "Haftalık raporun hazır", body: "Bu hafta {xp} XP kazandın. Detaylara göz at!" },
  { title: "Haftanın özeti", body: "{questions} soru çözdün, {minutes} dk çalıştın." },
];

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function fill(tmpl, vars = {}) {
  let { title, body } = tmpl;
  for (const [k, v] of Object.entries(vars)) {
    const re = new RegExp(`\\{${k}\\}`, "g");
    title = title.replace(re, String(v));
    body = body.replace(re, String(v));
  }
  return { title, body };
}

export const getDaily = () => pick(DAILY);
export const getStreakRisk = (streak) => fill(pick(STREAK_RISK), { streak });
export const getZeigarnik = (vars) => fill(pick(ZEIGARNIK), vars);
export const getWeekly = (vars) => fill(pick(WEEKLY), vars);

export async function trackStudyHour(userId = null) {
  const hour = new Date().getHours();
  try {
    const key = userScopedKey(STORAGE_KEYS.STUDY_HOURS, userId);
    const hours = await appStorage.getJson(key, {});
    hours[hour] = (hours[hour] || 0) + 1;
    await appStorage.setJson(key, hours);
  } catch {}
}

export async function getOptimalHour(userId = null) {
  try {
    const hours = await appStorage.getJson(userScopedKey(STORAGE_KEYS.STUDY_HOURS, userId), null);
    if (!hours) return 19;
    let best = 19;
    let max = 0;
    for (const [h, c] of Object.entries(hours)) {
      if (c > max) { max = c; best = parseInt(h); }
    }
    return Math.max(8, Math.min(22, best));
  } catch {
    return 19;
  }
}
