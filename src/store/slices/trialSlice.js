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

export const selectTrialsByType = (state, type) =>
  state.trials.trials.filter((t) => t.trialType === type);

export const selectTYTTrials = (state) =>
  state.trials.trials.filter((t) => t.trialType === "TYT");

export const selectAYTTrials = (state) =>
  state.trials.trials.filter((t) =>
    t.trialType && t.trialType.startsWith("AYT")
  );

export const selectBranchTrials = (state) =>
  state.trials.trials.filter((t) => t.trialType === "BRANCH");

export const selectTrialsBySubject = (state, subject) =>
  state.trials.trials
    .filter((t) => t.subjects && t.subjects[subject])
    .map((t) => ({
      date: t.date,
      net: t.subjects[subject]?.net || 0,
    }));

export const selectLatestTYT = (state) =>
  state.trials.trials.find((t) => t.trialType === "TYT") || null;

export const selectLatestAYT = (state) =>
  state.trials.trials.find((t) => t.trialType && t.trialType.startsWith("AYT")) || null;
