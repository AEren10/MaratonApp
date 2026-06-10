import { configureStore } from "@reduxjs/toolkit";
import studyLogReducer from "./slices/studyLogSlice";
import trialReducer from "./slices/trialSlice";

export const store = configureStore({
  reducer: {
    studyLog: studyLogReducer,
    trials: trialReducer,
  },
});
