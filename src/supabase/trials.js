import { supabase } from "./client";

export const getTrials = async (userId) => {
  const { data, error } = await supabase
    .from("trials")
    .select("*, trial_subjects(*)")
    .eq("user_id", userId)
    .order("trial_date", { ascending: false })
    .limit(30);
  if (error) throw error;
  return data;
};

export const getTrialCountSince = async (userId, since) => {
  const { count, error } = await supabase
    .from("trials")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .gte("created_at", since);
  if (error) throw error;
  return count ?? 0;
};

export const getTrialById = async (id, userId) => {
  let query = supabase
    .from("trials")
    .select("*, trial_subjects(*)")
    .eq("id", id);
  if (userId) query = query.eq("user_id", userId);
  const { data, error } = await query.maybeSingle();
  if (error) throw error;
  return data;
};

export const addTrial = async (trial, subjects) => {
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
  if (subError) throw subError;

  return getTrialById(trialData.id, trial.user_id);
};

export const deleteTrial = async (id, userId) => {
  let query = supabase.from("trials").delete().eq("id", id);
  if (userId) query = query.eq("user_id", userId);
  const { error } = await query;
  if (error) throw error;
};
