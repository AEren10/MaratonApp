import { createSlice, createSelector } from "@reduxjs/toolkit";
import { normalizeTrial } from "../../domain/trial/trialModel";

const trialSlice = createSlice({
  name: "trials",
  initialState: {
    trials: [],
    loading: false,
  },
  reducers: {
    setTrials: (state, action) => {
      state.trials = action.payload.map(normalizeTrial);
    },
    addTrial: (state, action) => {
      const trial = normalizeTrial(action.payload);
      const exists = state.trials.some((t) => t.id === trial.id);
      if (!exists) state.trials.unshift(trial);
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    // Yanlış girilen denemeyi silmek için. Sunucu çağrısı başarısız olursa
    // çağıran taraf restoreTrial ile geri koyuyor (iyimser güncelleme).
    removeTrial: (state, action) => {
      state.trials = state.trials.filter((t) => t.id !== action.payload);
    },
    restoreTrial: (state, action) => {
      const trial = normalizeTrial(action.payload);
      if (!state.trials.some((t) => t.id === trial.id)) {
        state.trials.push(trial);
        state.trials.sort((a, b) => new Date(b.date) - new Date(a.date));
      }
    },
  },
});

export const { setTrials, addTrial, setLoading, removeTrial, restoreTrial } = trialSlice.actions;

export default trialSlice.reducer;

export const selectTrials = (state) => state.trials.trials;
export const selectLatestTrial = (state) => state.trials.trials[0] || null;

export const selectTYTTrials = createSelector(
  selectTrials,
  (trials) => trials.filter((t) => t.trialType === "TYT"),
);

export const selectAYTTrials = createSelector(
  selectTrials,
  (trials) => trials.filter((t) => t.trialType && t.trialType.startsWith("AYT")),
);

export const selectBranchTrials = createSelector(
  selectTrials,
  (trials) => trials.filter((t) => t.trialType === "BRANCH"),
);

export const selectLGSTrials = createSelector(
  selectTrials,
  (trials) => trials.filter((t) => t.trialType === "LGS"),
);

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
