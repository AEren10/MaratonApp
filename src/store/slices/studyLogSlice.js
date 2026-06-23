import { createSlice } from "@reduxjs/toolkit";

const studyLogSlice = createSlice({
  name: "studyLog",
  initialState: {
    todayLogs: [],
    streak: 0,
    longestStreak: 0,
    freezeCount: 0,
    freezeResetAt: null,
    lastStudyDate: null,
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
    setFreezeCount: (state, action) => {
      state.freezeCount = action.payload;
    },
    setLongestStreak: (state, action) => {
      state.longestStreak = action.payload;
    },
    setFreezeResetAt: (state, action) => {
      state.freezeResetAt = action.payload;
    },
    setLastStudyDate: (state, action) => {
      state.lastStudyDate = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
  },
});

export const { setTodayLogs, addLog, setStreak, setFreezeCount, setLongestStreak, setFreezeResetAt, setLastStudyDate, setLoading } =
  studyLogSlice.actions;

export default studyLogSlice.reducer;

export const selectTodayLogs = (state) => state.studyLog.todayLogs;
export const selectStreak = (state) => state.studyLog.streak;
export const selectFreezeCount = (state) => state.studyLog.freezeCount;
export const selectLongestStreak = (state) => state.studyLog.longestStreak;
export const selectFreezeResetAt = (state) => state.studyLog.freezeResetAt;
export const selectLastStudyDate = (state) => state.studyLog.lastStudyDate;
export const selectTodayTotalQuestions = (state) =>
  state.studyLog.todayLogs.reduce((sum, log) => sum + (log.questionCount || 0), 0);
