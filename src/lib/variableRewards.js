import AsyncStorage from "@react-native-async-storage/async-storage";
import { STORAGE_KEYS, dailyKey } from "../constants/storageKeys";

const MULTIPLIERS = [
  { value: 1, weight: 60 },
  { value: 1.5, weight: 25 },
  { value: 2, weight: 12 },
  { value: 3, weight: 3 },
];

const CHEST_REWARDS = [
  { xp: 25, weight: 35, label: "25 XP" },
  { xp: 50, weight: 30, label: "50 XP" },
  { xp: 100, weight: 20, label: "100 XP" },
  { xp: 200, weight: 10, label: "200 XP" },
  { xp: 500, weight: 5, label: "500 XP" },
];

function weightedRandom(options) {
  const total = options.reduce((sum, o) => sum + o.weight, 0);
  let rand = Math.random() * total;
  for (const opt of options) {
    rand -= opt.weight;
    if (rand <= 0) return opt;
  }
  return options[0];
}

export function rollMultiplier() {
  return weightedRandom(MULTIPLIERS).value;
}

export function rollMysteryChest() {
  return weightedRandom(CHEST_REWARDS);
}

export function shouldApplyMultiplier() {
  return Math.random() < 0.15;
}

export async function canOpenDailyChest() {
  try {
    const key = dailyKey(STORAGE_KEYS.DAILY_CHEST);
    const opened = await AsyncStorage.getItem(key);
    return !opened;
  } catch {
    return true;
  }
}

export async function markDailyChestOpened() {
  try {
    const key = dailyKey(STORAGE_KEYS.DAILY_CHEST);
    await AsyncStorage.setItem(key, "1");
  } catch {}
}
