import { createSlice } from "@reduxjs/toolkit";

const trialSlice = createSlice({
  name: "trials",
  initialState: {
    trials: [],
    loading: false,
  },
  reducers: {
    setTrials: (state, action) => {
      state.trials = action.payload;
    },
    addTrial: (state, action) => {
      state.trials.unshift(action.payload);
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
  },
});

export const { setTrials, addTrial, setLoading } = trialSlice.actions;

export default trialSlice.reducer;

export const selectTrials = (state) => state.trials.trials;
export const selectLatestTrial = (state) => state.trials.trials[0] || null;
export const selectTrialsBySubject = (state, subject) =>
  state.trials.trials.map((t) => ({
    date: t.date,
    net: t.subjects?.[subject]?.net || 0,
  }));
