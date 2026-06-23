import { supabase } from "./client";
import { getSubjectsForExam } from "../data/curriculum";
import { handleSupabaseError } from "./handleError";

export async function fetchSubjects(exam, field) {
  try {
    const query = supabase
      .from("subjects")
      .select("*, topics(id, name, sort_order)")
      .order("sort_order", { ascending: true });

    if (exam === "lgs") {
      query.eq("exam", "lgs");
    } else if (exam === "tyt") {
      query.eq("exam", "tyt");
    } else if (exam === "tyt_ayt") {
      query.or(`exam.eq.tyt,and(exam.eq.ayt,field.eq.${field})`);
    } else if (exam === "dil") {
      query.or("exam.eq.tyt,exam.eq.ydt");
    }

    const { data, error } = await query;

    if (error || !data?.length) {
      return getSubjectsForExam(exam, field);
    }

    return data.map((s) => ({
      key: s.key,
      label: s.label,
      color: s.color,
      icon: s.icon,
      questionCount: s.question_count,
      exam: s.exam,
      field: s.field,
      group: s.group,
      topics: (s.topics || [])
        .sort((a, b) => a.sort_order - b.sort_order)
        .map((t) => t.name),
    }));
  } catch (e) {
    handleSupabaseError(e, "fetchSubjects");
    return getSubjectsForExam(exam, field);
  }
}

export async function fetchTopicsForSubject(subjectKey) {
  try {
    const { data: subj } = await supabase
      .from("subjects")
      .select("id")
      .eq("key", subjectKey)
      .maybeSingle();
    if (!subj?.id) {
      const allSubjects = getSubjectsForExam("tyt_ayt", "sayisal");
      const local = allSubjects.find((s) => s.key === subjectKey);
      return local?.topics?.map((name, i) => ({ id: `local_${i}`, name, sort_order: i })) || [];
    }
    const { data, error } = await supabase
      .from("topics")
      .select("id, name, sort_order, subject_id")
      .eq("subject_id", subj.id)
      .order("sort_order", { ascending: true });
    if (error || !data?.length) {
      const allSubjects = getSubjectsForExam("tyt_ayt", "sayisal");
      const local = allSubjects.find((s) => s.key === subjectKey);
      return local?.topics?.map((name, i) => ({ id: `local_${i}`, name, sort_order: i })) || [];
    }
    return data;
  } catch (e) {
    handleSupabaseError(e, "fetchTopicsForSubject");
    const allSubjects = getSubjectsForExam("tyt_ayt", "sayisal");
    const local = allSubjects.find((s) => s.key === subjectKey);
    return local?.topics?.map((name, i) => ({ id: `local_${i}`, name, sort_order: i })) || [];
  }
}
