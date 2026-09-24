import { supabase } from "./client";
import { handleSupabaseError } from "./handleError";

export const getDailyPlan = async (userId, date) => {
  try {
    const { data, error } = await supabase
      .from("daily_plans")
      .select("*, plan_tasks(*)")
      .eq("user_id", userId)
      .eq("plan_date", date)
      .maybeSingle();
    if (error) throw error;
    return data;
  } catch (e) {
    handleSupabaseError(e, "getDailyPlan");
    throw e;
  }
};

export const createDailyPlan = async (plan, tasks) => {
  try {
    const { data: planData, error: planError } = await supabase
      .from("daily_plans")
      .insert(plan)
      .select()
      .single();
    if (planError) throw planError;

    // AYNI DURAK IKI KEZ YAZILMAZ.
    //
    // syncPlan ayni anda birkac kez calisabiliyor; ucu de "bu planin gorevi
    // yok" diye okuyup ayni listeyi yaziyordu (22 Eylul: uc parti, hepsi
    // 00:14:06 icinde, ikisi birebir ayni). Kopyalar tik anahtarini
    // paylastigi icin BIR tik hepsini birden kapatiyor; ana sayfa "16/16
    // gunu kapattin" derken plan detayi ayni gun icin 3/15 gosteriyordu.
    //
    // Once parti kendi icinde tekillestiriliyor, sonra veritabanina "varsa
    // dokunma" diye gidiliyor. plan_tasks_unique_per_plan indeksi zaten
    // engelliyor; buradaki upsert o engeli hata degil sessiz atlama yapiyor.
    const seen = new Set();
    const tasksWithPlanId = [];
    for (const t of tasks) {
      const key = (t.subject || "") + "|" + String(t.topic || "").trim().toLocaleLowerCase("tr-TR");
      if (seen.has(key)) continue;
      seen.add(key);
      tasksWithPlanId.push({ ...t, plan_id: plan.id, user_id: plan.user_id });
    }
    if (!tasksWithPlanId.length) return getDailyPlan(plan.user_id, plan.plan_date);

    const { error } = await supabase
      .from("plan_tasks")
      .upsert(tasksWithPlanId, {
        onConflict: "plan_id,subject,topic",
        ignoreDuplicates: true,
      });
    if (error) throw error;

    return getDailyPlan(plan.user_id, plan.plan_date);
  } catch (e) {
    handleSupabaseError(e, "createPlanTasks");
    throw e;
  }
};

export const completeTask = async (taskId, userId) => {
  if (!userId) throw new Error("userId is required");
  try {
    const { data, error } = await supabase
      .from("plan_tasks")
      .update({ completed: true })
      .eq("id", taskId)
      .eq("user_id", userId)
      .select()
      .maybeSingle();
    if (error) throw error;
    if (!data) throw new Error("plan_task_not_found");
    return data;
  } catch (e) {
    handleSupabaseError(e, "completeTask");
    throw e;
  }
};

export const togglePlanTask = async (taskId, completed, userId = null) => {
  try {
    let query = supabase
      .from("plan_tasks")
      .update({ completed })
      .eq("id", taskId);
    if (userId) query = query.eq("user_id", userId);
    const { data, error } = await query.select("id").maybeSingle();
    if (error) throw error;
    if (!data) throw new Error("plan_task_not_found");
  } catch (e) {
    handleSupabaseError(e, "togglePlanTask");
    // FIRLATILMALI. Eskiden yutuluyordu ve handleSupabaseError de fırlatmadığı
    // için promise her zaman başarıyla çözülüyordu: çağırandaki .catch ölü
    // koddu, plan_tasks.completed sunucuda sonsuza kadar false kalıyordu.
    // Hemen yukarıdaki completeTask zaten fırlatıyor; tutarlı hale getirildi.
    throw e;
  }
};
