import { SCREENS } from "../../constants/screens.js";

export function setupStartScreen({
  fromPreview = false,
  examType = null,
  dailyGoalSet = false,
  levelTestDone = false,
  setupCompleted = false,
} = {}) {
  if (!examType) return fromPreview ? SCREENS.GOAL_SETUP : SCREENS.EXAM_SETUP;
  if (dailyGoalSet && !levelTestDone) return SCREENS.LEVEL_TEST;
  if (levelTestDone && !setupCompleted) return SCREENS.ROUTE_READY;
  return SCREENS.SETUP_INCOMPLETE;
}
