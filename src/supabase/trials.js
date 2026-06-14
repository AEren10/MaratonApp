import { supabase } from "./client";

export const getTrials = async (userId) => {
  const { data, error } = await supabase
    .from("trials")
    .select("*, trial_subjects(*)")
    .eq("user_id", userId)
    .order("trial_date", { ascending: false });
  if (error) throw error;
  return data;
};

export const getTrialById = async (id) => {
  const { data, error } = await supabase
    .from("trials")
    .select("*, trial_subjects(*)")
    .eq("id", id)
    .maybeSingle();
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

  return getTrialById(trialData.id);
};

export const deleteTrial = async (id) => {
  const { error } = await supabase.from("trials").delete().eq("id", id);
  if (error) throw error;
};
