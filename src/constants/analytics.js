export const EVENTS = {
  // Navigation lifecycle
  SCREEN_VIEW: "screen.view",
  SCREEN_EXIT: "screen.exit",
  SCREEN_DURATION: "screen.duration",

  // UI lifecycle
  BUTTON_TAP: "button.tap",
  FORM_STARTED: "form.started",
  FORM_COMPLETED: "form.completed",
  FORM_ABANDONED: "form.abandoned",

  // Auth
  AUTH_LOGIN: "auth.login",
  AUTH_REGISTER: "auth.register",
  AUTH_LOGOUT: "auth.logout",

  // Onboarding
  ONBOARDING_COMPLETE: "onboarding.complete",
  // Seviye Testi (kurulum 3/4) — rotanin baslangic neti girildi ya da atlandi.
  LEVEL_TEST_SUBMITTED: "onboarding.level_test_submitted",
  LEVEL_TEST_SKIPPED: "onboarding.level_test_skipped",
  EXAM_TYPE_SELECTED: "exam.type_selected",

  // Daily Plan
  PLAN_VIEWED: "plan.viewed",
  PLAN_TASK_COMPLETED: "plan.task_completed",
  PLAN_ALL_COMPLETED: "plan.all_completed",
  PLAN_TASK_SKIPPED: "plan.task_skipped",

  // Study
  STUDY_STARTED: "study.started",
  STUDY_COMPLETED: "study.completed",
  STUDY_TIMER_STARTED: "study.timer_started",
  STUDY_TIMER_STOPPED: "study.timer_stopped",

  // Trial
  TRIAL_ENTERED: "trial.entered",
  TRIAL_STARTED: "trial.started",
  TRIAL_ABANDONED: "trial.abandoned",
  TRIAL_COMPARED: "trial.compared",
  TRIAL_QUOTA_BLOCKED: "trial.quota_blocked",
  TRIAL_NORMALIZED: "trial.normalized",

  // Route
  ROUTE_CREATED: "route.created",
  ROUTE_CREATION_FAILED: "route.creation_failed",
  ROUTE_FIRST_ACTION_OFFERED: "route.first_action_offered",
  ROUTE_FIRST_ACTION_STARTED: "route.first_action_started",
  ROUTE_STOP_TRANSITIONED: "route.stop_transitioned",
  ROUTE_COMPANION_REQUESTED: "route.companion_requested",
  ROUTE_COMPANION_RESPONDED: "route.companion_responded",
  ROUTE_COMPANION_ENDED: "route.companion_ended",

  // Wrong Notebook
  WRONG_ADDED: "wrong.added",
  WRONG_REVIEWED: "wrong.reviewed",

  // Topic Cards
  CARD_VIEWED: "card.viewed",
  CARD_BOOKMARKED: "card.bookmarked",

  // Streak
  STREAK_CONTINUED: "streak.continued",
  STREAK_BROKEN: "streak.broken",

  // Premium
  PREMIUM_VIEWED: "premium.viewed",
  PAYWALL_VIEWED: "paywall.viewed",
  PAYWALL_SOURCE: "paywall.source",
  PREMIUM_PURCHASED: "premium.purchased",
  PREMIUM_DISMISSED: "premium.dismissed",
  PREMIUM_SESSION_TRIGGER: "premium.session_trigger",

  // Auth
  AUTH_GOOGLE_LOGIN: "auth.google_login",
  AUTH_APPLE_LOGIN: "auth.apple_login",

  // Review
  REVIEW_REQUESTED: "review.requested",

  // Engagement features
  STREAK_MILESTONE_CLAIMED: "streak.milestone_claimed",
  XP_MULTIPLIER_APPLIED: "xp.multiplier_applied",
  MYSTERY_CHEST_OPENED: "chest.opened",
  LEAGUE_PROMOTED: "league.promoted",
  LEAGUE_DEMOTED: "league.demoted",
  WRAPPED_VIEWED: "wrapped.viewed",
  WRAPPED_SHARED: "wrapped.shared",

  // Deep Link
  DEEP_LINK_OPENED: "deep_link.opened",
  REFERRAL_LINK_SHARED: "referral.link_shared",
  REFERRAL_LINK_APPLIED: "referral.link_applied",

  // Push Notifications
  PUSH_TOKEN_REGISTERED: "push.token_registered",
  PUSH_RECEIVED: "push.received",
  PUSH_OPENED: "push.opened",
};
