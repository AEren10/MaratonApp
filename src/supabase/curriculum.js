import { supabase } from "./client";
import { getSubjectsForExam, getAllSubjectsFlat } from "../data/curriculum";
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

// Yerel müfredattan konu listesi — DB'de ders/konu yoksa kullanılır.
//
// Önceden üç yerde `getSubjectsForExam("tyt_ayt", "sayisal")` sabitti. Bu
// havuzda LGS dersleri YOK, dolayısıyla lgs_* anahtarı asla bulunamıyor ve
// LGS kullanıcısının konu listesi BOŞ dönüyordu. Canlı `subjects` tablosunda
// da LGS satırı bulunmadığı için bu yol her seferinde çalışıyordu.
function localTopics(subjectKey) {
  const local = getAllSubjectsFlat().find((s) => s.key === subjectKey);
  return local?.topics?.map((name, i) => ({ id: `local_${i}`, name, sort_order: i })) || [];
}

export async function fetchTopicsForSubject(subjectKey) {
  try {
    const { data: subj } = await supabase
      .from("subjects")
      .select("id")
      .eq("key", subjectKey)
      .maybeSingle();
    if (!subj?.id) {
      return localTopics(subjectKey);
    }
    const { data, error } = await supabase
      .from("topics")
      .select("id, name, sort_order, subject_id")
      .eq("subject_id", subj.id)
      .order("sort_order", { ascending: true });
    if (error || !data?.length) {
      return localTopics(subjectKey);
    }
    return data;
  } catch (e) {
    handleSupabaseError(e, "fetchTopicsForSubject");
    return localTopics(subjectKey);
  }
}
