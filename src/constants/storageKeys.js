export const STORAGE_KEYS = {
  THEME_PREF: "@maraton:themePref",
  EXAM_CONFIG: "@exam_config",
  HAS_SEEN_ONBOARDING: "@has_seen_onboarding",
  NOTIF_PREFS: "@maraton:notifPrefs",
  OFFLINE_QUEUE: "@maraton:offlineQueue",
  GOALS: "@maraton:goals",
  NUDGE_POPUP_SHOWN: "@nudge_popup_shown",
  LAST_ACTIVE: "@maraton:last_active",
  LOGIN_REWARDED: "@maraton:login_rewarded",
  COMEBACK_SHOWN: "@maraton:comeback_shown",
  GAMIFICATION: "@maraton:gamification",
  PENDING_STREAK: "@maraton:pending_streak",
  CALENDAR_TASKS: "@maraton:calendar_tasks",
};

export function dailyKey(prefix) {
  return `${prefix}_${new Date().toISOString().split("T")[0]}`;
}
