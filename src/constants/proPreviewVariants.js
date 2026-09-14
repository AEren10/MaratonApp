// PRO ONIZLEME VARYANTLARI — "Önizleme · Geçmiş" ve "Önizleme · Tempo"
// artboardlarindan BIREBIR. OCR varyanti v1 disi.
//
// Kaynak -> varyant. Karsiligi olmayan kaynakta Pro Onizleme'nin birincil
// butonu dogrudan baglam paywall'ina gider.
export const PREVIEW_VARIANT_FOR_SOURCE = {
  trial_history: "history",
  route_scenarios: "tempo",
};

export const PREVIEW_FOOTNOTE =
  "Maraton önerir, karar senin · 7 gün ücretsiz, bitmeden iptal edersen ücret alınmaz";

// Sayiya gelen 3. tekil iyelik eki: 2'si, 3'u, 6'si, 10'u, 40'i ...
const DIGIT_SUFFIX = ["", "i", "si", "ü", "ü", "i", "sı", "si", "i", "u"];
const TENS_SUFFIX = ["", "u", "si", "u", "ı", "si", "ı", "i", "i", "ı"];
function possessive(n) {
  const v = Math.abs(Math.trunc(Number(n) || 0));
  if (v % 10) return DIGIT_SUFFIX[v % 10];
  if (v % 100) return TENS_SUFFIX[(v % 100) / 10];
  if (v === 0) return "ı";
  return v % 1000 ? "ü" : "i";
}

export const PREVIEW_HISTORY = {
  title: "Deneme geçmişin",
  countMeta: (open) => `kayıtlı denemen var · ${open}'${possessive(open)} açık`,
  body: "Önceki kayıtlar silinmez, Pro ile geri açılır.",
  listLabel: "TÜM KAYITLARIN",
  lockedCompare: "Aylar arası karşılaştırma",
  primary: "Geçmişi aç",
  secondary: "Şimdilik devam et",
};

export const PREVIEW_TEMPO = {
  title: "Tempo senaryoları",
  intro: (n) => `Üç senaryo da senin ${n} denemenden çizildi. Aynı hedef, üç farklı haftalık yük.`,
  cards: {
    current: { label: "REFERANS", meta: () => "şu anki tempo", note: "Bugünkü yükle devam edersen rota bu şekilde ilerler." },
    more: { label: "DAHA YOĞUN", meta: (pct) => `%${pct} daha çok` },
    less: { label: "DAHA HAFİF", meta: (pct) => `%${pct} daha az` },
  },
  weekly: "HAFTALIK",
  stops: "DURAK",
  band: "TAHMİN BANDI",
  lockedApply: "Senaryoyu rotana uygula",
  note: "Tahmin bandı ders bazlı deneme netlerinden hesaplanır; konu bazlı çıkarım yapılmaz.",
  primary: "Senaryoları aç",
  secondary: "Şimdilik devam et",
};
