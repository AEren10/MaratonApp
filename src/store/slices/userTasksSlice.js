import { createSlice, createSelector } from "@reduxjs/toolkit";
import { todayTR } from "../../lib/dateUtils";
import { normalizeUserTask } from "../../domain/tasks/userTaskModel";

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
      state.tasks = action.payload.map(normalizeUserTask);
      state.day = todayStr();
      if (action.payload.length > 0 && !state.listCreatedAt) {
        state.listCreatedAt = Date.now();
      }
    },
    addUserTask: (state, action) => {
      state.day = todayStr();
      state.tasks.push(normalizeUserTask(action.payload));
      if (!state.listCreatedAt) {
        state.listCreatedAt = Date.now();
      }
    },
    toggleUserTask: (state, action) => {
      const task = state.tasks.find((t) => t.id === action.payload);
      if (task) task.completed = !task.completed;
    },
    // Mutlak değer ataması. Geri alma göreli toggle ile yapılırsa, kullanıcı
    // sunucu cevabı gelmeden tekrar dokunduğunda durum ters dönüyordu.
    setUserTaskCompleted: (state, action) => {
      const { id, completed } = action.payload;
      const task = state.tasks.find((t) => t.id === id);
      if (task) task.completed = !!completed;
    },
    replaceUserTask: (state, action) => {
      const { tempId, real } = action.payload;
      const idx = state.tasks.findIndex((t) => t.id === tempId);
      if (idx !== -1) state.tasks[idx] = normalizeUserTask(real);
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

export const { setUserTasks, addUserTask, replaceUserTask, toggleUserTask, setUserTaskCompleted, removeUserTask, clearUserTasks } =
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
