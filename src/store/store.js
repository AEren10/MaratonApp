import { configureStore } from "@reduxjs/toolkit";
import studyLogReducer from "./slices/studyLogSlice";
import trialReducer from "./slices/trialSlice";
import gamificationReducer from "./slices/gamificationSlice";

export const store = configureStore({
  reducer: {
    studyLog: studyLogReducer,
    trials: trialReducer,
    gamification: gamificationReducer,
  },
});
