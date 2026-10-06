// Kurulum bitti mi -- SUNUCUDAKI kalici veriden. Uygulama silinip kurulunca
// ya da yeni telefonda yerel bayrak yok; tek kaynak profil.
//
// gamification_stats.setup_completed tek basina guvenilmez: oyunlastirma
// senkronu (saveGamificationToSupabase) alani her kayitta Redux'taki haliyle
// BASTAN yaziyor ve bayrak siliniyordu. 16 kaydi olan kullaniciya yeniden
// kurulum, bildirim izni ve net soruldu (2026-10-04). Hedef net kurulumun
// zorunlu adimi (Hedef ekrani) -- yazildiysa kurulum bitmistir.
export function serverSetupDone(p) {
  if (!p?.exam_type) return false;
  if (p.gamification_stats?.setup_completed) return true;
  if (Number(p.study_session_count) > 0) return true;
  return p.target_net != null || p.target_net_tyt != null;
}

// YENI PROFIL HAZIR DOLU GELIR: veritabaninda exam_type varsayilani 'tyt',
// daily_question_goal varsayilani 100 (NOT NULL / default). Bu degerlerden
// "sinav secilmis, hedef girilmis" sonucu cikarilamaz (Merve, 6 Ekim: yeni
// hesap "Kaldigin yerden devam edelim" gordu, Hedef net isaretli gelince hedefi
// hic girmedi). Sinav secimi icin sinav TARIHI (yalniz secimle yazilir) ya da
// bitmis kurulum aranir; hedef icin net ya da siralama.
export function serverExamChosen(p) {
  return !!p?.exam_type && (p.exam_date != null || serverSetupDone(p));
}

export function serverGoalDone(p) {
  return p?.target_net != null || p?.target_net_tyt != null || !!p?.target_ranking;
}
