import { configureStore } from "@reduxjs/toolkit";
import studyLogReducer from "./slices/studyLogSlice";
import trialReducer from "./slices/trialSlice";
import gamificationReducer from "./slices/gamificationSlice";
import goalsReducer from "./slices/goalsSlice";
import planReducer from "./slices/planSlice";
import userTasksReducer from "./slices/userTasksSlice";

export const store = configureStore({
  reducer: {
    studyLog: studyLogReducer,
    trials: trialReducer,
    gamification: gamificationReducer,
    goals: goalsReducer,
    plan: planReducer,
    userTasks: userTasksReducer,
  },
});
