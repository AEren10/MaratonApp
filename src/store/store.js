import { configureStore, combineReducers } from "@reduxjs/toolkit";
import studyLogReducer from "./slices/studyLogSlice";
import trialReducer from "./slices/trialSlice";
import gamificationReducer from "./slices/gamificationSlice";
import goalsReducer from "./slices/goalsSlice";
import planReducer from "./slices/planSlice";
import userTasksReducer from "./slices/userTasksSlice";

export const RESET_STORE = "app/resetStore";

const appReducer = combineReducers({
  studyLog: studyLogReducer,
  trials: trialReducer,
  gamification: gamificationReducer,
  goals: goalsReducer,
  plan: planReducer,
  userTasks: userTasksReducer,
});

const rootReducer = (state, action) => {
  if (action.type === RESET_STORE) return appReducer(undefined, action);
  return appReducer(state, action);
};

export const store = configureStore({ reducer: rootReducer });
