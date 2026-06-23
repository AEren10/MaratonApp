import { createSlice, createSelector } from "@reduxjs/toolkit";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getLevelForXP } from "../../lib/xpEngine";

const STORAGE_KEY = "@maraton:gamification";

const initialState = {
  xp: 0,
  weeklyXP: 0,
  badges: [],
  stats: {
    totalQuestions: 0,
    totalTrials: 0,
    totalMinutes: 0,
    maxNet: 0,
    wrongsResolved: 0,
    perfectPlans: 0,
    streak: 0,
  },
  hydrated: false,
};

const gamificationSlice = createSlice({
  name: "gamification",
  initialState,
  reducers: {
    earnXP(state, action) {
      const { amount } = action.payload;
      state.xp += amount;
      state.weeklyXP += amount;
    },
    unlockBadge(state, action) {
      const { badgeId } = action.payload;
      if (!state.badges.includes(badgeId)) {
        state.badges.push(badgeId);
      }
    },
    updateStat(state, action) {
      const { key, value } = action.payload;
      if (key in state.stats) {
        state.stats[key] = value;
      }
    },
    incrementStat(state, action) {
      const { key, amount = 1 } = action.payload;
      if (key in state.stats) {
        state.stats[key] += amount;
      }
    },
    setMaxStat(state, action) {
      const { key, value } = action.payload;
      if (key in state.stats && value > state.stats[key]) {
        state.stats[key] = value;
      }
    },
    resetWeeklyXP(state) {
      state.weeklyXP = 0;
    },
    hydrateGamification(state, action) {
      const d = action.payload || {};
      if (d.xp != null) state.xp = d.xp;
      if (d.weeklyXP != null) state.weeklyXP = d.weeklyXP;
      if (Array.isArray(d.badges)) state.badges = d.badges;
      if (d.stats) {
        Object.keys(d.stats).forEach((k) => {
          if (k in state.stats) state.stats[k] = d.stats[k];
        });
      }
      state.hydrated = true;
    },
  },
});

export const {
  earnXP,
  unlockBadge,
  updateStat,
  incrementStat,
  setMaxStat,
  resetWeeklyXP,
  hydrateGamification,
} = gamificationSlice.actions;

export const selectXP = (state) => state.gamification.xp;
export const selectWeeklyXP = (state) => state.gamification.weeklyXP;
export const selectBadgeIds = (state) => state.gamification.badges;
export const selectStats = (state) => state.gamification.stats;
export const selectLevel = createSelector(
  selectXP,
  (xp) => getLevelForXP(xp),
);

export default gamificationSlice.reducer;

export async function saveGamificationToStorage(state) {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({
      xp: state.xp, weeklyXP: state.weeklyXP,
      badges: state.badges, stats: state.stats,
    }));
  } catch (_) {}
}

export async function loadGamificationFromStorage(dispatch) {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (raw) dispatch(hydrateGamification(JSON.parse(raw)));
    else dispatch(hydrateGamification({}));
  } catch (_) {
    dispatch(hydrateGamification({}));
  }
}
