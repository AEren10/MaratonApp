export const XP_REWARDS = {
  study_15min: 10,
  question_solved: 2,
  trial_entry: 50,
  wrong_resolved: 15,
  daily_login: 20,
  streak_bonus_per_day: 5,
  plan_task_done: 5,
  perfect_plan: 100,
  daily_goal_complete: 40,
  comeback_bonus: 50,
  referral_applied: 50,
  streak_milestone: 0,
};

export const LEVELS = [
  { level: 1, xp: 0, title: "Başlangıç" },
  { level: 2, xp: 100, title: "Çaylak" },
  { level: 3, xp: 300, title: "Öğrenci" },
  { level: 4, xp: 600, title: "Azimli" },
  { level: 5, xp: 1000, title: "Çalışkan" },
  { level: 6, xp: 1500, title: "Kararlı" },
  { level: 7, xp: 2200, title: "Odaklı" },
  { level: 8, xp: 3000, title: "Hırslı" },
  { level: 9, xp: 4000, title: "Disiplinli" },
  { level: 10, xp: 5200, title: "Savaşçı" },
  { level: 11, xp: 6500, title: "Uzman" },
  { level: 12, xp: 8000, title: "Usta" },
  { level: 13, xp: 10000, title: "Elit" },
  { level: 14, xp: 12500, title: "Efsane" },
  { level: 15, xp: 15500, title: "Maratoncu" },
  { level: 16, xp: 19000, title: "Titan" },
  { level: 17, xp: 23000, title: "Şampiyon" },
  { level: 18, xp: 28000, title: "Dahi" },
  { level: 19, xp: 34000, title: "Efsanevi" },
  { level: 20, xp: 42000, title: "YKS Tanrısı" },
];

export function getBadges(C) {
  return [
    { id: "streak_3", name: "3 Gün Seri", icon: "flame", color: C.accent, desc: "3 gün üst üste çalış", condition: { type: "streak", value: 3 } },
    { id: "questions_100", name: "Yüzlük", icon: "target", color: C.blue, desc: "100 soru çöz", condition: { type: "questions", value: 100 } },
    { id: "questions_500", name: "Beş Yüzlük", icon: "target", color: C.blue, desc: "500 soru çöz", condition: { type: "questions", value: 500 } },
    { id: "questions_1000", name: "Binyıldız", icon: "award", color: C.green, desc: "1000 soru çöz", condition: { type: "questions", value: 1000 } },
    { id: "trial_first", name: "İlk Deneme", icon: "chart", color: C.blue, desc: "İlk denemeni gir", condition: { type: "trials", value: 1 } },
    { id: "trial_5", name: "Deneyimli", icon: "chart", color: C.purple, desc: "5 deneme gir", condition: { type: "trials", value: 5 } },
    { id: "trial_10", name: "Deneme Ustası", icon: "chart", color: C.teal, desc: "10 deneme gir", condition: { type: "trials", value: 10 } },
    { id: "net_80", name: "80+ Net", icon: "trendUp", color: C.green, desc: "Bir denemede 80+ net yap", condition: { type: "max_net", value: 80 } },
    { id: "net_100", name: "Yüzlük Net", icon: "trendUp", color: "#FFD700", desc: "Bir denemede 100+ net yap", condition: { type: "max_net", value: 100 } },
    { id: "wrong_10", name: "Hata Avcısı", icon: "notebook", color: C.red, desc: "10 yanlışı çöz", condition: { type: "wrongs_resolved", value: 10 } },
    { id: "perfect_day", name: "Mükemmel Gün", icon: "checkCircle", color: C.green, desc: "Günlük planı %100 tamamla", condition: { type: "perfect_plan", value: 1 } },
    { id: "level_10", name: "Seviye 10", icon: "shield", color: C.accent, desc: "Seviye 10'a ulaş", condition: { type: "level", value: 10 } },
    { id: "streak_society_7", name: "Haftalık Savaşçı", icon: "flame", color: "#fb923c", desc: "7 gün seri yap", condition: { type: "streak", value: 7 } },
    { id: "streak_society_14", name: "İki Haftalık Efsane", icon: "zap", color: "#fbbf24", desc: "14 gün seri yap", condition: { type: "streak", value: 14 } },
    { id: "streak_society_30", name: "Aylık Titan", icon: "award", color: "#34d399", desc: "30 gün seri yap", condition: { type: "streak", value: 30 } },
    { id: "streak_society_60", name: "Çelik İrade", icon: "shield", color: "#60a5fa", desc: "60 gün seri yap", condition: { type: "streak", value: 60 } },
    { id: "streak_society_100", name: "Efsanevi Azim", icon: "crown", color: "#c084fc", desc: "100 gün seri yap", condition: { type: "streak", value: 100 } },
    { id: "streak_society_365", name: "Yıl Şampiyonu", icon: "trophy", color: "#f472b6", desc: "365 gün seri yap", condition: { type: "streak", value: 365 } },
  ];
}

export const LEAGUE_TIERS = [
  { key: "bronz", name: "Bronz Lig", icon: "shield", color: "#CD7F47", minRank: 0 },
  { key: "gumus", name: "Gümüş Lig", icon: "shield", color: "#C0C5CE", minRank: 100 },
  { key: "altin", name: "Altın Lig", icon: "shield", color: "#fbbf24", minRank: 500 },
  { key: "elmas", name: "Elmas Lig", icon: "shield", color: "#60a5fa", minRank: 2000 },
  { key: "obsidyen", name: "Obsidyen Lig", icon: "shield", color: "#c084fc", minRank: 5000 },
];
