import { supabase } from "./client";
import { handleSupabaseError } from "./handleError";
import { normalizeTrial, toTrialSubjectRows } from "../domain/trial/trialModel";

export class TrialWriteError extends Error {
  constructor(reason, details = {}) {
    super(reason || "Deneme kaydedilemedi");
    this.name = "TrialWriteError";
    this.code = reason;
    this.details = details;
    this.retryable = false;
  }
}

export const isPermanentTrialError = (error) => error?.retryable === false;

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
    const operationId = trial.client_operation_id ?? trial.clientOperationId;
    const { data, error } = await supabase.rpc("create_trial", {
      p_client_operation_id: operationId,
      p_name: trial.name,
      p_trial_date: trial.trial_date ?? trial.date,
      p_exam_type: trial.exam_type ?? trial.trialType,
      p_field: trial.field ?? null,
      p_branch_subject: trial.branch_subject ?? trial.branchSubject ?? null,
      p_mood: trial.mood ?? null,
      p_publisher_id: trial.publisher_id ?? trial.publisherId ?? null,
      p_difficulty_level: trial.difficulty_level ?? trial.difficultyLevel ?? "standard",
      p_subjects: toTrialSubjectRows(subjects, trial.exam_type ?? trial.trialType),
    });
    if (error) throw error;
    if (!data?.ok) throw new TrialWriteError(data?.reason, data);
    const result = normalizeTrial(data.trial);
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
