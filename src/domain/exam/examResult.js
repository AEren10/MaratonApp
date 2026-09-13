// SINAV SONUCU — saf mantik (tasarim AKIS 14 · "Sınav Sonucu").
//
// Hangi alanlarin sorulacagi sinav turune bagli: TYT+AYT rotasinda iki net
// ve yerlestirme puani, sadece-TYT rotasinda tek net, LGS'de tek net + puan.
// Alan listesi UYDURULMUYOR, ExamContext'in examType/field degerinden
// tureniyor.

const AYT_LABEL = { sayisal: "AYT Sayısal", ea: "AYT Eşit Ağırlık", sozel: "AYT Sözel", dil: "AYT Dil" };

export function examResultFields(examType, field) {
  if (examType === "lgs") {
    return [
      { key: "primaryNet", label: "LGS", max: 90, kind: "net" },
      { key: "placementScore", label: "LGS puanı", max: 500, kind: "score" },
    ];
  }
  if (examType === "tyt_ayt") {
    return [
      { key: "primaryNet", label: "TYT", max: 120, kind: "net" },
      { key: "secondaryNet", label: AYT_LABEL[field] || "AYT", max: 80, kind: "net" },
      { key: "placementScore", label: "Yerleştirme puanı", max: 560, kind: "score" },
    ];
  }
  if (examType === "dil") {
    return [
      { key: "primaryNet", label: "TYT", max: 120, kind: "net" },
      { key: "secondaryNet", label: AYT_LABEL.dil, max: 80, kind: "net" },
      { key: "placementScore", label: "Yerleştirme puanı", max: 560, kind: "score" },
    ];
  }
  return [
    { key: "primaryNet", label: "TYT", max: 120, kind: "net" },
    { key: "placementScore", label: "Yerleştirme puanı", max: 560, kind: "score" },
  ];
}

/** "69,25" -> 69.25 · bos ya da gecersizse null. */
export function parseNetInput(raw) {
  const text = String(raw ?? "").trim().replace(",", ".");
  if (!text) return null;
  const value = Number(text);
  return Number.isFinite(value) ? value : null;
}

export function formatNetInput(value) {
  if (value == null) return "";
  return String(value).replace(".", ",");
}

/**
 * Girdiyi dogrular. Hata yalnizca ALAN SINIRI asilirsa ya da sayi
 * okunamazsa dogar; bos birakmak hata degil (yerlestirme puani sonuc
 * belgesi gelene kadar bilinmiyor olabilir).
 */
export function validateExamResult(fields, values) {
  const errors = {};
  const record = {};
  for (const f of fields) {
    const raw = values?.[f.key];
    const text = String(raw ?? "").trim();
    if (!text) continue;
    const value = parseNetInput(text);
    if (value == null) { errors[f.key] = "Sayı okunamadı"; continue; }
    if (value < 0 || value > f.max) { errors[f.key] = `0 – ${f.max} arası`; continue; }
    record[f.key] = Math.round(value * 100) / 100;
  }
  return {
    errors,
    record,
    // Rotanin ana neti girilmeden sonuc kaydedilmez: tahmin karsilastirmasi
    // tam olarak bu degere dayaniyor.
    savable: Object.keys(errors).length === 0 && record.primaryNet != null,
  };
}
