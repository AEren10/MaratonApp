import { supabase } from "./client";
import { handleSupabaseError } from "./handleError";

// Rota planının kalıcılığı.
//
// "Konu Borcu" ve "Plan vs Gerçek" planın SAKLANMASINI gerektiriyor: borç =
// planlanan − gerçekleşen. Plan saklanmazsa borç her zaman sıfır çıkar.
//
// exam_type her satırda tutuluyor: kullanıcı YKS↔LGS geçtiğinde eski haftalar
// başka müfredata ait olur ve borç hesabına girmemeli.

const TABLE = "route_weeks";
const STATE_TABLE = "route_state";

/** Rota çizildiğinde haftaları yaz. Aynı hafta varsa üzerine yazar. */
export async function saveRouteWeeks(userId, weeks, examType = null) {
  if (!userId || userId === "dev" || !Array.isArray(weeks) || weeks.length === 0) return 0;

  const rows = weeks
    .filter((w) => w.weekStart)
    .map((w) => ({
      user_id: userId,
      week_start: w.weekStart,
      planned_questions: Math.max(0, Math.round(w.plannedQuestions || 0)),
      planned_minutes: Math.max(0, Math.round(w.plannedMinutes || 0)),
      // Sadece gösterim için gereken alanları sakla — tüm nesneyi değil.
      stops: (w.stops || []).map((s) => ({
        subject: s.subject,
        subjectLabel: s.subjectLabel,
        topic: s.topic,
        questions: s.cost?.questions ?? s.plannedQuestions ?? 0,
        difficulty: s.cost?.difficulty ?? null,
        partial: !!s.partial,
      })),
      exam_type: examType,
      generated_at: new Date().toISOString(),
    }));

  if (!rows.length) return 0;

  try {
    const { error } = await supabase
      .from(TABLE)
      .upsert(rows, { onConflict: "user_id,week_start" });
    if (error) throw error;
    return rows.length;
  } catch (e) {
    handleSupabaseError(e, "saveRouteWeeks");
    return 0;
  }
}

/**
 * Geçmiş haftaların planı — borç hesabının girdisi.
 * @param sinceWeekStart "YYYY-MM-DD"
 */
export async function getRouteWeeks(userId, { sinceWeekStart, examType } = {}) {
  if (!userId || userId === "dev") return [];
  try {
    let q = supabase
      .from(TABLE)
      .select("week_start, planned_questions, planned_minutes, stops, exam_type")
      .eq("user_id", userId)
      .order("week_start", { ascending: true });

    if (sinceWeekStart) q = q.gte("week_start", sinceWeekStart);
    // Sınav tipi değiştiyse eski müfredatın planı borç sayılmamalı.
    if (examType) q = q.eq("exam_type", examType);

    const { data, error } = await q;
    if (error) throw error;

    return (data || []).map((r, i) => ({
      weekNo: i + 1,
      weekStart: r.week_start,
      plannedQuestions: r.planned_questions || 0,
      plannedMinutes: r.planned_minutes || 0,
      stops: r.stops || [],
      examType: r.exam_type,
    }));
  } catch (e) {
    handleSupabaseError(e, "getRouteWeeks");
    return [];
  }
}

/** Sınav tipi değişince eski rotayı temizle — yanlış müfredat borcu kalmasın. */
export async function clearRouteWeeks(userId, { exceptExamType } = {}) {
  if (!userId || userId === "dev") return;
  try {
    let q = supabase.from(TABLE).delete().eq("user_id", userId);
    if (exceptExamType) q = q.neq("exam_type", exceptExamType);
    const { error } = await q;
    if (error) throw error;
  } catch (e) {
    handleSupabaseError(e, "clearRouteWeeks");
  }
}

// ---- Rota durumu: ara verme / dondurma ----

export async function getRouteState(userId) {
  if (!userId || userId === "dev") return null;
  try {
    const { data, error } = await supabase
      .from(STATE_TABLE)
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();
    if (error) throw error;
    return data || null;
  } catch (e) {
    handleSupabaseError(e, "getRouteState");
    return null;
  }
}

export async function setRouteState(userId, patch) {
  if (!userId || userId === "dev" || !patch) return null;
  try {
    const { data, error } = await supabase
      .from(STATE_TABLE)
      .upsert(
        { user_id: userId, ...patch, updated_at: new Date().toISOString() },
        { onConflict: "user_id" },
      )
      .select()
      .maybeSingle();
    if (error) throw error;
    return data || null;
  } catch (e) {
    handleSupabaseError(e, "setRouteState");
    return null;
  }
}

export const pauseRoute = (userId) =>
  setRouteState(userId, { paused_at: new Date().toISOString(), resumed_at: null });

export const resumeRoute = (userId) =>
  setRouteState(userId, { resumed_at: new Date().toISOString(), paused_at: null });
