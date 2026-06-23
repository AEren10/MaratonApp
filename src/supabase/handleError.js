export function handleSupabaseError(error, context) {
  if (!error) return null;
  console.error(`[Supabase:${context}]`, error.message || error);
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
