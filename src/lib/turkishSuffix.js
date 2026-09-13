// Turkce hal ekleri: "71'den 73'e", "1 Temmuz'da", "Matematik'teki".
// Rakamla yazilan sayilarda ek, sayinin OKUNUSUNUN son sozcugune gore secilir.

const UNITS = ["", "bir", "iki", "üç", "dört", "beş", "altı", "yedi", "sekiz", "dokuz"];
const TENS = ["", "on", "yirmi", "otuz", "kırk", "elli", "altmış", "yetmiş", "seksen", "doksan"];
const BACK = "aıou";
const FRONT = "eiöü";
const HARD = "fstkçşhp";

export function numberLastWord(value) {
  const n = Math.abs(Math.round(Number(value) || 0));
  if (n === 0) return "sıfır";
  if (n % 1000 === 0) return "bin";
  if (n % 100 === 0) return "yüz";
  if (n % 10 === 0) return TENS[(n % 100) / 10];
  return UNITS[n % 10];
}

function shape(word) {
  const lower = String(word || "").toLocaleLowerCase("tr-TR");
  let back = false;
  for (let i = lower.length - 1; i >= 0; i -= 1) {
    if (BACK.includes(lower[i])) { back = true; break; }
    if (FRONT.includes(lower[i])) break;
  }
  const last = lower[lower.length - 1] || "";
  return { back, hard: HARD.includes(last), vowelEnd: BACK.includes(last) || FRONT.includes(last) };
}

// kind: "ablative" (-den) · "locative" (-de) · "dative" (-e)
export function caseSuffix(word, kind) {
  const { back, hard, vowelEnd } = shape(word);
  if (kind === "dative") {
    if (vowelEnd) return back ? "ya" : "ye";
    return back ? "a" : "e";
  }
  const d = hard ? "t" : "d";
  if (kind === "ablative") return `${d}${back ? "an" : "en"}`;
  return `${d}${back ? "a" : "e"}`;
}

export function withCase(word, kind) {
  const text = String(word || "");
  const last = text.split(" ").pop();
  return `${text}'${caseSuffix(last, kind)}`;
}

export function numberWithCase(value, kind) {
  const n = Math.round(Number(value) || 0);
  return `${n}'${caseSuffix(numberLastWord(n), kind)}`;
}
