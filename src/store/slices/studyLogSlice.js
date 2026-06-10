import { createSlice } from "@reduxjs/toolkit";

const studyLogSlice = createSlice({
  name: "studyLog",
  initialState: {
    todayLogs: [],
    streak: 0,
    loading: false,
  },
  reducers: {
    setTodayLogs: (state, action) => {
      state.todayLogs = action.payload;
    },
    addLog: (state, action) => {
      state.todayLogs.push(action.payload);
    },
    setStreak: (state, action) => {
      state.streak = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
  },
});

export const { setTodayLogs, addLog, setStreak, setLoading } =
  studyLogSlice.actions;

export default studyLogSlice.reducer;

export const selectTodayLogs = (state) => state.studyLog.todayLogs;
export const selectStreak = (state) => state.studyLog.streak;
export const selectTodayTotalQuestions = (state) =>
  state.studyLog.todayLogs.reduce((sum, log) => sum + (log.questionCount || 0), 0);
