// Optional Sentry integration. Configure EXPO_PUBLIC_SENTRY_DSN to enable.
// In dev or without DSN, falls back to no-op so the app never crashes due to Sentry.

let Sentry = null;
let initialized = false;

const DSN = process.env.EXPO_PUBLIC_SENTRY_DSN;

export function initErrorReporting() {
  if (initialized) return;
  if (!DSN) {
    initialized = true;
    return;
  }
  try {
    Sentry = require("@sentry/react-native");
    Sentry.init({
      dsn: DSN,
      enableAutoSessionTracking: true,
      sessionTrackingIntervalMillis: 30000,
      tracesSampleRate: 0.1,
      enableNative: true,
      // Don't ship PII; we just want crash + breadcrumbs.
      sendDefaultPii: false,
    });
    initialized = true;
  } catch (_) {
    initialized = true;
  }
}

export function captureError(error, context = {}) {
  if (!Sentry) return;
  try {
    Sentry.captureException(error, { extra: context });
  } catch (_) {}
}

export function captureMessage(message, level = "info") {
  if (!Sentry) return;
  try {
    Sentry.captureMessage(message, level);
  } catch (_) {}
}

export function setUserContext(user) {
  if (!Sentry) return;
  try {
    if (!user) {
      Sentry.setUser(null);
      return;
    }
    Sentry.setUser({ id: user.id, email: undefined });
  } catch (_) {}
}

export function addBreadcrumb(crumb) {
  if (!Sentry) return;
  try {
    Sentry.addBreadcrumb(crumb);
  } catch (_) {}
}
