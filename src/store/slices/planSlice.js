import { createSlice } from "@reduxjs/toolkit";
import { todayTR } from "../../lib/dateUtils";

const planSlice = createSlice({
  name: "plan",
  initialState: {
    adHocTasks: [],
    day: null,
  },
  reducers: {
    addAdHocTask: (state, action) => {
      const today = todayTR();
      if (state.day !== today) {
        state.day = today;
        state.adHocTasks = [];
      }
      const { subject, subjectLabel, topic, reason, questionCount, color } = action.payload;
      const exists = state.adHocTasks.some((t) => t.subject === subject && t.topic === topic);
      if (exists) return;
      state.adHocTasks.push({
        id: `adhoc_${Date.now()}`,
        subject,
        subjectLabel: subjectLabel || subject,
        topic: topic || null,
        reason: reason || "smartNudge önerisi",
        questionCount: questionCount || 15,
        color: color || null,
        adHoc: true,
        completed: false,
      });
    },
    removeAdHocTask: (state, action) => {
      state.adHocTasks = state.adHocTasks.filter((t) => t.id !== action.payload);
    },
    clearAdHocTasks: (state) => {
      state.adHocTasks = [];
    },
    hydrateAdHocTasks: (state, action) => {
      const { day, tasks } = action.payload || {};
      const today = todayTR();
      if (day === today && Array.isArray(tasks)) {
        state.day = day;
        state.adHocTasks = tasks;
      }
    },
  },
});

export const { addAdHocTask, removeAdHocTask, clearAdHocTasks, hydrateAdHocTasks } = planSlice.actions;
export default planSlice.reducer;

export const selectAdHocTasks = (state) => {
  const today = todayTR();
  return state.plan.day === today ? state.plan.adHocTasks : [];
};

