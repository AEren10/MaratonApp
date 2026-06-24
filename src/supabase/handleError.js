import { captureError, addBreadcrumb } from "../lib/errorReporting";

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

export function handleSupabaseError(error, context) {
  if (!error) return null;

  if (__DEV__) {
    console.error(`[Supabase:${context}]`, error.message || error);
  } else {
    addBreadcrumb({
      category: "supabase",
      message: context,
      level: "error",
    });
    captureError(error, { supabaseContext: context });
  }

  error._safeMessage = getSafeMessage(error);
  return error;
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
