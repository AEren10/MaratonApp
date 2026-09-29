import { supabase } from "./client";
import { handleSupabaseError } from "./handleError";

function ensureOk(result, context) {
  if (result?.ok === false) {
    const error = new Error(result.reason || "İstatistikler alınamadı");
    error.reason = result.reason;
    handleSupabaseError(error, context);
    throw error;
  }
  return result;
}

export async function getStudyTotals({ examType, field } = {}) {
  try {
    const { data, error } = await supabase.rpc("get_study_totals", {
      p_exam_type: examType ?? null,
      p_field: field ?? null,
    });
    if (error) throw error;
    return ensureOk(data, "getStudyTotals");
  } catch (e) {
    handleSupabaseError(e, "getStudyTotals");
    throw e;
  }
}
