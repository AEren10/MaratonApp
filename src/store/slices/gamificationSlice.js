import { createSlice, createSelector } from "@reduxjs/toolkit";
import { getLevelForXP } from "../../lib/xpEngine";

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
  },
});

export const {
  earnXP,
  unlockBadge,
  updateStat,
  incrementStat,
  setMaxStat,
  resetWeeklyXP,
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
