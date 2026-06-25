import { createSlice, createSelector } from "@reduxjs/toolkit";
import { todayTR } from "../../lib/dateUtils";

const todayStr = todayTR;

const userTasksSlice = createSlice({
  name: "userTasks",
  initialState: {
    tasks: [],
    day: null,
    listCreatedAt: null,
  },
  reducers: {
    setUserTasks: (state, action) => {
      state.tasks = action.payload;
      state.day = todayStr();
      if (action.payload.length > 0 && !state.listCreatedAt) {
        state.listCreatedAt = Date.now();
      }
    },
    addUserTask: (state, action) => {
      state.day = todayStr();
      state.tasks.push(action.payload);
      if (!state.listCreatedAt) {
        state.listCreatedAt = Date.now();
      }
    },
    toggleUserTask: (state, action) => {
      const task = state.tasks.find((t) => t.id === action.payload);
      if (task) task.completed = !task.completed;
    },
    replaceUserTask: (state, action) => {
      const { tempId, real } = action.payload;
      const idx = state.tasks.findIndex((t) => t.id === tempId);
      if (idx !== -1) state.tasks[idx] = real;
    },
    removeUserTask: (state, action) => {
      state.tasks = state.tasks.filter((t) => t.id !== action.payload);
    },
    clearUserTasks: (state) => {
      state.tasks = [];
      state.day = todayStr();
      state.listCreatedAt = null;
    },
  },
});

export const { setUserTasks, addUserTask, replaceUserTask, toggleUserTask, removeUserTask, clearUserTasks } =
  userTasksSlice.actions;

export default userTasksSlice.reducer;

const EMPTY = [];

export const selectUserTasks = (state) => {
  const today = todayStr();
  return state.userTasks.day === today ? state.userTasks.tasks : EMPTY;
};

export const selectUserTasksProgress = createSelector(
  selectUserTasks,
  (tasks) => {
    const total = tasks.length;
    const done = tasks.filter((t) => t.completed).length;
    return { total, done, remaining: total - done };
  },
);

export const selectListCreatedAt = (state) => state.userTasks.listCreatedAt;
