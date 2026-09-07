import { wrongPenaltyForTrialType } from "../trial/trialModel";

// FOTOĞRAFTAN DENEME OKUMA — metin ayrıştırma katmanı.
//
// Tasarım AKIŞ 4: "Fotoğraftan Oku → Okuma Onayı → Kayıt · Ölçülmüş".
//
// MİMARİ KARARI: tanıma (OCR) ile AYRIŞTIRMA (parsing) ayrıldı.
// Tanıma native modül ister (ML Kit / Apple Vision) ve yeni build gerektirir;
// asıl zor ve değerli kısım ise dağınık metni deneme sonucuna çevirmek.
// Bu dosya TAMAMEN bağımsız ve test edilebilir — tanıyıcı sonradan takılır.
//
// Gerçek dünya karmaşası:
//   "Türkçe        35   5   0   33,75"
//   "TYT MATEMATİK  28  12   0"
//   "Fen Bil.  20 D  8 Y  2 B"
//   OCR "I/l/1", "O/0", "S/5" karıştırır; Türkçe karakterleri bozar.

// Ders adı varyantları → müfredat anahtarı.
// OCR çıktısı büyük/küçük harf, kısaltma ve bozuk karakter içerebilir.
const SUBJECT_ALIASES = {
  turkce: ["turkce", "türkçe", "turkce test", "türkçe testi", "turk dili", "türk dili"],
  matematik: ["matematik", "mat", "temel matematik", "matematik testi"],
  fen: ["fen", "fen bilimleri", "fen bil", "fen bilgisi"],
  sosyal: ["sosyal", "sosyal bilimler", "sosyal bil"],
  fizik: ["fizik"],
  kimya: ["kimya"],
  biyoloji: ["biyoloji", "biyo"],
  tarih: ["tarih"],
  cografya: ["cografya", "coğrafya"],
  felsefe: ["felsefe"],
  din: ["din", "din kulturu", "din kültürü", "dkab"],
  edebiyat: ["edebiyat", "turk dili ve edebiyati", "türk dili ve edebiyatı"],
  ingilizce: ["ingilizce", "yabanci dil", "yabancı dil"],
  inkilap: ["inkilap", "inkılap", "t.c. inkilap", "inkilap tarihi"],
};

/** Türkçe karakterleri sadeleştirip küçült — OCR bozulmalarına dayanıklı. */
function normalize(text) {
  return (text || "")
    .toLocaleLowerCase("tr")
    .replace(/[ıİ]/g, "i")
    .replace(/[şŞ]/g, "s")
    .replace(/[ğĞ]/g, "g")
    .replace(/[üÜ]/g, "u")
    .replace(/[öÖ]/g, "o")
    .replace(/[çÇ]/g, "c")
    .replace(/\s+/g, " ")
    .trim();
}

function matchSubject(line) {
  const n = normalize(line);
  let best = null;
  for (const [key, aliases] of Object.entries(SUBJECT_ALIASES)) {
    for (const a of aliases) {
      const alias = normalize(a);
      if (!n.includes(alias)) continue;
      // En UZUN eşleşme kazanır: "fen bilimleri" > "fen"
      if (!best || alias.length > best.aliasLength) {
        best = { key, aliasLength: alias.length };
      }
    }
  }
  return best?.key || null;
}

/**
 * Bir satırdaki sayıları çıkarır.
 * Ondalık hem "33,75" hem "33.75" olabilir; net değeri ondalıklıdır.
 */
function extractNumbers(line) {
  const out = [];
  const re = /(\d+(?:[.,]\d+)?)/g;
  let m;
  while ((m = re.exec(line)) !== null) {
    const raw = m[1].replace(",", ".");
    const val = parseFloat(raw);
    if (Number.isFinite(val)) {
      out.push({ value: val, isDecimal: raw.includes("."), raw: m[1] });
    }
  }
  return out;
}

/**
 * Tek satırı ayrıştırır.
 *
 * Kabul edilen düzenler:
 *   Ders  D  Y  B  [Net]
 *   Ders  D  Y  [Net]
 *   Ders  20 D  8 Y  2 B
 *
 * Ayrıştırılamayan satır SESSİZCE ATILMAZ — `confidence: "low"` ile
 * döner ki onay ekranı kullanıcıya sorabilsin.
 */
export function parseLine(line, { questionCount, trialType } = {}) {
  const subject = matchSubject(line);
  if (!subject) return null;

  const nums = extractNumbers(line);
  if (nums.length === 0) {
    return { subject, confidence: "low", reason: "sayi_yok", raw: line };
  }

  // Ondalıklı sayı varsa o nettir; tam sayılar D/Y/B'dir.
  const decimals = nums.filter((n) => n.isDecimal);
  const integers = nums.filter((n) => !n.isDecimal).map((n) => n.value);

  let correct = null;
  let wrong = null;
  let empty = null;

  if (integers.length >= 3) {
    [correct, wrong, empty] = integers;
  } else if (integers.length === 2) {
    [correct, wrong] = integers;
    empty = questionCount != null ? Math.max(0, questionCount - correct - wrong) : null;
  } else if (integers.length === 1) {
    correct = integers[0];
  }

  const netFromOcr = decimals.length ? decimals[decimals.length - 1].value : null;
  // Yanlış cezası sınav tipine göre: YKS 1/4, LGS 1/3. Sabit 1/4 kullanmak
  // LGS fişinde hem yanlış net üretiyor hem de "net uyuşmuyor" yanlış
  // pozitifi veriyordu.
  const penalty = wrongPenaltyForTrialType(trialType);
  const netComputed = correct != null && wrong != null
    ? Math.round((correct - wrong * penalty) * 100) / 100
    : null;

  // Tutarlılık kontrolü — OCR yanlış okuduysa yakala.
  const problems = [];
  if (questionCount != null && correct != null && wrong != null) {
    const total = correct + wrong + (empty || 0);
    if (total > questionCount) problems.push("toplam_soru_sayisini_asiyor");
  }
  if (netFromOcr != null && netComputed != null && Math.abs(netFromOcr - netComputed) > 0.3) {
    problems.push("net_uyusmuyor");
  }
  if (correct != null && correct < 0) problems.push("negatif_dogru");

  let confidence = "high";
  if (problems.length) confidence = "low";
  else if (correct == null || wrong == null) confidence = "medium";

  return {
    subject,
    correct,
    wrong,
    empty,
    net: netComputed ?? netFromOcr,
    netFromOcr,
    netComputed,
    confidence,
    problems,
    raw: line,
  };
}

/**
 * OCR metninin tamamını ayrıştırır.
 *
 * @param text          tanıyıcıdan gelen ham metin
 * @param questionCounts { [subjectKey]: soruSayisi } — tutarlılık kontrolü için
 */
export function parseTrialText(text, { questionCounts = {}, trialType } = {}) {
  const lines = (text || "").split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const results = [];
  const unmatched = [];

  for (const line of lines) {
    const parsed = parseLine(line, { questionCount: questionCounts[matchSubject(line)], trialType });
    if (parsed) results.push(parsed);
    else if (/\d/.test(line)) unmatched.push(line); // sayı içeren ama ders eşleşmeyen
  }

  // Aynı ders birden fazla satırda çıkarsa en güvenilirini tut.
  const bySubject = {};
  const order = { high: 3, medium: 2, low: 1 };
  for (const r of results) {
    const prev = bySubject[r.subject];
    if (!prev || order[r.confidence] > order[prev.confidence]) bySubject[r.subject] = r;
  }

  const subjects = Object.values(bySubject);
  const needsReview = subjects.filter((s) => s.confidence !== "high");

  return {
    subjects,
    unmatched,
    // Onay ekranı bunlara odaklanmalı.
    needsReview,
    // Hiçbir şey okunamadıysa dürüstçe söyle — "Okunamadı" ekranı (AKIŞ 18).
    empty: subjects.length === 0,
    totalNet: subjects.reduce((n, s) => n + (s.net || 0), 0),
  };
}

export const OCR_CONFIDENCE_LABELS = {
  high: "Okundu",
  medium: "Eksik olabilir",
  low: "Kontrol et",
};

export const OCR_PROBLEM_LABELS = {
  toplam_soru_sayisini_asiyor: "Toplam, testteki soru sayısını aşıyor",
  net_uyusmuyor: "Yazan net, doğru/yanlış ile uyuşmuyor",
  negatif_dogru: "Doğru sayısı negatif okundu",
  sayi_yok: "Satırda sayı bulunamadı",
};
