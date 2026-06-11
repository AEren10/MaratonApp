import { supabase } from "./client";
import { getSubjectsForExam } from "../data/curriculum";

export async function fetchSubjects(exam, field) {
  const query = supabase
    .from("subjects")
    .select("*, topics(id, name, sort_order)")
    .order("sort_order", { ascending: true });

  if (exam === "tyt") {
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
}

export async function fetchTopicsForSubject(subjectKey) {
  const { data, error } = await supabase
    .from("topics")
    .select("id, name, sort_order, subject_id")
    .eq("subject_id", (
      await supabase
        .from("subjects")
        .select("id")
        .eq("key", subjectKey)
        .single()
    ).data?.id)
    .order("sort_order", { ascending: true });

  if (error || !data?.length) {
    const allSubjects = getSubjectsForExam("tyt_ayt", "sayisal");
    const local = allSubjects.find((s) => s.key === subjectKey);
    return local?.topics?.map((name, i) => ({ id: `local_${i}`, name, sort_order: i })) || [];
  }

  return data;
}
