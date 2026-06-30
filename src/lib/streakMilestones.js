import AsyncStorage from "@react-native-async-storage/async-storage";
import { STORAGE_KEYS } from "../constants/storageKeys";

export const STREAK_MILESTONES = [
  { day: 7, xp: 100, premiumDays: 0, title: "Haftalık Savaşçı", icon: "flame", color: "#fb923c" },
  { day: 14, xp: 250, premiumDays: 1, title: "İki Haftalık Efsane", icon: "zap", color: "#fbbf24" },
  { day: 30, xp: 500, premiumDays: 3, title: "Aylık Titan", icon: "award", color: "#34d399" },
  { day: 60, xp: 1000, premiumDays: 7, title: "Çelik İrade", icon: "shield", color: "#60a5fa" },
  { day: 100, xp: 2000, premiumDays: 14, title: "Efsanevi Azim", icon: "crown", color: "#c084fc" },
  { day: 365, xp: 5000, premiumDays: 30, title: "Yıl Şampiyonu", icon: "trophy", color: "#f472b6" },
];

export function checkStreakMilestone(currentStreak, claimedMilestones = []) {
  for (const m of STREAK_MILESTONES) {
    if (currentStreak >= m.day && !claimedMilestones.includes(m.day)) {
      return m;
    }
  }
  return null;
}

export function getAllUnclaimedMilestones(currentStreak, claimedMilestones = []) {
  return STREAK_MILESTONES.filter((m) => currentStreak >= m.day && !claimedMilestones.includes(m.day));
}

export function getNextMilestone(currentStreak) {
  for (const m of STREAK_MILESTONES) {
    if (currentStreak < m.day) {
      return { ...m, daysLeft: m.day - currentStreak };
    }
  }
  return null;
}

export async function getClaimedMilestones() {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.CLAIMED_MILESTONES);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export async function claimMilestone(day) {
  const claimed = await getClaimedMilestones();
  if (!claimed.includes(day)) {
    claimed.push(day);
    await AsyncStorage.setItem(STORAGE_KEYS.CLAIMED_MILESTONES, JSON.stringify(claimed));
  }
  return claimed;
}
