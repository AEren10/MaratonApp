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
  CLAIMED_MILESTONES: "@maraton:claimed_milestones",
  DAILY_CHEST: "@maraton:daily_chest",
  STUDY_HOURS: "@maraton:study_hours",
  LEAGUE_RESULT: "@maraton:league_result",
  ENDOWED_SHOWN: "@maraton:endowed_shown",
  WRAPPED_LAST: "@maraton:wrapped_last",
  STUDY_SESSION_COUNT: "@maraton:study_session_count",
  PAYWALL_SHOWN_SESSION: "@maraton:paywall_shown_session",
  PENDING_REFERRAL: "@maraton:pending_referral",
  REVIEW_LAST_ASKED: "@maraton:review_last_asked",
};

export function dailyKey(prefix) {
  return `${prefix}_${new Date().toISOString().split("T")[0]}`;
}
