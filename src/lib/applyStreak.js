import { setFreezeCount, setFreezeResetAt, setLastStudyDate, setLongestStreak, setStreak } from "../store/slices/studyLogSlice";

// Sunucunun touch_streak donusunu ekrana yansitir (seri seridi aninda guncellensin).
export function applyStreak(dispatch, res) {
  if (!res || typeof res.current_streak !== "number") return;
  dispatch(setStreak(res.current_streak));
  if (res.longest_streak != null) dispatch(setLongestStreak(res.longest_streak));
  if (res.last_study_date) dispatch(setLastStudyDate(String(res.last_study_date).slice(0, 10)));
  if (res.freeze_count != null) dispatch(setFreezeCount(res.freeze_count));
  if (res.freeze_reset_at) dispatch(setFreezeResetAt(res.freeze_reset_at));
}
