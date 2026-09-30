import { supabase } from "./client";
import { handleSupabaseError } from "./handleError";
import { invalidateInFlightResource, makeInFlightKey, shareInFlight } from "../lib/inflightRequest";

export const getDailyPlan = (userId, date) => {
  const key = makeInFlightKey("daily_plans", userId, { date });
  return shareInFlight(key, async () => {
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
  });
};

// GUNUN PLANI + GOREVLERI.
//
// 24 Eylul'den 1 Ekim'e kadar hicbir gune plan gorevi yazilmadi (canli:
// plan var, plan_tasks 0). Iki hata ust uste: gorevler `plan.id` ile
// yaziliyordu ama `plan` eklenen HAM veriydi (id yok) -> plan_id bos, ekleme
// reddedildi; "planin gorevi yok" dali da export edilmemis createPlanTasks'i
// cagiriyordu -> TypeError, sessizce yutuldu. Tikler cihazda kaldi, sunucuya
// ve diger cihazlara gitmedi.
//
// Gece yarisi iki cagri ayni milisaniyede "plan yok" okuyabiliyor: ikinci
// ekleme UNIQUE (user_id, plan_date)'e takilir (23505). O zaman hata degil,
// var olan plan kullanilir.
export const createDailyPlan = async (plan, tasks) => {
  try {
    const { data: planData, error: planError } = await supabase
      .from("daily_plans")
      .insert(plan)
      .select()
      .single();
    let row = planData;
    if (planError) {
      if (planError.code !== "23505") throw planError;
      row = await getDailyPlan(plan.user_id, plan.plan_date);
      if (!row) throw planError;
    }
    invalidateInFlightResource("daily_plans", plan.user_id);
    return createPlanTasks(row, tasks);
  } catch (e) {
    handleSupabaseError(e, "createDailyPlan");
    throw e;
  }
};

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
// planRow: veritabanindaki plan satiri (id'si olan).
export const createPlanTasks = async (planRow, tasks) => {
  try {
    if (!planRow?.id) throw new Error("plan_row_without_id");
    const seen = new Set();
    const tasksWithPlanId = [];
    for (const t of tasks || []) {
      const key = (t.subject || "") + "|" + String(t.topic || "").trim().toLocaleLowerCase("tr-TR");
      if (seen.has(key)) continue;
      seen.add(key);
      tasksWithPlanId.push({ ...t, plan_id: planRow.id, user_id: planRow.user_id });
    }
    if (!tasksWithPlanId.length) return getDailyPlan(planRow.user_id, planRow.plan_date);

    const { error } = await supabase
      .from("plan_tasks")
      .upsert(tasksWithPlanId, {
        onConflict: "plan_id,subject,topic",
        ignoreDuplicates: true,
      });
    if (error) throw error;

    invalidateInFlightResource("daily_plans", planRow.user_id);
    return getDailyPlan(planRow.user_id, planRow.plan_date);
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
    invalidateInFlightResource("daily_plans", userId);
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
    invalidateInFlightResource("daily_plans", userId);
  } catch (e) {
    handleSupabaseError(e, "togglePlanTask");
    // FIRLATILMALI. Eskiden yutuluyordu ve handleSupabaseError de fırlatmadığı
    // için promise her zaman başarıyla çözülüyordu: çağırandaki .catch ölü
    // koddu, plan_tasks.completed sunucuda sonsuza kadar false kalıyordu.
    // Hemen yukarıdaki completeTask zaten fırlatıyor; tutarlı hale getirildi.
    throw e;
  }
};
