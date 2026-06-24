import AsyncStorage from "@react-native-async-storage/async-storage";
import { STORAGE_KEYS } from "../constants/storageKeys";

const DAILY = [
  { title: "Bugünkü planın hazır", body: "Küçük adımlar büyük fark yaratır. Planına göz at!" },
  { title: "15 dakika bile yeter", body: "Bugün hâlâ kayıt girmedin. Hemen başla!" },
  { title: "Rakiplerin çalışıyor", body: "Ligdeki sıranı korumak için bugün de çalış!" },
  { title: "Kendine yatırım yap", body: "Bugün 20 dk ayırmak yarın puan olarak döner." },
  { title: "Hedefine yaklaşıyorsun", body: "Birkaç soru daha ve günlük hedefini tamamlarsın!" },
];

const STREAK_RISK = [
  { title: "{streak} günlük serin tehlikede!", body: "Birazcık çalış, seriyi bozma!" },
  { title: "{streak} gün! Bırakma", body: "Kayıt girersen streak devam eder. Hemen başla!" },
  { title: "Serini koru", body: "{streak} günlük emek boşa gitmesin. Birkaç soru bile yeter." },
];

const ZEIGARNIK = [
  { title: "Yarım kalan konun var", body: "{subject} konusunda kaldığın yerden devam et." },
  { title: "Bitmemiş görevlerin bekliyor", body: "{count} görev tamamlanmamış. Bitir!" },
  { title: "Az kaldı, bırakma", body: "Günlük hedefinin %{percent}'ine ulaştın. Tamamla!" },
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

export async function trackStudyHour() {
  const hour = new Date().getHours();
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.STUDY_HOURS) || "{}";
    const hours = JSON.parse(raw);
    hours[hour] = (hours[hour] || 0) + 1;
    await AsyncStorage.setItem(STORAGE_KEYS.STUDY_HOURS, JSON.stringify(hours));
  } catch {}
}

export async function getOptimalHour() {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.STUDY_HOURS);
    if (!raw) return 19;
    const hours = JSON.parse(raw);
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
