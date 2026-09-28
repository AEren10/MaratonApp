// Tahmin TEK sinavin denemelerinden cikar (TYT ya da AYT/YDT). Hedef ise
// iki sinavli kullanicida sunucuda TOPLAM tutuluyor (TYT + AYT). Toplami tek
// sinavin tahminiyle kiyaslamak "hedefin 80 net altinda" gibi yanlis cumleler
// uretiyordu. Burada tahminin sinavina denk gelen hedef secilir; ayri hedef
// bilinmiyorsa null doner — toplamla kiyaslamaktansa kiyaslamamak dogru.

const num = (v) => {
  const n = Number(v);
  return v != null && Number.isFinite(n) && n > 0 ? n : null;
};

export function forecastExamLabel(types = []) {
  if (types.includes("LGS")) return "LGS";
  if (types.includes("TYT")) return "TYT";
  if (types.includes("YDT")) return "YDT";
  return types.length ? "AYT" : null;
}

// Seviye testi yalniz TYT (ya da LGS) derslerini soruyor; baslangic neti
// bu yuzden TYT. Baslangic ile kiyaslanacak hedef de TYT hedefi olmali,
// TYT+AYT toplami degil.
export function baselineTarget({ examType, targetNet, targetNetTYT } = {}) {
  return forecastTarget({ types: examType === "lgs" ? ["LGS"] : ["TYT"], examType, targetNet, targetNetTYT });
}

export function forecastTarget({ types = [], examType, targetNet, targetNetTYT, targetNetAYT } = {}) {
  const label = forecastExamLabel(types);
  const multi = examType === "tyt_ayt" || examType === "dil";
  if (!multi) return { label, target: num(targetNet) };
  if (label === "TYT") return { label, target: num(targetNetTYT) };
  if (label) return { label, target: num(targetNetAYT) };
  return { label: null, target: null };
}
