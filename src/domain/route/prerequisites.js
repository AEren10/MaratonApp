// ON KOSUL ZINCIRLERI -- yalniz GERCEK bagimliliklar.
//
// Eskiden bir konudan once gelen TUM konular on kosul sayiliyordu
// (mufredat sirasi). Hic kaydi olmayan ogrencide her ders bastan sona
// sirayla aciliyordu: "Problemler (Yas)" icin "Katı Cisimler"i beklemek
// gibi. YKS ogrencisi TYT konularinin cogunu okulda gormustur; sirayi
// dayatmak yerine yalniz birbirine gercekten dayanan konular zincirlenir
// (Uslu -> Koklu, Limit -> Turev -> Integral). Zincirde olmayan konu
// hicbir seyi beklemez; sirasini getirisi ve zayifligi belirler.
//
// Referans "ders:Konu" bicimindeyse baska dersin konusudur (AYT -> TYT).

const PROBLEM_BASE = ["1. Dereceden Denklemler"];

const TYT_MAT = {
  "Sayı Basamakları": ["Temel Kavramlar"],
  "Bölme ve Bölünebilme": ["Temel Kavramlar"],
  "EBOB - EKOK": ["Bölme ve Bölünebilme"],
  "Rasyonel Sayılar": ["Temel Kavramlar"],
  "Ondalık Sayılar": ["Rasyonel Sayılar"],
  "Mutlak Değer": ["Basit Eşitsizlikler"],
  "Köklü Sayılar": ["Üslü Sayılar"],
  "Çarpanlara Ayırma": ["Üslü Sayılar"],
  "1. Dereceden Denklemler": ["Temel Kavramlar"],
  "Problemler (Dört İşlem)": PROBLEM_BASE,
  "Problemler (Kesir)": [...PROBLEM_BASE, "Rasyonel Sayılar"],
  "Problemler (Yüzde)": [...PROBLEM_BASE, "Oran - Orantı"],
  "Problemler (Kar-Zarar)": ["Problemler (Yüzde)"],
  "Problemler (Hız)": [...PROBLEM_BASE, "Oran - Orantı"],
  "Problemler (İşçi)": [...PROBLEM_BASE, "Oran - Orantı"],
  "Problemler (Yaş)": PROBLEM_BASE,
  "Problemler (Sayı)": PROBLEM_BASE,
  "Olasılık": ["Permütasyon - Kombinasyon"],
  "Eşkenar ve İkizkenar Üçgen": ["Üçgenler"],
  "Dik Üçgen ve Pisagor": ["Üçgenler"],
  "Açı-Kenar Bağıntıları": ["Üçgenler"],
  "Üçgende Alan": ["Dik Üçgen ve Pisagor"],
  "Çokgenler": ["Üçgenler"],
  "Dörtgenler (Paralelkenar, Yamuk)": ["Üçgenler"],
  "Dikdörtgen ve Kare": ["Üçgenler"],
  "Çember ve Daire": ["Üçgenler"],
  "Katı Cisimler (Prizma, Silindir, Koni, Küre)": ["Dikdörtgen ve Kare", "Çember ve Daire"],
};

const AYT_MAT = {
  "Fonksiyonlar": ["matematik:Fonksiyonlar"],
  "Polinomlar": ["matematik:Çarpanlara Ayırma"],
  "2. Dereceden Denklemler": ["matematik:Çarpanlara Ayırma"],
  "Parabol": ["2. Dereceden Denklemler"],
  "Eşitsizlikler": ["2. Dereceden Denklemler"],
  "Trigonometri (Dönüşüm Formülleri)": ["Trigonometri (Temel)"],
  "Trigonometri (Toplam-Fark)": ["Trigonometri (Temel)"],
  "Karmaşık Sayılar": ["2. Dereceden Denklemler"],
  "Logaritma": ["matematik:Üslü Sayılar", "Fonksiyonlar"],
  "Limit": ["Fonksiyonlar"],
  "Türev (Kavram)": ["Limit"],
  "Türev (Uygulamalar)": ["Türev (Kavram)"],
  "Türev (Maks-Min Problemleri)": ["Türev (Uygulamalar)"],
  "İntegral (Belirsiz)": ["Türev (Kavram)"],
  "İntegral (Belirli)": ["İntegral (Belirsiz)"],
  "İntegral (Alan-Hacim)": ["İntegral (Belirli)"],
  "Analitik Geometri (Çember)": ["Analitik Geometri (Doğru)"],
};

// EA matematik mufredatinda sayisala ozgu konular yok.
const SAY_ONLY = new Set([
  "Trigonometri (Toplam-Fark)", "Türev (Maks-Min Problemleri)", "İntegral (Alan-Hacim)",
]);
const AYT_EA_MAT = Object.fromEntries(Object.entries(AYT_MAT).filter(([topic]) => !SAY_ONLY.has(topic)));

export const PREREQUISITES = {
  matematik: TYT_MAT,
  ayt_matematik: AYT_MAT,
  ayt_ea_matematik: AYT_EA_MAT,
  turkce: {
    "Söz Yorumu": ["Sözcükte Anlam"],
    "Cümle Yorumu": ["Cümlede Anlam"],
    "Paragraf (Ana Düşünce)": ["Cümlede Anlam"],
    "Paragraf (Yardımcı Düşünce)": ["Paragraf (Ana Düşünce)"],
    "Paragraf (Yapı)": ["Paragraf (Ana Düşünce)"],
    "Fiil Çekimleri": ["Sözcük Türleri"],
    "Cümlenin Ögeleri": ["Sözcük Türleri"],
    "Cümle Türleri": ["Cümlenin Ögeleri"],
    "Anlatım Bozuklukları": ["Cümlenin Ögeleri"],
  },
  fizik: {
    "Basınç": ["Madde ve Özellikleri"],
    "Sıvıların Kaldırma Kuvveti": ["Basınç"],
    "Elektrik Akımı": ["Elektrostatik"],
    "Manyetizma": ["Elektrik Akımı"],
  },
  ayt_fizik: {
    "Kuvvet ve Hareket": ["Vektörler"],
    "Newton'un Hareket Yasaları": ["Kuvvet ve Hareket"],
    "Enerji ve Momentum": ["Newton'un Hareket Yasaları"],
    "Tork ve Denge": ["Vektörler"],
    "Düzgün Çembersel Hareket": ["Newton'un Hareket Yasaları"],
    "Basit Harmonik Hareket": ["Düzgün Çembersel Hareket"],
    "Manyetik Alan ve Kuvvet": ["Elektrik Alan ve Potansiyel"],
    "Elektromanyetik İndüksiyon": ["Manyetik Alan ve Kuvvet"],
    "Alternatif Akım": ["Elektromanyetik İndüksiyon"],
    "Atom Fiziği ve Radyoaktivite": ["Modern Fizik"],
  },
  kimya: {
    "Kimyasal Türler Arası Etkileşimler": ["Atom ve Periyodik Sistem"],
    "Kimyasal Tepkimeler": ["Atom ve Periyodik Sistem"],
  },
  ayt_kimya: {
    "Kimyasal Hesaplamalar": ["Mol Kavramı"],
    "Gazlar": ["Mol Kavramı"],
    "Çözeltiler ve Derişim": ["Mol Kavramı"],
    "Tepkime Hızları": ["Kimyasal Tepkimelerde Enerji"],
    "Kimyasal Denge": ["Tepkime Hızları"],
    "Asitler ve Bazlar": ["Kimyasal Denge"],
    "Çözünürlük Dengesi": ["Kimyasal Denge"],
    "Organik Kimya (Fonksiyonel Gruplar)": ["Organik Kimya (Temel)"],
    "Organik Kimya (Tepkimeler)": ["Organik Kimya (Fonksiyonel Gruplar)"],
  },
  biyoloji: {
    "Mitoz ve Eşeysiz Üreme": ["Hücre"],
    "Mayoz ve Eşeyli Üreme": ["Mitoz ve Eşeysiz Üreme"],
    "Kalıtım": ["Mayoz ve Eşeyli Üreme"],
  },
  ayt_biyoloji: {
    "Fotosentez": ["Enzimler"],
    "Kemosentez": ["Enzimler"],
    "Hücresel Solunum": ["Enzimler"],
    "Genetik Mühendisliği ve Biyoteknoloji": ["Nükleik Asitler ve Protein Sentezi"],
  },
};

// Bir on kosul "hazir" sayilir: en az 10 soru cozulmus. Tek bir deneme
// sorusu konuyu bildigini gostermez; 10 soru okulda gormus ogrencinin
// hizla gecebilecegi kadar.
const READY_QUESTIONS = 10;

/** Konunun henuz hazir olmayan dogrudan on kosullari. */
export function missingPrerequisites(subjectKey, topic, progressByKey = {}) {
  const list = PREREQUISITES[subjectKey]?.[topic] || [];
  return list.filter((ref) => {
    const [refSubject, refTopic] = ref.includes(":") ? ref.split(":") : [subjectKey, ref];
    const q = Number(progressByKey?.[refSubject]?.[refTopic]?.total_questions) || 0;
    return q < READY_QUESTIONS;
  });
}
