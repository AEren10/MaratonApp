export function buildCategoryOptions() {
  return [
    { id: "lgs", label: "LGS", desc: "Liselere Geçiş Sınavı (8. Sınıf)" },
    { id: "yks", label: "YKS", desc: "Yükseköğretim Kurumları Sınavı" },
  ];
}

export function buildYKSOptions() {
  return [
    { id: "tyt", examType: "tyt", field: null, label: "Sadece TYT", desc: "Temel Yeterlilik Testi" },
    { id: "ayt_say", examType: "tyt_ayt", field: "sayisal", label: "TYT + AYT Sayısal", desc: "Mühendislik, Tıp, Fen" },
    { id: "ayt_ea", examType: "tyt_ayt", field: "ea", label: "TYT + AYT Eşit Ağırlık", desc: "Hukuk, İşletme, Psikoloji" },
    { id: "ayt_soz", examType: "tyt_ayt", field: "sozel", label: "TYT + AYT Sözel", desc: "Edebiyat, Tarih, İlahiyat" },
    { id: "dil", examType: "dil", field: "dil", label: "YKS Dil", desc: "Yabancı Dil Testi" },
  ];
}

export function buildExamMonthOptions() {
  const now = new Date();
  const currentYear = now.getFullYear();
  const beforeExamThisYear = now.getMonth() < 5 || (now.getMonth() === 5 && now.getDate() < 20);
  const startYear = beforeExamThisYear ? currentYear : currentYear + 1;
  return [`Haziran ${startYear}`, `Haziran ${startYear + 1}`, `Haziran ${startYear + 2}`];
}

export const MONTHS = buildExamMonthOptions();
