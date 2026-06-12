// Madde 2: Yanlış soru "kayıp net" tahmini.
// Gerçek ÖSYM istatistiği henüz yok; konu adından zorluk sınıfı çıkarıp
// "100 öğrenciden ~X doğru yapıyor" sosyal-kanıt + net etkisi gösteriyoruz.
// İleride topic_progress agregesi geldiğinde bu sabitler gerçek oranla değişebilir.

const C = {
  red: "#EF4444",
  amber: "#F5A623",
  green: "#34D399",
};

// Zorluk → ortalama doğruluk oranı (%) ve net etkisi.
const DIFFICULTY_META = {
  zor: { correctRate: 34, label: "Zor", color: C.red },
  orta: { correctRate: 54, label: "Orta", color: C.amber },
  kolay: { correctRate: 72, label: "Kolay", color: C.green },
};

// YKS'de tipik olarak zorlanılan konu anahtar kelimeleri (alt-string eşleşme).
const HARD_TOPICS = [
  "paragraf", "problem", "fonksiyon", "türev", "integral", "limit", "süreklilik",
  "logaritma", "trigonometri", "permütasyon", "kombinasyon", "olasılık",
  "polinom", "karmaşık", "diziler", "analitik", "çember", "katı cisim",
  "modüler", "elektrik", "manyet", "optik", "dalga", "basınç", "kuvvet",
  "kimyasal tepkime", "mol", "gaz", "çözünürlük", "kimyasal denge",
  "kalıtım", "protein sentezi", "sinir", "endokrin", "fotosentez",
];

// Tipik olarak yüksek doğruluklu (kolay) konu anahtarları.
const EASY_TOPICS = [
  "temel kavram", "sayı basamak", "bölme", "ebob", "ekok", "yazım", "noktalama",
  "deyim", "atasöz", "sözcükte anlam", "ünite", "tanım", "harita bilgisi",
];

function classify(topic) {
  const t = (topic || "").toLocaleLowerCase("tr");
  if (!t) return "orta";
  if (HARD_TOPICS.some((k) => t.includes(k))) return "zor";
  if (EASY_TOPICS.some((k) => t.includes(k))) return "kolay";
  return "orta";
}

// Bir yanlış sorunun tahmini net kaybı: kaçırılan 1.0 net + 0.25 ceza payı.
export const NET_LOSS_PER_WRONG = 1.25;

export function getTopicDifficulty(topic) {
  const difficulty = classify(topic);
  const meta = DIFFICULTY_META[difficulty];
  return {
    difficulty,
    correctRate: meta.correctRate,
    label: meta.label,
    color: meta.color,
    netLoss: NET_LOSS_PER_WRONG,
  };
}
