import { createSlice } from "@reduxjs/toolkit";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { STORAGE_KEYS } from "../../constants/storageKeys";

const STORAGE_KEY = STORAGE_KEYS.GOALS;

const initialState = {
  dailyQuestions: 80,
  weeklyTrials: 2,
  weeklyMinutes: 1200, // 20 hours
  hydrated: false,
};

const goalsSlice = createSlice({
  name: "goals",
  initialState,
  reducers: {
    setGoals: (state, action) => {
      const { dailyQuestions, weeklyTrials, weeklyMinutes } = action.payload || {};
      if (dailyQuestions !== undefined) state.dailyQuestions = dailyQuestions;
      if (weeklyTrials !== undefined) state.weeklyTrials = weeklyTrials;
      if (weeklyMinutes !== undefined) state.weeklyMinutes = weeklyMinutes;
    },
    hydrateGoals: (state, action) => {
      const data = action.payload || {};
      state.dailyQuestions = data.dailyQuestions ?? state.dailyQuestions;
      state.weeklyTrials = data.weeklyTrials ?? state.weeklyTrials;
      state.weeklyMinutes = data.weeklyMinutes ?? state.weeklyMinutes;
      state.hydrated = true;
    },
  },
});

export const { setGoals, hydrateGoals } = goalsSlice.actions;
export default goalsSlice.reducer;

export const selectGoals = (state) => state.goals;
export const selectDailyQuestionsGoal = (state) => state.goals.dailyQuestions;
export const selectWeeklyTrialsGoal = (state) => state.goals.weeklyTrials;
export const selectWeeklyMinutesGoal = (state) => state.goals.weeklyMinutes;

export async function loadGoalsFromStorage(dispatch) {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (raw) {
      dispatch(hydrateGoals(JSON.parse(raw)));
    } else {
      dispatch(hydrateGoals({}));
    }
  } catch (_) {
    dispatch(hydrateGoals({}));
  }
}

export async function saveGoalsToStorage(goals) {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(goals));
  } catch (_) {}
}
