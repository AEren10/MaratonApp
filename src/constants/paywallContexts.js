// PAYWALL BAGLAMLARI — tasarimdaki "Paywall · ..." artboardlarindan BIREBIR.
//
// Tasarim tek bir paywall degil, GELDIGIN ISE gore degisen bir ekran
// tanimliyor: ustte nereden geldigin, ortada "BU IS ICIN" o isin ne
// actigi, altta "UCRETSIZDE ACIK KALIR" neyi KAYBETMEDIGIN.
//
// Son bolum bilincli bir durustluk hamlesi: paywall kullaniciyi kayip
// korkusuyla sikistirmiyor, ucretsiz cekirdegin yerinde durdugunu
// soyluyor. Metinler urun sozu, degistirilmemeli.
//
// `feature`: sunucudaki ozellik anahtari (src/constants/premium.js).
// Anahtari olmayan baglam eklenirse canAccessProductFeature fail-closed
// calistigi icin ozellik premium kullanicida da kapali kalir.

export const PAYWALL_CONTEXTS = {
  trial_compare: {
    eyebrow: "DENEME KAYITLARI",
    title: "İki denemeyi yan yana koy",
    feature: "trial_compare",
    lead: "Bu karşılaştırmayı aç",
    body:
      "İki denemeyi yan yana koymak, ders bazlı farkı ve zaman dağılımını " +
      "görmeni sağlar.",
    unlocks: [
      "Seçtiğin iki denemenin ders bazlı farkı",
      "Süre, soru ve boş dağılımı yan yana",
      "Sınırsız deneme geçmişi",
    ],
    stayFree: [
      "Günlük duraklar ve çalışma takibi açık",
      "Yanlış defteri açık",
      "Mevcut kayıtların silinmez",
    ],
    primary: "Karşılaştırmayı aç",
    secondary: "Şimdi değil, listeye dön",
  },

  ocr: {
    eyebrow: "DENEME EKLE",
    title: "Sonuç kâğıdını okut",
    feature: "ocr",
    lead: "Denemeni otomatik okut",
    body:
      "Sonuç kâğıdının fotoğrafını çek, dersler ve netler tek tek yazmadan " +
      "forma düşsün.",
    unlocks: [
      "Fotoğraftan ders bazlı net okuma",
      "Okunan değerleri onaylayıp düzeltme",
      "Sınırsız otomatik okuma",
    ],
    stayFree: [
      "Elle deneme girişi her zaman açık",
      "İlk iki deneme ücretsiz",
      "Kaydettiğin denemeler silinmez",
    ],
    primary: "Okumayı aç",
    secondary: "Elle girmeye devam et",
  },

  topic_progress: {
    eyebrow: "ANALİZ · KONU İLERLEMESİ",
    title: "Öncelikli çalışma alanların",
    feature: "topic_progress",
    lead: "Daha fazla geçmişi incele",
    body:
      "Üç öncelikli alanı görüyorsun. Kalanlar ve önceki ayların kayıtları " +
      "Pro ile açılır.",
    unlocks: [
      "Öncelikli çalışma alanlarının tamamı",
      "Ayda dörtten fazla deneme kaydı",
      "Tüm geçmiş aylara erişim",
    ],
    stayFree: [
      "İlk üç öncelikli alan açık",
      "Ayda 4 deneme kaydı ücretsiz",
      "Yanlış defteri ve çalışma takibi açık",
    ],
    primary: "Tümünü aç",
    secondary: "Şimdi değil",
  },

  monthly_report: {
    eyebrow: "HAFTALIK ÖZET",
    title: "Haftanın detaylı raporu",
    feature: "monthly_report",
    lead: "Bu raporu aç",
    body:
      "Haftalık ve aylık detaylı rapor, ders bazlı dağılım ve hedef bölüm " +
      "karşılaştırmasıyla gelir.",
    unlocks: [
      "Haftalık ve aylık detaylı rapor",
      "Ders bazlı süre ve soru dağılımı",
      "Hedef bölüm karşılaştırması",
    ],
    stayFree: [
      "Kısa haftalık özet her pazar gelir",
      "Günlük özet ve rota göstergeleri açık",
      "Mevcut kayıtların silinmez",
    ],
    primary: "Raporu aç",
    secondary: "Şimdi değil",
  },

  route_scenarios: {
    eyebrow: "ROTA DETAY",
    title: "Aynı hedef, üç tempo",
    feature: "route_scenarios",
    lead: "Rota senaryolarını gör",
    body:
      "Haftalık yükü artırıp azalttığında rotanın nasıl değiştiğini " +
      "karşılaştırmalı görürsün.",
    unlocks: [
      "Üç tempo senaryosu yan yana",
      "Haftalık yük ve durak sayısı değişimi",
      "Senaryoyu rotana uygulama",
    ],
    stayFree: [
      "Mevcut rotan ve tahminin açık",
      "Günlük duraklar ve çalışma takibi açık",
      "İlk iki deneme ücretsiz",
    ],
    primary: "Senaryoları aç",
    secondary: "Şimdi değil",
  },
};

// Tasarimin alt satiri, her baglamda ayni.
export const PAYWALL_FOOTNOTE =
  "Maraton önerir, karar senin · 7 gün ücretsiz, bitmeden iptal edersen ücret alınmaz";

export const PAYWALL_SECTION_LABELS = {
  unlocks: "BU İŞ İÇİN",
  stayFree: "ÜCRETSİZDE AÇIK KALIR",
};

/**
 * Cagri yerlerindeki serbest anahtarlari baglamlara esler.
 *
 * showPaywall("route_gate") gibi anahtarlar kodda zaten kullaniliyor;
 * karsiligi olmayan anahtar null doner ve ekran genel Premium icerigine
 * duser -- yanlis baglam gostermektense baglamsiz gostermek dogru.
 */
export function paywallContextFor(key) {
  if (!key) return null;
  if (PAYWALL_CONTEXTS[key]) return PAYWALL_CONTEXTS[key];
  const alias = {
    department_threshold: "topic_progress",
    analysis_exam_simulator: "route_scenarios",
    home_quick_simulator: "route_scenarios",
    route_gate: "route_scenarios",
    trial_entry_limit: "topic_progress",
  }[key];
  return alias ? PAYWALL_CONTEXTS[alias] : null;
}
