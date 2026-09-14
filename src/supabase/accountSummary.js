import { supabase } from "./client";
import { handleSupabaseError } from "./handleError";

// Veri Indir "İÇİNDE NE VAR" ve Hesap Silme "SİLİNECEK" sayilari.
// Her sayi bagimsiz okunur; okunamayan null doner ve ekranda GOSTERILMEZ
// (uydurma sayi yok).
const PAGE = 1000;

async function countRows(table, userId) {
  try {
    const { count, error } = await supabase
      .from(table)
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId);
    if (error) throw error;
    return count ?? 0;
  } catch (e) {
    handleSupabaseError(e, `accountSummary.count.${table}`);
    return null;
  }
}

// Calisilan gun sayisi (farkli study_date) ve toplam soru kaydi.
async function studyTotals(userId) {
  try {
    const days = new Set();
    let questions = 0;
    for (let from = 0; ; from += PAGE) {
      const { data, error } = await supabase
        .from("study_logs")
        .select("id, study_date, question_count")
        .eq("user_id", userId)
        .order("id", { ascending: true })
        .range(from, from + PAGE - 1);
      if (error) throw error;
      for (const row of data || []) {
        if (row.study_date) days.add(String(row.study_date).slice(0, 10));
        questions += Number(row.question_count) || 0;
      }
      if (!data || data.length < PAGE) break;
    }
    return { studyDays: days.size, questionCount: questions };
  } catch (e) {
    handleSupabaseError(e, "accountSummary.studyTotals");
    return { studyDays: null, questionCount: null };
  }
}

export async function getAccountDataCounts(userId) {
  if (!userId) throw new Error("userId is required");
  const [trials, sessions, wrongQuestions, totals] = await Promise.all([
    countRows("trials", userId),
    countRows("study_logs", userId),
    countRows("wrong_questions", userId),
    studyTotals(userId),
  ]);
  return { trials, sessions, wrongQuestions, ...totals };
}
