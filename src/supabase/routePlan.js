import { supabase } from "./client";
import { handleSupabaseError } from "./handleError";
import { createRouteRevision } from "../domain/route/routeIdentity";

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
export async function saveRouteWeeks(userId, weeks, examType = null, suppliedRevision = null) {
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
        minutes: s.cost?.minutes ?? s.plannedMinutes ?? 0,
        difficulty: s.cost?.difficulty ?? null,
        partial: !!s.partial,
        isReview: !!s.isReview,
        logicalStopKey: s.logicalStopKey,
        rootStopKey: s.rootStopKey,
        segmentIndex: s.segmentIndex ?? 0,
        position: s.position ?? 0,
        lifecycleStatus: s.lifecycleStatus,
        reasonCodes: s.reasonCodes || [],
        scoreComponents: s.scoreComponents || {},
        dataConfidence: s.dataConfidence || "low",
        insight: s.insight || null,
      })),
      exam_type: examType,
      generated_at: new Date().toISOString(),
    }));

  if (!rows.length) return 0;

  try {
    const revision = suppliedRevision || createRouteRevision({
      weeks,
      examType: examType || "unknown",
      weekStart: weeks[0]?.weekStart,
    });
    const { error: revisionError } = await supabase.rpc("persist_route_revision", {
      p_revision_key: revision.revisionKey,
      p_exam_type: examType,
      p_algorithm_version: revision.algorithmVersion,
      p_input_hash: revision.inputHash,
      p_weeks: rows,
    });
    if (revisionError) throw revisionError;
    return rows.length;
  } catch (e) {
    handleSupabaseError(e, "saveRouteWeeks");
    return 0;
  }
}

export async function getLatestRouteStops(userId, examType = null) {
  if (!userId || userId === "dev") return [];
  try {
    let query = supabase
      .from("route_revisions")
      .select("id")
      .eq("user_id", userId)
      .order("generated_at", { ascending: false })
      .limit(1);
    if (examType) query = query.eq("exam_type", examType);
    const { data, error } = await query.maybeSingle();
    if (error) throw error;
    return data?.id ? getRouteStops(userId, data.id) : [];
  } catch (e) {
    handleSupabaseError(e, "getLatestRouteStops");
    throw e;
  }
}

export async function getRouteStops(userId, revisionId = null) {
  if (!userId || userId === "dev") return [];
  try {
    let query = supabase
      .from("route_stops")
      .select("*")
      .eq("user_id", userId)
      .order("week_start", { ascending: true })
      .order("position", { ascending: true });
    if (revisionId) query = query.eq("revision_id", revisionId);
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  } catch (e) {
    handleSupabaseError(e, "getRouteStops");
    throw e;
  }
}

export async function transitionRouteStop({
  stopId,
  transition,
  expectedVersion,
  clientOperationId,
  occurredAt = new Date().toISOString(),
  payload = {},
}) {
  if (!stopId || !transition || !clientOperationId) {
    throw new Error("stopId, transition and clientOperationId are required");
  }
  try {
    const { data, error } = await supabase.rpc("transition_route_stop", {
      p_stop_id: stopId,
      p_transition: transition,
      p_expected_version: expectedVersion,
      p_client_operation_id: clientOperationId,
      p_occurred_at: occurredAt,
      p_payload: payload,
    });
    if (error) throw error;
    return Array.isArray(data) ? data[0] || null : data;
  } catch (e) {
    handleSupabaseError(e, "transitionRouteStop");
    throw e;
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

export const pauseRoute = (userId, examType = null) =>
  setRouteState(userId, {
    paused_at: new Date().toISOString(),
    resumed_at: null,
    exam_type: examType,
  });

export const resumeRoute = (userId, examType = null) =>
  setRouteState(userId, { resumed_at: new Date().toISOString(), exam_type: examType });
