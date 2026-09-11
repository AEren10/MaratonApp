// "Neye Gore Oneriyoruz" ekraninin metinleri — tasarimdan BIREBIR.
//
// Bu ekran rotanin neye dayandigini aciklar ve ozellikle NE YAPMADIGINI
// soyler: konu bazli net tahmini yapilmiyor. Metinler urun sozu niteliginde,
// degistirilmemeli -- degisirse kod da degismeli.

export const HOW_IT_WORKS = {
  eyebrow: "NASIL ÇALIŞIR",
  title: "Rotanı neye göre diziyoruz.",
  lede:
    "Dört kaynak var, hepsi senin kaydettiğin veri. Tahmin bir sihir değil; " +
    "aşağıdaki dört satırın toplamı.",

  sourcesLabel: "DÖRT KAYNAK",
  sources: [
    {
      key: "trials",
      eyebrow: "DENEMELER",
      title: "Denemelerden ders bazlı netleri alıyoruz.",
      body:
        "Türkçe, Matematik, Fen, Sosyal — dört ders neti ve zorluk katsayısı. " +
        "Konu bazlı doğru/yanlış bilgisi denemede yok.",
    },
    {
      key: "studyLogs",
      eyebrow: "ÇALIŞMA KAYITLARI",
      title: "Çalışma kayıtlarından konu ilerlemesini görüyoruz.",
      body:
        "Hangi konuya kaç dakika, kaç soru. Bir konuya on gündür " +
        "çalışmadıysan bunu buradan biliyoruz.",
    },
    {
      key: "wrongNotebook",
      eyebrow: "YANLIŞ DEFTERİ",
      title: "Yanlış defterinden tekrar ihtiyacını anlıyoruz.",
      body: "Hangi konudan kaç soru bekliyor, hangisi kaçıncı kez zorlandı.",
    },
    {
      key: "route",
      eyebrow: "ROTA İLERLEMESİ",
      title: "Rota bu verilerle yeniden sıralanıyor.",
      body:
        "Geride kalan duraklar öne alınır, haftalık yük yeniden dağıtılır. " +
        "Hedef değişmez.",
    },
  ],

  limitLabel: "YAPMADIĞIMIZ ŞEY",
  limitTitle: "Konu bazlı net tahmini yapmıyoruz.",
  // Kullandigimiz dil ornekleri.
  weSay: [
    "Ders neti trendi: “Matematik netin son denemelerde düştü.”",
    "Konu ilerlemesi: “Permütasyon rotanda geride kaldı.”",
  ],
  weDontSayLabel: "Kullanmadığımız dil:",
  weDontSay: "Permütasyondan 3 net kaybettin.",

  primary: "Anladım",
  secondary: "Verilerimi indir",
};
