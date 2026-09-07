import { supabase } from "./client";
import { handleSupabaseError } from "./handleError";

// Seviye testi sonucunun kalıcılığı.
//
// Sonuç `topic_progress`'e yazılır — böylece rota motoru (routeEngine) onu
// normal ilerleme gibi okur ve öğrenci sıfırdan değil, bulunduğu yerden
// başlar. Ayrı bir tablo AÇMIYORUZ: rota, ustalık ve analiz zaten
// topic_progress okuyor; ikinci bir kaynak eklemek hepsini bozar.
//
// DİKKAT — çift satır tuzağı: topic_progress'te iki KISMİ unique indeks var:
//   idx_tp_user_topic   (user_id, topic_id)      WHERE topic_id IS NOT NULL
//   idx_tp_user_custom  (user_id, subject_key, custom_topic) WHERE custom_topic IS NOT NULL
// Seviye testini custom_topic yoluna yazarsak, kullanıcı sonra aynı konuya
// normal çalışınca topic_id yoluyla İKİNCİ bir satır açılır ve ilerleme
// bölünür. Bu yüzden önce konu adı topics tablosundan çözülür; ancak
// bulunamazsa custom_topic'e düşülür.

/** Konu adlarını topics tablosundaki id'lere çözer. */
async function resolveTopicIds(subjectKeys) {
  const map = {}; // "subjectKey:topicName" -> topicId
  if (!subjectKeys.length) return map;
  try {
    const { data: subjects, error: sErr } = await supabase
      .from("subjects")
      .select("id, key")
      .in("key", subjectKeys);
    if (sErr) throw sErr;
    if (!subjects?.length) return map;

    const byId = {};
    subjects.forEach((s) => { byId[s.id] = s.key; });

    const { data: topics, error: tErr } = await supabase
      .from("topics")
      .select("id, name, subject_id")
      .in("subject_id", subjects.map((s) => s.id));
    if (tErr) throw tErr;

    for (const t of topics || []) {
      const key = byId[t.subject_id];
      if (key) map[`${key}:${t.name}`] = t.id;
    }
  } catch (e) {
    // Çözemezsek custom_topic yoluna düşeriz — veri kaybı olmaz.
    handleSupabaseError(e, "resolveTopicIds");
  }
  return map;
}

/**
 * Seviye testi tahminlerini kaydeder.
 *
 * ÜZERİNE YAZMAZ: kullanıcının gerçek çalışma verisi varsa ona dokunulmaz.
 * Seviye testi bir başlangıç tahminidir; ölçülmüş veriyi ezmesi kabul edilemez.
 *
 * @param estimates buildPlacementEstimates() çıktısı
 * @returns { inserted, skipped }
 */
export async function savePlacementEstimates(userId, estimates = []) {
  if (!userId || userId === "dev" || !estimates.length) {
    return { inserted: 0, skipped: 0 };
  }

  try {
    const subjectKeys = [...new Set(estimates.map((e) => e.subjectKey))];
    const topicIdMap = await resolveTopicIds(subjectKeys);

    // Mevcut ilerlemeyi çek — gerçek veriyi ezmemek için.
    const { data: existing, error: exErr } = await supabase
      .from("topic_progress")
      .select("topic_id, subject_key, custom_topic, total_questions")
      .eq("user_id", userId);
    if (exErr) throw exErr;

    const hasProgress = new Set();
    for (const row of existing || []) {
      if (row.topic_id) hasProgress.add(`id:${row.topic_id}`);
      if (row.custom_topic) hasProgress.add(`custom:${row.subject_key}:${row.custom_topic}`);
    }

    const withId = [];
    const withCustom = [];
    let skipped = 0;

    for (const e of estimates) {
      const topicId = topicIdMap[`${e.subjectKey}:${e.topic}`];
      const marker = topicId
        ? `id:${topicId}`
        : `custom:${e.subjectKey}:${e.topic}`;

      // Zaten ilerlemesi olan konuya dokunma.
      if (hasProgress.has(marker)) { skipped += 1; continue; }

      const base = {
        user_id: userId,
        subject_key: e.subjectKey,
        total_questions: e.estimatedQuestions,
        correct_count: e.estimatedCorrect,
        study_count: 0,
        total_minutes: 0,
      };

      if (topicId) withId.push({ ...base, topic_id: topicId, custom_topic: null });
      else withCustom.push({ ...base, topic_id: null, custom_topic: e.topic });
    }

    // DÜZ INSERT — upsert DEĞİL.
    //
    // topic_progress'teki iki unique indeks de KISMİ:
    //   idx_tp_user_topic  ... WHERE topic_id IS NOT NULL
    //   idx_tp_user_custom ... WHERE custom_topic IS NOT NULL
    // PostgREST `on_conflict` ile predicate gönderemez, Postgres de kısmi
    // indeksi predicate olmadan eşleştiremez. Canlıda doğrulandı:
    //   ERROR 42P10: there is no unique or exclusion constraint matching
    //                the ON CONFLICT specification
    // Yani upsert HER ZAMAN hata veriyordu ve hata yutulduğu için seviye
    // testi sonucu sessizce kayboluyordu.
    //
    // Mevcut satırlar zaten yukarıda `hasProgress` ile elendiği için çakışma
    // beklenmiyor; yine de yarış durumunda gelen 23505 (unique ihlali)
    // görmezden geliniyor — o konunun zaten ilerlemesi var demektir.
    const insertChunk = async (rows) => {
      if (!rows.length) return 0;
      const { error } = await supabase.from("topic_progress").insert(rows);
      if (error) {
        if (error.code === "23505") return rows.length; // zaten var, sorun değil
        throw error;
      }
      return rows.length;
    };

    let inserted = 0;
    inserted += await insertChunk(withId);
    inserted += await insertChunk(withCustom);

    return { inserted, skipped };
  } catch (e) {
    handleSupabaseError(e, "savePlacementEstimates");
    return { inserted: 0, skipped: 0, error: e };
  }
}

/** Seviye testi daha önce yapılmış mı — onboarding'de tekrar sormamak için. */
export async function hasPlacementData(userId) {
  if (!userId || userId === "dev") return false;
  try {
    const { count, error } = await supabase
      .from("topic_progress")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId);
    if (error) throw error;
    return (count || 0) > 0;
  } catch (e) {
    handleSupabaseError(e, "hasPlacementData");
    return false;
  }
}
