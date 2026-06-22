export function handleSupabaseError(error, context) {
  if (!error) return null;
  if (__DEV__) {
    console.warn(`[Supabase:${context}]`, error.message);
  }
  return error;
}
