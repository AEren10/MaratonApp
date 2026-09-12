import { todayTR } from "../lib/dateUtils";

export const STORAGE_KEYS = {
  THEME_PREF: "@maraton:themePref",
  THEME_ACCENT: "@maraton:themeAccent",
  // Çalışan kronometre oturumu — uygulama öldürülürse kurtarmak için.
  ACTIVE_TIMER_SESSION: "@maraton:activeTimerSession",
  EXAM_CONFIG: "@exam_config",
  HAS_SEEN_ONBOARDING: "@has_seen_onboarding",
  NOTIF_PREFS: "@maraton:notifPrefs",
  NOTIF_CONTEXT: "@maraton:notifContext",
  OFFLINE_QUEUE: "@maraton:offlineQueue",
  OFFLINE_DEAD_LETTER: "@maraton:dead_letter_queue",
  HAPTICS_ENABLED: "@maraton:haptics_enabled",
  GOALS: "@maraton:goals",
  NUDGE_POPUP_SHOWN: "@nudge_popup_shown",
  LAST_ACTIVE: "@maraton:last_active",
  LOGIN_REWARDED: "@maraton:login_rewarded",
  COMEBACK_SHOWN: "@maraton:comeback_shown",
  GAMIFICATION: "@maraton:gamification",
  PENDING_STREAK: "@maraton:pending_streak",
  CALENDAR_TASKS: "@maraton:calendar_tasks",
  CLAIMED_MILESTONES: "@maraton:claimed_milestones",
  STUDY_HOURS: "@maraton:study_hours",
  LEAGUE_RESULT: "@maraton:league_result",
  ENDOWED_SHOWN: "@maraton:endowed_shown",
  WRAPPED_LAST: "@maraton:wrapped_last",
  STUDY_SESSION_COUNT: "@maraton:study_session_count",
  PAYWALL_SHOWN_SESSION: "@maraton:paywall_shown_session",
  PENDING_REFERRAL: "@maraton:pending_referral",
  PENDING_FRIEND_CODE: "@maraton:pending_friend_code",
  PENDING_GROUP_CODE: "@maraton:pending_group_code",
  ANALYTICS_BUFFER: "@maraton:analyticsBuffer",
  // Gun/hafta/rota tamamlama anlarinin gorulme kaydi. userScopedKey ile
  // kullaniciya ayrisir; cikista SILINMEZ, yoksa rota kapanisi tekrar gelir.
  COMPLETION_SHOWN: "@maraton:completion_shown",
  DAILY_GOAL_DONE_PREFIX: "@daily_goal_done",
  PLAN_DONE_PREFIX: "@plan_done",
};

// Gün sınırı TR saatiyle. toISOString() UTC verir; TR = UTC+3 olduğu için
// 00:00-03:00 arasında "bugün" dün sayılıyordu — günlük hedef anahtarı ve
// giriş ödülü aynı TR gününde ikinci kez tetiklenebiliyordu.
export function dailyKey(prefix) {
  return `${prefix}_${todayTR()}`;
}

export function datedKey(prefix, date) {
  return `${prefix}_${date || todayTR()}`;
}

export function userScopedKey(key, userId) {
  return userId ? `${key}:${userId}` : key;
}

export function datedUserKey(prefix, date, userId) {
  return userScopedKey(datedKey(prefix, date), userId);
}
