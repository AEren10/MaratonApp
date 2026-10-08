// Kurulum bitti mi -- SUNUCUDAKI tek otorite. Migration eski setup bayragi,
// hedef neti veya calisma kaydi olan kullanicilari bu alana backfill eder.
// Hedef net tek basina artik tamamlanma sayilmaz: kullanici uygulamayi Hedef
// adimindan sonra kapatirsa yeniden giriste Seviye'den devam etmelidir.
export function serverSetupDone(p) {
  return !!p?.exam_type && p.onboarding_completed_at != null;
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
