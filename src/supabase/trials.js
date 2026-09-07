import { supabase } from "./client";
import { handleSupabaseError } from "./handleError";
import { normalizeTrial, toTrialRow, toTrialSubjectRows } from "../domain/trial/trialModel";

function isIdempotencyConflict(error) {
  return error?.code === "23505" && String(error?.message || "").includes("client_operation_id");
}

async function getTrialByClientOperationId(userId, clientOperationId) {
  if (!userId || !clientOperationId) return null;
  const { data, error } = await supabase
    .from("trials")
    .select("*, trial_subjects(*)")
    .eq("user_id", userId)
    .eq("client_operation_id", clientOperationId)
    .maybeSingle();
  if (error) throw error;
  return data ? normalizeTrial(data) : null;
}

async function upsertTrialSubjects(trialId, trialType, subjects) {
  const subjectsWithTrialId = toTrialSubjectRows(subjects, trialType).map((s) => ({
    ...s,
    trial_id: trialId,
  }));
  if (!subjectsWithTrialId.length) return;

  const { error } = await supabase
    .from("trial_subjects")
    .upsert(subjectsWithTrialId, { onConflict: "trial_id,subject" });
  if (error) throw error;
}

export const getTrials = async (userId) => {
  try {
    const { data, error } = await supabase
      .from("trials")
      .select("*, trial_subjects(*)")
      .eq("user_id", userId)
      .order("trial_date", { ascending: false })
      .limit(30);
    if (error) throw error;
    return (data || []).map(normalizeTrial);
  } catch (e) {
    handleSupabaseError(e, "getTrials");
    throw e;
  }
};

export const getTrialCountSince = async (userId, since) => {
  try {
    const { count, error } = await supabase
      .from("trials")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .gte("created_at", since);
    if (error) throw error;
    return count ?? 0;
  } catch (e) {
    handleSupabaseError(e, "getTrialCountSince");
    throw e;
  }
};

export const getTrialById = async (id, userId) => {
  if (!userId) throw new Error("userId is required");
  try {
    const { data, error } = await supabase
      .from("trials")
      .select("*, trial_subjects(*)")
      .eq("id", id)
      .eq("user_id", userId)
      .maybeSingle();
    if (error) throw error;
    return data ? normalizeTrial(data) : data;
  } catch (e) {
    handleSupabaseError(e, "getTrialById");
    throw e;
  }
};

export const addTrial = async (trial, subjects) => {
  try {
    const { data: trialData, error: trialError } = await supabase
      .from("trials")
      .insert(toTrialRow(trial))
      .select()
      .single();
    if (trialError) {
      if (isIdempotencyConflict(trialError)) {
        const existing = await getTrialByClientOperationId(trial.user_id, trial.client_operation_id);
        if (existing) {
          await upsertTrialSubjects(existing.id, existing.exam_type, subjects);
          return getTrialById(existing.id, trial.user_id);
        }
      }
      throw trialError;
    }

    try {
      await upsertTrialSubjects(trialData.id, trialData.exam_type, subjects);
    } catch (subError) {
      await supabase.from("trials").delete().eq("id", trialData.id);
      throw subError;
    }

    const result = await getTrialById(trialData.id, trial.user_id);
    import("./percentile").then((m) => m.refreshPercentilesIfStale()).catch(() => {});
    return result;
  } catch (e) {
    handleSupabaseError(e, "addTrial");
    throw e;
  }
};

export const deleteTrial = async (id, userId) => {
  if (!userId) throw new Error("userId is required");
  try {
    const { error } = await supabase.from("trials").delete().eq("id", id).eq("user_id", userId);
    if (error) throw error;
  } catch (e) {
    handleSupabaseError(e, "deleteTrial");
    throw e;
  }
};
