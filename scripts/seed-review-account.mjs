#!/usr/bin/env node
import { createClient } from "@supabase/supabase-js";

const DEMO_PREFIX = "appreview-demo:v1";
const SERVICE_KEY_ENV = "SUPABASE_SERVICE_ROLE_KEY";
const ALT_SERVICE_KEY_ENV = "SUPABASE_SERVICE_KEY";
const URL_ENV = "SUPABASE_URL";
const ALT_URL_ENV = "EXPO_PUBLIC_SUPABASE_URL";

function fail(message) {
  console.error(`\nHata: ${message}\n`);
  process.exit(1);
}

function todayUtc() {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}

function daysAgo(days) {
  const date = todayUtc();
  date.setUTCDate(date.getUTCDate() - days);
  return date.toISOString().slice(0, 10);
}

function daysAhead(days) {
  const date = todayUtc();
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function isoAtDaysAgo(days, hour = 9) {
  const date = todayUtc();
  date.setUTCDate(date.getUTCDate() - days);
  date.setUTCHours(hour, 0, 0, 0);
  return date.toISOString();
}

function parseArgs(argv) {
  const email = argv.find((arg) => !arg.startsWith("--"));
  if (!email || !email.includes("@")) {
    fail("Kullanım: SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node scripts/seed-review-account.mjs review@example.com");
  }
  return { email: email.trim().toLowerCase() };
}

function requireEnv(name, altName = null) {
  const value = process.env[name] || (altName ? process.env[altName] : "");
  if (!value) {
    fail(`${name}${altName ? ` veya ${altName}` : ""} ortam değişkeni eksik.`);
  }
  return value;
}

async function findUserByEmail(client, email) {
  const perPage = 1000;
  for (let page = 1; page <= 20; page += 1) {
    const { data, error } = await client.auth.admin.listUsers({ page, perPage });
    if (error) throw error;
    const users = data?.users || [];
    const found = users.find((user) => user.email?.toLowerCase() === email);
    if (found) return found;
    if (users.length < perPage) break;
  }
  return null;
}

function opId(kind, id) {
  return `${DEMO_PREFIX}:${kind}:${id}`;
}

function netOf(subjects) {
  return subjects.reduce((sum, row) => sum + row.correct_count - row.wrong_count * (row.wrong_penalty ?? 0.25), 0);
}

function withEmpty(subjects) {
  return subjects.map((row) => ({
    ...row,
    empty_count: Math.max(0, row.max - row.correct_count - row.wrong_count),
    wrong_penalty: row.wrong_penalty ?? 0.25,
  }));
}

async function deleteByDemoPrefix(client, table, userId) {
  const { error } = await client
    .from(table)
    .delete()
    .eq("user_id", userId)
    .like("client_operation_id", `${DEMO_PREFIX}:%`);
  if (error) throw error;
}

async function cleanupExistingSeed(client, userId) {
  const { data: trials, error: trialSelectError } = await client
    .from("trials")
    .select("id")
    .eq("user_id", userId)
    .like("client_operation_id", `${DEMO_PREFIX}:%`);
  if (trialSelectError) throw trialSelectError;

  const trialIds = (trials || []).map((row) => row.id);
  if (trialIds.length > 0) {
    const { error: subjectDeleteError } = await client
      .from("trial_subjects")
      .delete()
      .in("trial_id", trialIds);
    if (subjectDeleteError) throw subjectDeleteError;
  }

  await deleteByDemoPrefix(client, "trials", userId);
  await deleteByDemoPrefix(client, "study_logs", userId);
  await deleteByDemoPrefix(client, "wrong_questions", userId);
}

async function seedProfile(client, userId) {
  const { error } = await client
    .from("profiles")
    .update({
      exam_type: "tyt_ayt",
      field: "sayisal",
      exam_date: daysAhead(260),
      target_net: 100,
      baseline_net: 62,
      daily_target: 120,
      daily_question_goal: 160,
      weekly_trials_goal: 2,
      weekly_minutes_goal: 900,
    })
    .eq("id", userId);
  if (error) throw error;
}

async function seedTrials(client, userId) {
  const trialDefs = [
    {
      id: "tyt-1",
      name: "TYT Genel Deneme 1",
      trial_date: daysAgo(39),
      exam_type: "TYT",
      field: null,
      mood: "okay",
      subjects: withEmpty([
        { subject: "tyt_turkce", max: 40, correct_count: 27, wrong_count: 8 },
        { subject: "tyt_matematik", max: 40, correct_count: 18, wrong_count: 10 },
        { subject: "tyt_fen", max: 20, correct_count: 9, wrong_count: 5 },
        { subject: "tyt_sosyal", max: 20, correct_count: 13, wrong_count: 4 },
      ]),
    },
    {
      id: "ayt-1",
      name: "AYT Sayısal Deneme 1",
      trial_date: daysAgo(32),
      exam_type: "AYT_SAY",
      field: "sayisal",
      mood: "okay",
      subjects: withEmpty([
        { subject: "ayt_matematik", max: 40, correct_count: 20, wrong_count: 8 },
        { subject: "ayt_fizik", max: 14, correct_count: 7, wrong_count: 3 },
        { subject: "ayt_kimya", max: 13, correct_count: 7, wrong_count: 2 },
        { subject: "ayt_biyoloji", max: 13, correct_count: 8, wrong_count: 2 },
      ]),
    },
    {
      id: "tyt-2",
      name: "TYT Genel Deneme 2",
      trial_date: daysAgo(25),
      exam_type: "TYT",
      field: null,
      mood: "good",
      subjects: withEmpty([
        { subject: "tyt_turkce", max: 40, correct_count: 30, wrong_count: 6 },
        { subject: "tyt_matematik", max: 40, correct_count: 22, wrong_count: 8 },
        { subject: "tyt_fen", max: 20, correct_count: 11, wrong_count: 4 },
        { subject: "tyt_sosyal", max: 20, correct_count: 15, wrong_count: 3 },
      ]),
    },
    {
      id: "tyt-3",
      name: "TYT Genel Deneme 3",
      trial_date: daysAgo(11),
      exam_type: "TYT",
      field: null,
      mood: "good",
      subjects: withEmpty([
        { subject: "tyt_turkce", max: 40, correct_count: 32, wrong_count: 5 },
        { subject: "tyt_matematik", max: 40, correct_count: 25, wrong_count: 7 },
        { subject: "tyt_fen", max: 20, correct_count: 13, wrong_count: 3 },
        { subject: "tyt_sosyal", max: 20, correct_count: 16, wrong_count: 2 },
      ]),
    },
    {
      id: "ayt-2",
      name: "AYT Sayısal Deneme 2",
      trial_date: daysAgo(8),
      exam_type: "AYT_SAY",
      field: "sayisal",
      mood: "good",
      subjects: withEmpty([
        { subject: "ayt_matematik", max: 40, correct_count: 27, wrong_count: 6 },
        { subject: "ayt_fizik", max: 14, correct_count: 9, wrong_count: 2 },
        { subject: "ayt_kimya", max: 13, correct_count: 9, wrong_count: 1 },
        { subject: "ayt_biyoloji", max: 13, correct_count: 9, wrong_count: 2 },
      ]),
    },
  ];

  for (const trial of trialDefs) {
    const totalNet = Number(netOf(trial.subjects).toFixed(2));
    const { data, error } = await client
      .from("trials")
      .insert({
        user_id: userId,
        name: trial.name,
        trial_date: trial.trial_date,
        exam_type: trial.exam_type,
        field: trial.field,
        total_net: totalNet,
        mood: trial.mood,
        client_operation_id: opId("trial", trial.id),
        difficulty_level: "standard",
        difficulty_multiplier: 1,
        normalization_version: 1,
        normalization_confidence: "self_reported",
        raw_total_net: totalNet,
        normalized_total_net: totalNet,
      })
      .select("id")
      .single();
    if (error) throw error;

    const { error: subjectError } = await client.from("trial_subjects").insert(
      trial.subjects.map((subject) => ({
        trial_id: data.id,
        subject: subject.subject,
        correct_count: subject.correct_count,
        wrong_count: subject.wrong_count,
        empty_count: subject.empty_count,
        wrong_penalty: subject.wrong_penalty,
      })),
    );
    if (subjectError) throw subjectError;
  }

  return trialDefs.length;
}

async function seedStudyLogs(client, userId) {
  const rows = [
    ["tyt_turkce", "Paragraf", 42, 34, 55, 13, "Paragrafta hız iyi, dikkat hatası kaldı."],
    ["tyt_matematik", "Problemler", 36, 25, 70, 12, "Yaş ve yüzde problemleri tekrar edildi."],
    ["ayt_matematik", "Fonksiyonlar", 30, 22, 65, 11, "Bileşke fonksiyon soruları çözüldü."],
    ["tyt_fen", "Hücre", 22, 17, 40, 10, "Biyoloji konu özeti + test."],
    ["ayt_fizik", "Elektrik", 24, 0, 50, 9, "Konu anlatımı, doğru sayısı girilmedi."],
    ["tyt_sosyal", "Tarih", 28, 21, 45, 8, "İnkılap tekrar testi."],
    ["ayt_kimya", "Kimyasal Tepkimeler", 26, 20, 55, 6, "Denge sorularında gelişme var."],
    ["tyt_matematik", "Temel Kavramlar", 40, 31, 60, 5, "İşlem hataları not edildi."],
    ["ayt_biyoloji", "Kalıtım", 24, 18, 50, 4, "Çaprazlama soruları tekrar."],
    ["tyt_turkce", "Dil Bilgisi", 32, 24, 45, 3, "Fiilimsi ve cümle türleri."],
    ["ayt_matematik", "Türev", 34, 0, 75, 2, "Konu çalışma seansı."],
    ["tyt_fen", "Basınç", 25, 19, 45, 1, "Yanlışlar deftere aktarıldı."],
  ];

  const { error } = await client.from("study_logs").insert(
    rows.map(([subject, topic, question_count, correct_count, duration_minutes, days, note], index) => ({
      user_id: userId,
      subject,
      topic,
      question_count,
      correct_count,
      duration_minutes,
      note,
      notes: note,
      study_date: daysAgo(days),
      created_at: isoAtDaysAgo(days, 16),
      client_operation_id: opId("study", String(index + 1).padStart(2, "0")),
    })),
  );
  if (error) throw error;
  return rows.length;
}

async function seedWrongQuestions(client, userId) {
  const rows = [
    ["tyt_matematik", "Problemler", "Yaş probleminde oranı ters kurmuşum.", "B", "D", 5],
    ["tyt_turkce", "Paragraf", "Ana düşünce sorusunda çeldiriciye gittim.", "A", "C", 4],
    ["ayt_matematik", "Fonksiyonlar", "Tanım kümesini kontrol etmeden işlem yaptım.", "E", "B", 3],
    ["ayt_fizik", "Elektrik", "Eşdeğer dirençte paralel-seri ayrımına dikkat.", "C", "A", 2],
    ["ayt_kimya", "Kimyasal Denge", "Le Chatelier yorumunda sıcaklık etkisini karıştırdım.", "D", "E", 1],
    ["tyt_fen", "Basınç", "Sıvı basıncında derinlik dışındaki bilgiyi ele.", "A", "B", 0],
  ];

  const { error } = await client.from("wrong_questions").insert(
    rows.map(([subject, topic, note, my_answer, correct_answer, days], index) => ({
      user_id: userId,
      subject,
      topic,
      image_path: null,
      note,
      is_resolved: false,
      my_answer,
      correct_answer,
      next_review_at: isoAtDaysAgo(days, 8),
      interval_days: 1 + (index % 3),
      ease: 2.5,
      topic_source: "manual",
      client_operation_id: opId("wrong", String(index + 1).padStart(2, "0")),
    })),
  );
  if (error) throw error;
  return rows.length;
}

async function seedStreak(client, userId) {
  const { error } = await client.from("streaks").upsert(
    {
      user_id: userId,
      current_streak: 10,
      longest_streak: 12,
      last_study_date: daysAgo(1),
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" },
  );
  if (error) throw error;
}

async function main() {
  const { email } = parseArgs(process.argv.slice(2));
  const supabaseUrl = requireEnv(URL_ENV, ALT_URL_ENV);
  const serviceKey = requireEnv(SERVICE_KEY_ENV, ALT_SERVICE_KEY_ENV);
  const client = createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const user = await findUserByEmail(client, email);
  if (!user) {
    fail(`"${email}" e-postalı kullanıcı bulunamadı. Hesabı önce uygulamadan oluştur; bu betik hesap veya şifre üretmez.`);
  }

  await cleanupExistingSeed(client, user.id);
  await seedProfile(client, user.id);
  const trialCount = await seedTrials(client, user.id);
  const studyLogCount = await seedStudyLogs(client, user.id);
  const wrongCount = await seedWrongQuestions(client, user.id);
  await seedStreak(client, user.id);

  console.log("App Review demo verisi hazır.");
  console.log(`Kullanıcı: ${email}`);
  console.log(`Deneme: ${trialCount}`);
  console.log(`Çalışma kaydı: ${studyLogCount}`);
  console.log(`Yanlış defteri: ${wrongCount}`);
  console.log("Seri: 10 gün");
}

main().catch((error) => {
  console.error("\nSeed başarısız oldu.");
  console.error(error?.message || error);
  process.exit(1);
});
