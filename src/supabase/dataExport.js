import { supabase } from "./client.js";
import { handleSupabaseError } from "./handleError.js";

// KVKK / GDPR — VERİ İNDİRME.
//
// Tasarım AKIŞ 11: "Gizlilik → Belge → Veri İndir → Hesap Silme".
//
// Yasal zorunluluk: KVKK md. 11 kullanıcıya kendi verisine erişme hakkı
// veriyor. App Store Review Guideline 5.1.1(v) de hesap silme sunan
// uygulamalardan veri erişimi bekliyor. Hesap silme zaten var
// (delete_own_account RPC), veri indirme yoktu.
//
// TASARIM KARARI: sunucuda bir "export" işi kurmuyoruz. Kullanıcının kendi
// verisi zaten RLS ile korunuyor ve istemciden okunabiliyor; ek bir Edge
// Function ya da zamanlanmış iş, bakımı olan yeni bir yüzey demek.

const PROFILE_EXPORT_SPEC = { table: "profiles", label: "Profil" };

// Dışa aktarılacak tablolar. Her biri user_id ile filtreleniyor;
// RLS zaten bunu zorunlu kılıyor ama açıkça yazmak niyeti belli ediyor.
const EXPORT_TABLES = [
  // profiles ARTIK doğrudan okunmuyor: sütun SELECT izni id/name/avatar_url ile
  // sınırlı (profil sızıntısı düzeltmesi). Kendi tam profilimiz definer RPC'den
  // geliyor; aşağıda ayrıca ekleniyor.
  { table: "study_logs", column: "user_id", label: "Çalışma kayıtları" },
  { table: "trials", column: "user_id", label: "Deneme sonuçları" },
  // SIRA ÖNEMLİ: trial_subjects'in user_id'si yok, kullanıcının denemeleri
  // üzerinden çekiliyor. Bu yüzden "trials"tan SONRA gelmeli.
  { table: "trial_subjects", column: null, label: "Deneme ders detayları" },
  { table: "wrong_questions", column: "user_id", label: "Yanlış defteri" },
  { table: "topic_progress", column: "user_id", label: "Konu ilerlemesi" },
  { table: "topic_notes", column: "user_id", label: "Konu notları" },
  { table: "user_tasks", column: "user_id", label: "Plan durakları" },
  { table: "streaks", column: "user_id", label: "Seri" },
  { table: "xp_events", column: "user_id", label: "XP geçmişi" },
  { table: "route_weeks", column: "user_id", label: "Rota planı" },
  { table: "route_revisions", column: "user_id", label: "Rota revizyonları" },
  { table: "route_stops", column: "user_id", label: "Rota durakları" },
  { table: "route_stop_events", column: "user_id", label: "Rota durak geçmişi" },
  { table: "shared_questions", column: "user_id", label: "Paylaştığın sorular" },
  { table: "question_answers", column: "user_id", label: "Yazdığın cevaplar" },
  { table: "retention_events", column: "user_id", label: "Uygulama içi olaylar" },

  // KVKK/GDPR çıktısı "tüm verilerim" iddiasında bulunduğu için aşağıdakiler de
  // dahil olmalı; eskiden listede yoktular ve export eksik kalıyordu.
  { table: "daily_plans", column: "user_id", label: "Günlük planlar" },
  { table: "plan_tasks", column: "user_id", label: "Plan görevleri" },
  { table: "friendships", column: null, label: "Arkadaşlıklar" },
  { table: "challenges", column: null, label: "Meydan okumalar" },
  { table: "group_members", column: "user_id", label: "Grup üyelikleri" },
  { table: "referral_logs", column: null, label: "Davet kayıtları" },
  { table: "route_state", column: "user_id", label: "Rota durumu" },
  { table: "analytics_events", column: "user_id", label: "Analitik olayları" },
];

const PAGE = 1000;

/** Bir tablonun tamamını sayfalayarak çeker. */
async function fetchAll(table, column, userId) {
  const rows = [];
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await supabase
      .from(table)
      .select("*")
      .eq(column, userId)
      .range(from, from + PAGE - 1);
    if (error) throw error;
    const page = data || [];
    rows.push(...page);
    if (page.length < PAGE) break;
  }
  return rows;
}

/**
 * Kullanıcının tüm verisini toplar.
 *
 * @param onProgress (done, total, label) — uzun sürebilir, ilerleme bildir
 * @returns { export: {...}, errors: [] }
 */
/** Kendi tam profili — sütun izniyle değil definer RPC ile. */
async function fetchMyProfileRow() {
  const { data, error } = await supabase.rpc("get_my_profile");
  if (error) throw error;
  return data ? [data] : [];
}

export async function collectUserData(userId, onProgress) {
  if (!userId || userId === "dev") return null;

  const result = {
    meta: {
      exportedAt: new Date().toISOString(),
      userId,
      format: "maraton-export-v1",
      note: "Bu dosya Maraton uygulamasındaki kişisel verilerinin tamamını içerir.",
    },
    data: {},
  };
  const errors = [];
  const total = EXPORT_TABLES.length + 1;
  let done = 0;

  try {
    result.data.profiles = await fetchMyProfileRow();
  } catch (e) {
    errors.push({ table: "profiles", label: "Profil", message: e?.message || "okunamadı" });
    result.data.profiles = null;
  }
  done += 1;
  onProgress?.(done, total, "Profil");

  for (const spec of EXPORT_TABLES) {
    try {
      if (spec.table === "friendships") {
        // İki yönlü: kullanıcı hem isteyen hem istenen olabilir.
        const { data, error } = await supabase
          .from("friendships").select("*")
          .or(`requester_id.eq.${userId},addressee_id.eq.${userId}`);
        if (error) throw error;
        result.data.friendships = data || [];
      } else if (spec.table === "challenges") {
        const { data, error } = await supabase
          .from("challenges").select("*")
          .or(`creator_id.eq.${userId},opponent_id.eq.${userId}`);
        if (error) throw error;
        result.data.challenges = data || [];
      } else if (spec.table === "referral_logs") {
        const { data, error } = await supabase
          .from("referral_logs").select("*")
          .or(`inviter_id.eq.${userId},invitee_id.eq.${userId}`);
        if (error) throw error;
        result.data.referral_logs = data || [];
      } else if (spec.table === "trial_subjects") {
        // Doğrudan user_id yok; kullanıcının denemeleri üzerinden.
        const trialIds = (result.data.trials || []).map((t) => t.id);
        if (trialIds.length) {
          const { data, error } = await supabase
            .from("trial_subjects")
            .select("*")
            .in("trial_id", trialIds);
          if (error) throw error;
          result.data.trial_subjects = data || [];
        } else {
          result.data.trial_subjects = [];
        }
      } else {
        result.data[spec.table] = await fetchAll(spec.table, spec.column, userId);
      }
    } catch (e) {
      // Bir tablo alınamazsa dışa aktarma TAMAMEN başarısız olmasın;
      // eksik olanı dosyaya not düş.
      errors.push({ table: spec.table, label: spec.label, message: e?.message || "okunamadı" });
      result.data[spec.table] = null;
    }
    done += 1;
    onProgress?.(done, total, spec.label);
  }

  if (errors.length) result.meta.incomplete = errors;

  return { export: result, errors };
}

/** Özet — kullanıcıya "ne indiriyorsun" demek için. */
export function summarizeExport(exportData) {
  if (!exportData?.data) return [];
  return [PROFILE_EXPORT_SPEC, ...EXPORT_TABLES].map((spec) => {
    const rows = exportData.data[spec.table];
    return {
      label: spec.label,
      count: Array.isArray(rows) ? rows.length : null,
      failed: rows === null,
    };
  }).filter((r) => r.failed || (r.count || 0) > 0);
}

/**
 * Dosyaya yazıp paylaşım sayfasını açar.
 *
 * expo-file-system PROJEDE KURULU DEĞİL (native modül, eklemek yeni build
 * gerektirir). Bu yüzden dinamik require ile deneniyor — kod tabanında
 * ShareCardScreen de aynı deseni kullanıyor. Yoksa metin olarak paylaşılır.
 *
 * @returns { ok, method } method: "file" | "text" | null
 */
export async function deliverExport(exportData, { fileName } = {}) {
  const json = JSON.stringify(exportData, null, 2);
  const name = fileName || `maraton-verilerim-${new Date().toISOString().slice(0, 10)}.json`;

  let FileSystem = null;
  let Sharing = null;
  try { FileSystem = require("expo-file-system"); } catch (_) {}
  try { Sharing = require("expo-sharing"); } catch (_) {}

  if (FileSystem && Sharing) {
    try {
      const dir = FileSystem.cacheDirectory || FileSystem.documentDirectory;
      const uri = `${dir}${name}`;
      await FileSystem.writeAsStringAsync(uri, json, { encoding: "utf8" });
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          mimeType: "application/json",
          dialogTitle: "Verilerini kaydet",
          UTI: "public.json",
        });
        return { ok: true, method: "file" };
      }
    } catch (_) {
      // metin yoluna düş
    }
  }

  // Yedek: dosya yazamıyorsak metin olarak paylaş.
  try {
    const { Share } = require("react-native");
    await Share.share({ message: json, title: name });
    return { ok: true, method: "text" };
  } catch (_) {
    return { ok: false, method: null };
  }
}
