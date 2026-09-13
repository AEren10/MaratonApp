import { supabase } from "./client";
import { handleSupabaseError } from "./handleError";

// GERCEK SINAV SONUCU — tasarim AKIS 14 · "Sınav Sonucu".
// Tablo: supabase/migrations/20260913120000_cld_exam_results.sql
// (HENUZ UYGULANMADI). Tablo yoksa okuma null, yazma MissingTableError
// dondurur; ekran yerel kopyayla calismaya devam eder.

const TABLE = "exam_results";
const COLUMNS = "exam_type, exam_date, primary_net, secondary_net, placement_score, forecast_snapshot, updated_at";

export function isMissingTableError(error) {
  const code = error?.code || "";
  return code === "PGRST205" || code === "42P01";
}

const toNumber = (value) => (value == null ? null : Number(value));

export function fromExamResultRow(row) {
  if (!row) return null;
  return {
    examType: row.exam_type,
    examDate: row.exam_date,
    record: {
      primaryNet: toNumber(row.primary_net),
      ...(row.secondary_net != null ? { secondaryNet: toNumber(row.secondary_net) } : {}),
      ...(row.placement_score != null ? { placementScore: toNumber(row.placement_score) } : {}),
    },
    forecast: row.forecast_snapshot || null,
    updatedAt: row.updated_at,
  };
}

export async function getExamResult(userId, examType, examDateKey) {
  if (!userId || userId === "dev" || !examType || !examDateKey) return null;
  const { data, error } = await supabase
    .from(TABLE)
    .select(COLUMNS)
    .eq("user_id", userId)
    .eq("exam_type", examType)
    .eq("exam_date", examDateKey)
    .maybeSingle();
  if (error) {
    if (!isMissingTableError(error)) handleSupabaseError(error, "getExamResult");
    throw error;
  }
  return fromExamResultRow(data);
}

export async function upsertExamResult(userId, { examType, examDate, record, forecast }) {
  if (!userId || userId === "dev") throw new Error("userId is required");
  const { error } = await supabase.from(TABLE).upsert(
    {
      user_id: userId,
      exam_type: examType,
      exam_date: examDate,
      primary_net: record.primaryNet,
      secondary_net: record.secondaryNet ?? null,
      placement_score: record.placementScore ?? null,
      forecast_snapshot: forecast ?? null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,exam_type,exam_date" },
  );
  if (error) {
    if (!isMissingTableError(error)) handleSupabaseError(error, "upsertExamResult");
    throw error;
  }
}
