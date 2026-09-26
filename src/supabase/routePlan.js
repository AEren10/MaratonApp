import { supabase } from "./client";
import { handleSupabaseError } from "./handleError";
import { createRouteRevision } from "../domain/route/routeIdentity";
import * as appStorage from "../lib/storage/appStorage";
import { STORAGE_KEYS, userScopedKey } from "../constants/storageKeys";

// Rota planının kalıcılığı.
//
// "Konu Borcu" ve "Plan vs Gerçek" planın SAKLANMASINI gerektiriyor: borç =
// planlanan − gerçekleşen. Plan saklanmazsa borç her zaman sıfır çıkar.
//
// exam_type her satırda tutuluyor: kullanıcı YKS↔LGS geçtiğinde eski haftalar
// başka müfredata ait olur ve borç hesabına girmemeli.

const TABLE = "route_weeks";
const STATE_TABLE = "route_state";
const ROUTE_STOP_COLUMNS = [
  "id",
  "user_id",
  "revision_id",
  "logical_key",
  "root_key",
  "week_start",
  "position",
  "segment_index",
  "subject",
  "subject_label",
  "topic",
  "stop_kind",
  "lifecycle_status",
  "predecessor_stop_id",
  "replacement_stop_id",
  "version",
  "metadata",
  "created_at",
  "updated_at",
].join(", ");
const ROUTE_STATE_COLUMNS = "user_id, paused_at, resumed_at, exam_type, updated_at";

/** Rota çizildiğinde haftaları yaz. Aynı hafta varsa üzerine yazar. */
export async function saveRouteWeeks(userId, weeks, examType = null, suppliedRevision = null) {
  if (!userId || !Array.isArray(weeks) || weeks.length === 0) return 0;

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
    await appStorage.setJson(userScopedKey(STORAGE_KEYS.ROUTE_WEEKS, userId), rows);
  } catch (_) {}

  if (userId === "dev") return rows.length;

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
    if (e?.code === "42501" || e?.status === 403 || e?.message?.includes?.("route access required") || e?.message?.includes?.("Network request failed")) {
      return rows.length;
    }
    throw e;
  }
}

export async function getLatestRouteStops(userId, examType = null) {
  if (!userId) return [];
  if (userId === "dev") {
    return (await appStorage.getJson(userScopedKey(STORAGE_KEYS.ROUTE_STOPS, userId), [])) || [];
  }
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
    if (data?.id) {
      const serverStops = await getRouteStops(userId, data.id);
      if (serverStops && serverStops.length > 0) {
        await appStorage.setJson(userScopedKey(STORAGE_KEYS.ROUTE_STOPS, userId), serverStops);
        return serverStops;
      }
    }
  } catch (e) {
    handleSupabaseError(e, "getLatestRouteStops");
  }
  return (await appStorage.getJson(userScopedKey(STORAGE_KEYS.ROUTE_STOPS, userId), [])) || [];
}

export async function getRouteStops(userId, revisionId = null) {
  if (!userId || userId === "dev") return [];
  try {
    let query = supabase
      .from("route_stops")
      .select(ROUTE_STOP_COLUMNS)
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

export async function getRouteStopById(stopId, userId = null) {
  if (!stopId || stopId === "dev") return null;
  try {
    let query = supabase.from("route_stops").select(ROUTE_STOP_COLUMNS).eq("id", stopId);
    if (userId && userId !== "dev") query = query.eq("user_id", userId);
    const { data, error } = await query.maybeSingle();
    if (error) return null;
    return data || null;
  } catch {
    return null;
  }
}

export async function transitionRouteStop({
  stopId,
  transition,
  expectedVersion,
  clientOperationId,
  occurredAt = new Date().toISOString(),
  payload = {},
  userId = null,
  reconcileOnConflict = true,
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
    const isConflict =
      e?.code === "PT409" ||
      e?.code === "40001" ||
      e?.code === "22023" ||
      e?.code === "P0002" ||
      e?.message?.includes("version conflict") ||
      e?.message?.includes("invalid route stop transition");

    if (reconcileOnConflict && isConflict) {
      try {
        const serverStop = await getRouteStopById(stopId, userId);

        if (!serverStop) {
          return { id: stopId, lifecycle_status: transition, reconciled: true, reason: "stop_not_found" };
        }

        if (serverStop.lifecycle_status === transition) {
          return { ...serverStop, reconciled: true, reason: "already_in_state" };
        }

        const canTransition =
          (serverStop.lifecycle_status === "upcoming" || serverStop.lifecycle_status === "active") &&
          ["completed", "skipped", "rescheduled"].includes(transition);

        if (canTransition) {
          const { data: retriedData, error: retryErr } = await supabase.rpc("transition_route_stop", {
            p_stop_id: stopId,
            p_transition: transition,
            p_expected_version: serverStop.version,
            p_client_operation_id: clientOperationId,
            p_occurred_at: occurredAt,
            p_payload: payload,
          });
          if (!retryErr) {
            return Array.isArray(retriedData) ? retriedData[0] || null : retriedData;
          }
        }

        if (serverStop.version > (expectedVersion ?? 0)) {
          return { ...serverStop, reconciled: true, reason: "server_version_ahead" };
        }
      } catch {
        // Reconcile esnasinda beklenmeyen bir hata olursa orijinal hataya devam et
      }
    }

    handleSupabaseError(e, "transitionRouteStop");
    throw e;
  }
}

/**
 * Geçmiş haftaların planı — borç hesabının girdisi.
 * @param sinceWeekStart "YYYY-MM-DD"
 */
export async function getRouteWeeks(userId, { sinceWeekStart, examType } = {}) {
  if (!userId) return [];
  if (userId !== "dev") {
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

      if (data && data.length > 0) {
        const mapped = data.map((r, i) => ({
          weekNo: i + 1,
          weekStart: r.week_start,
          plannedQuestions: r.planned_questions || 0,
          plannedMinutes: r.planned_minutes || 0,
          stops: r.stops || [],
          examType: r.exam_type,
        }));
        await appStorage.setJson(userScopedKey(STORAGE_KEYS.ROUTE_WEEKS, userId), data);
        return mapped;
      }
    } catch (e) {
      handleSupabaseError(e, "getRouteWeeks");
    }
  }

  // Local fallback
  const local = (await appStorage.getJson(userScopedKey(STORAGE_KEYS.ROUTE_WEEKS, userId), [])) || [];
  const filtered = local.filter((r) => {
    if (sinceWeekStart && r.week_start < sinceWeekStart) return false;
    if (examType && r.exam_type && r.exam_type !== examType) return false;
    return true;
  });
  return filtered.map((r, i) => ({
    weekNo: i + 1,
    weekStart: r.week_start,
    plannedQuestions: r.planned_questions || 0,
    plannedMinutes: r.planned_minutes || 0,
    stops: r.stops || [],
    examType: r.exam_type,
  }));
}

/** Sınav tipi değişince eski rotayı temizle — yanlış müfredat borcu kalmasın. */
export async function clearRouteWeeks(userId, { exceptExamType } = {}) {
  if (!userId || userId === "dev") return;
  try {
    let q = supabase.from(TABLE).delete().eq("user_id", userId);
    if (exceptExamType) q = q.or(`exam_type.is.null,exam_type.neq.${exceptExamType}`);
    const { error } = await q;
    if (error) throw error;
  } catch (e) {
    handleSupabaseError(e, "clearRouteWeeks");
  }
}

// ---- Rota durumu: ara verme / dondurma ----

export async function getRouteState(userId, examType = null) {
  if (!userId || userId === "dev") return null;
  try {
    let query = supabase
      .from(STATE_TABLE)
      .select(ROUTE_STATE_COLUMNS)
      .eq("user_id", userId)
      .order("updated_at", { ascending: false });
    if (examType) {
      query = query.or(`exam_type.eq.${examType},exam_type.is.null`).limit(2);
    } else {
      query = query.limit(1);
    }
    const { data, error } = await query;
    if (error) throw error;
    const rows = data || [];
    return rows.find((row) => row.exam_type === examType) || rows[0] || null;
  } catch (e) {
    handleSupabaseError(e, "getRouteState");
    throw e;
  }
}

export async function setRouteState(userId, patch, examType = null) {
  if (!userId || userId === "dev" || !patch) return null;
  try {
    const { data, error } = await supabase
      .from(STATE_TABLE)
      .upsert(
        {
          user_id: userId,
          ...patch,
          exam_type: examType ?? patch.exam_type ?? null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id,exam_type" },
      )
      .select(ROUTE_STATE_COLUMNS)
      .maybeSingle();
    if (error) throw error;
    return data || null;
  } catch (e) {
    handleSupabaseError(e, "setRouteState");
    throw e;
  }
}

export const pauseRoute = (userId, examType = null) =>
  setRouteState(userId, {
    paused_at: new Date().toISOString(),
    resumed_at: null,
  }, examType);

export const resumeRoute = (userId, examType = null) =>
  setRouteState(userId, { resumed_at: new Date().toISOString() }, examType);
