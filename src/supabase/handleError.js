import { captureError, addBreadcrumb } from "../lib/errorReporting";
import { emitAuthError } from "../lib/authEvents";

const SAFE_MESSAGES = {
  "23505": "Bu kayit zaten mevcut.",
  "23503": "Iliskili kayit bulunamadi.",
  "42501": "Bu islemi yapmaya yetkiniz yok.",
  "PGRST301": "Oturum suresi doldu, tekrar giris yapin.",
  "AuthApiError": "Oturum hatasi, tekrar giris yapin.",
};

function getSafeMessage(error) {
  if (!error) return "Bilinmeyen hata olustu.";
  const code = error.code || error.status || "";
  if (SAFE_MESSAGES[code]) return SAFE_MESSAGES[code];
  if (error.message?.includes("JWT")) return SAFE_MESSAGES.PGRST301;
  if (error.message?.includes("duplicate")) return SAFE_MESSAGES["23505"];
  return "Bir hata olustu. Lutfen tekrar deneyin.";
}

function isAuthError(error) {
  if (!error) return false;
  const code = error.code || error.status || "";
  const msg = error.message || "";
  const status = error.status || error.statusCode;
  // 42501 = RLS politika reddi. PostgREST bunu 403 ile döner ama bu bir
  // KİMLİK hatası değil, yetki hatası — kullanıcıyı çıkışa zorlamamalı.
  // Bu yüzden çıplak 403 auth hatası sayılmaz; 401 ve JWT sinyalleri sayılır.
  if (code === "42501") return false;
  return (
    code === "PGRST301" ||
    code === "AuthApiError" ||
    status === 401 ||
    msg.includes("JWT") ||
    msg.includes("token is expired") ||
    msg.includes("invalid claim")
  );
}

function isTransientNetworkError(error) {
  if (!error) return false;
  const msg = String(error.message || error.name || error).toLowerCase();
  return (
    msg.includes("fetch failed") ||
    msg.includes("network request failed") ||
    msg.includes("network connection was lost") ||
    msg.includes("network error") ||
    msg.includes("internet connection") ||
    msg.includes("request timeout") ||
    msg.includes("upstream request timeout") ||
    msg.includes("timeout") ||
    msg.includes("aborterror")
  );
}

export function handleSupabaseError(error, context) {
  if (!error) return null;

  const transientNetwork = isTransientNetworkError(error);

  if (__DEV__) {
    const log = transientNetwork ? console.warn : console.error;
    log(`[Supabase:${context}]`, error.message || error);
  } else {
    addBreadcrumb({
      category: "supabase",
      message: context,
      level: transientNetwork ? "warning" : "error",
    });
    if (!transientNetwork) {
      captureError(error, { supabaseContext: context });
    }
  }

  if (isAuthError(error)) {
    emitAuthError();
  }

  error._safeMessage = getSafeMessage(error);
  return error;
}

export function throwSupabaseError(error, context) {
  handleSupabaseError(error, context);
  if (error) throw error;
}

export function safeAsync(fn, context, fallback = null) {
  return async (...args) => {
    try {
      return await fn(...args);
    } catch (e) {
      handleSupabaseError(e, context);
      return fallback;
    }
  };
}
