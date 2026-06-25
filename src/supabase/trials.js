import { supabase } from "./client";
import { handleSupabaseError } from "./handleError";

export const getTrials = async (userId) => {
  try {
    const { data, error } = await supabase
      .from("trials")
      .select("*, trial_subjects(*)")
      .eq("user_id", userId)
      .order("trial_date", { ascending: false })
      .limit(30);
    if (error) throw error;
    return data || [];
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
    return data;
  } catch (e) {
    handleSupabaseError(e, "getTrialById");
    throw e;
  }
};

export const addTrial = async (trial, subjects) => {
  try {
    const { data: trialData, error: trialError } = await supabase
      .from("trials")
      .insert(trial)
      .select()
      .single();
    if (trialError) throw trialError;

    const subjectsWithTrialId = subjects.map((s) => ({
      ...s,
      trial_id: trialData.id,
    }));

    const { error: subError } = await supabase
      .from("trial_subjects")
      .insert(subjectsWithTrialId);
    if (subError) {
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
