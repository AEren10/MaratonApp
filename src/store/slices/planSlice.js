import { createSlice } from "@reduxjs/toolkit";

// C) smartNudge "Plana Ekle" → günlük plana ek görev enjekte eder.
// adHocTasks gün içinde tutulur; ertesi gün temizlenir (date kontrolü).
const planSlice = createSlice({
  name: "plan",
  initialState: {
    adHocTasks: [],
    day: null, // "YYYY-MM-DD"
  },
  reducers: {
    addAdHocTask: (state, action) => {
      const today = new Date().toISOString().split("T")[0];
      if (state.day !== today) {
        state.day = today;
        state.adHocTasks = [];
      }
      const { subject, subjectLabel, topic, reason, questionCount, color } = action.payload;
      // Aynı ders+konu için tekrar eklemeyi engelle.
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
  },
});

export const { addAdHocTask, removeAdHocTask, clearAdHocTasks } = planSlice.actions;
export default planSlice.reducer;

export const selectAdHocTasks = (state) => {
  const today = new Date().toISOString().split("T")[0];
  return state.plan.day === today ? state.plan.adHocTasks : [];
};
