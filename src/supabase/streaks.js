import { supabase } from "./client";
import { handleSupabaseError } from "./handleError";

export const getStreak = async (userId) => {
  if (!userId) throw new Error("userId is required");
  try {
    const { data, error } = await supabase
      .from("streaks")
      .select("user_id, current_streak, longest_streak, last_study_date, freeze_count, last_freeze_at, freeze_reset_at")
      .eq("user_id", userId)
      .maybeSingle();
    if (error) throw error;
    // Satır yoksa İSTEMCİ OLUŞTURMAZ (INSERT izni kaldırıldı). Sunucu
    // tarafındaki trigger ya da ilk touch_streak çağrısı oluşturuyor.
    // Burada boş bir varsayılan dönmek yeterli.
    if (!data) {
      return {
        user_id: userId,
        current_streak: 0,
        longest_streak: 0,
        last_study_date: null,
        freeze_count: 0,
        last_freeze_at: null,
        freeze_reset_at: null,
      };
    }
    return data;
  } catch (e) {
    handleSupabaseError(e, "getStreak");
    throw e;
  }
};

/**
 * Seriyi ilerletir. SAYIYI İSTEMCİ BELİRLEMEZ.
 *
 * Eskiden istemci current_streak'i doğrudan yazabiliyordu; tek bir istekle
 * 365 yazıp streak milestone'larından toplam 55 gün bedava premium almak
 * mümkündü. Artık yalnızca "şu tarihte çalıştım" deniyor; sunucu o tarihte
 * gerçek bir çalışma kaydı olup olmadığını doğrulayıp geçişi kendisi
 * hesaplıyor (bkz. 20260908130000 migration).
 *
 * @param studyDate "YYYY-MM-DD" — yoksa sunucu bugünü (TR) kullanır
 */
export const touchStreak = async (userId, studyDate = null) => {
  if (!userId) throw new Error("userId is required");
  try {
    const { data, error } = await supabase.rpc("touch_streak", {
      p_study_date: studyDate,
    });
    if (error) throw error;
    return data || null;
  } catch (e) {
    handleSupabaseError(e, "touchStreak");
    throw e;
  }
};
