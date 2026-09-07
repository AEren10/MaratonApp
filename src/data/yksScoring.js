// YKS PUAN SİSTEMİ — resmi kurallar ve kaynakları.
//
// ============================ KAYNAKLAR ============================
// [1] ÖSYM — Değerlendirme yöntemi (standart puan, ortalama, standart sapma)
//     https://www.osym.gov.tr/TR,2544/degerlendirme.html
// [2] ÖSYM — TYT-AYT Puan Hesaplama Kılavuzu (e-Devlet girişi ister)
//     https://ais.osym.gov.tr/Yetki/EDevletLogin?returnUrl=%2FTR%2FBelgeGoster%3Fbelge%3DTYT-AYT-PUAN-HESAPLAMA-KILAVUZU.pdf
// [3] YÖK Atlas — yerleştirme verileri, taban puan ve başarı sırası
//     https://yokatlas.yok.gov.tr/
// [4] 2026 YKS başarı sırası barajları (YÖK, Tercih Kılavuzu)
//     https://www.universitego.com/basari-sirasi-sarti-olan-bolumler/
//     https://www.yenisafak.com/galeri/ozgun/hukuk-mimarlik-muhendislik-tip-ogretmenlik-dis-hekimligi-eczacilik-programlarina-basvurabilmek-icin-en-dusuk-basari-sirasi-nedir-4842151
// Araştırma tarihi: 2026-09-07
// ===================================================================
//
// ÖNEMLİ DÜRÜSTLÜK NOTU (kullanıcıya da gösterilmeli):
// ÖSYM puanı, o YILIN ortalaması ve standart sapması kullanılarak standart
// puana çevirir [1]. Bu değerler sınavdan SONRA açıklanır. Dolayısıyla
// sınav öncesi hiçbir hesaplama "kesin puan" veremez — internetteki
// "net × katsayı" formülleri geçmiş bir yıla uydurulmuş doğrusal
// yaklaşımlardır ve kaynaklar arasında bile tutarsızdır (ör. AYT Matematik
// katsayısı için 2,89 ve 2,83 değerleri ayrı ayrı yayınlanmış).
//
// Bu yüzden bu modül:
//   - PUAN tahminini "yaklaşık" olarak sunar,
//   - asıl olarak BAŞARI SIRASI üzerinden çalışır (sıralama yıldan yıla çok
//     daha kararlı; sınav zorluğu değişse de bölümün istediği sıra benzer [3]),
//   - barajları kesin kural olarak uygular (bunlar resmi ve nettir [4]).

/** Net = Doğru − Yanlış/4 (dört yanlış bir doğruyu götürür). */
export function calcNet(correct = 0, wrong = 0) {
  const c = Math.max(0, Number(correct) || 0);
  const w = Math.max(0, Number(wrong) || 0);
  return Math.round((c - w / 4) * 100) / 100;
}

/** OBP = Diploma notu × 5, 250–500 aralığında. */
export function calcOBP(diplomaGrade) {
  const g = Number(diplomaGrade);
  if (!Number.isFinite(g)) return null;
  return Math.min(500, Math.max(250, Math.round(g * 5)));
}

/**
 * OBP'nin yerleştirme puanına katkısı.
 * Katsayı 0,12; DAHA ÖNCE bir yükseköğretim programına yerleşmiş adaylarda
 * 0,06'ya iner. Üst sınır ~60 puan.
 */
export function obpContribution(obp, { placedBefore = false } = {}) {
  if (!obp) return 0;
  const k = placedBefore ? 0.06 : 0.12;
  return Math.round(obp * k * 100) / 100;
}

// Sınavdaki soru sayıları — ÖSYM sabitleri.
export const QUESTION_COUNTS = {
  tyt: { turkce: 40, sosyal: 20, matematik: 40, fen: 20, toplam: 120 },
  ayt: {
    say: { matematik: 40, fizik: 14, kimya: 13, biyoloji: 13, toplam: 80 },
    ea: { matematik: 40, edebiyat: 24, tarih1: 10, cografya1: 6, toplam: 80 },
    soz: { edebiyat: 24, tarih1: 10, cografya1: 6, tarih2: 11, cografya2: 11, felsefe: 12, din: 6, toplam: 80 },
  },
};

/**
 * 2026 YKS BAŞARI SIRASI BARAJLARI — kaynak [4].
 *
 * Bunlar resmi ve KESİN kurallardır: puanın yetse bile bu sıranın gerisindeysen
 * o programı tercih listene EKLEYEMEZSİN. Tercih aracının en önemli girdisi.
 */
export const RANK_BARRIERS = {
  tip:          { limit: 50000,  label: "Tıp",             scoreType: "say" },
  dis:          { limit: 80000,  label: "Diş Hekimliği",   scoreType: "say" },
  eczacilik:    { limit: 100000, label: "Eczacılık",       scoreType: "say" },
  hukuk:        { limit: 100000, label: "Hukuk",           scoreType: "ea"  },
  mimarlik:     { limit: 250000, label: "Mimarlık",        scoreType: "say" },
  muhendislik:  { limit: 300000, label: "Mühendislik",     scoreType: "say" },
  ogretmenlik:  { limit: 300000, label: "Öğretmenlik",     scoreType: null  },
};

/** Bir barajın altında mıyım? (rank küçükse daha iyi) */
export function passesBarrier(rank, barrierKey) {
  const b = RANK_BARRIERS[barrierKey];
  if (!b || !rank) return true;
  return rank <= b.limit;
}

/** Verilen sıralamayla erişilemeyen barajlı alanlar. */
export function blockedFields(rank) {
  if (!rank) return [];
  return Object.entries(RANK_BARRIERS)
    .filter(([, b]) => rank > b.limit)
    .map(([key, b]) => ({ key, ...b }));
}

export const SCORING_SOURCES = [
  { label: "ÖSYM — Değerlendirme yöntemi", url: "https://www.osym.gov.tr/TR,2544/degerlendirme.html" },
  { label: "YÖK Atlas — yerleştirme verileri", url: "https://yokatlas.yok.gov.tr/" },
];

export const SCORING_DISCLAIMER =
  "ÖSYM puanı o yılın ortalama ve standart sapmasıyla hesaplar; bu değerler " +
  "sınavdan sonra açıklanır. Buradaki tahmin geçmiş yıl verilerine dayanır, " +
  "resmi puan değildir — yön vermek içindir.";

export const BARRIER_DISCLAIMER =
  "Başarı sırası barajları YÖK tarafından belirlenir ve her yıl güncellenebilir. " +
  "Buradaki değerler 2026 tercih dönemi içindir.";
