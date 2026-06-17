import { supabase } from "./client";

export const getProfile = async (userId) => {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();
  if (error) throw error;
  return data;
};

export const updateProfile = async (userId, updates) => {
  const { data, error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", userId)
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const updateExamConfig = async (userId, config) => {
  return updateProfile(userId, {
    exam_type: config.examType,
    field: config.field || null,
    exam_date: config.examDate
      ? config.examDate.toISOString().split("T")[0]
      : null,
    target_ranking: config.targetRanking || null,
    target_department: config.targetDepartment || null,
  });
};
