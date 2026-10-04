import { SUBSTRING_WORDS, TOKEN_WORDS } from "./profanityWords.js";

const TR_MAP = { "ç": "c", "ğ": "g", "ı": "i", "İ": "i", "ö": "o", "ş": "s", "ü": "u", "â": "a", "î": "i", "û": "u" };
const LEET = { "0": "o", "1": "i", "3": "e", "4": "a", "5": "s", "7": "t", "@": "a", "$": "s", "!": "i" };

// Kucuk harf, Turkce harfler duzlestirilir, rakam/simge ikameleri cozulur
// ("s1kt1r", "0r0spu"), tekrar eden harfler tek olur ("siiiktir").
function fold(text) {
  let out = "";
  for (const ch of String(text || "")) {
    const c = TR_MAP[ch] ?? ch.toLowerCase();
    out += TR_MAP[c] ?? LEET[c] ?? c;
  }
  return out.normalize("NFD").replace(/[̀-ͯ]/g, "");
}

const squeeze = (s) => s.replace(/(.)\1+/g, "$1");

export function normalizeForFilter(text) {
  return squeeze(fold(text));
}

// true: metin uygunsuz kelime iceriyor.
export function containsProfanity(text) {
  const folded = fold(text);
  if (!folded.trim()) return false;
  const raw = folded.split(/[^a-z]+/).filter(Boolean);
  // Tek harflik parcalar birlestirilir: "a.m.k", "a m k".
  const tokens = [];
  let run = "";
  for (const part of raw) {
    if (part.length === 1) { run += part; continue; }
    if (run) tokens.push(run);
    run = "";
    tokens.push(part);
  }
  if (run) tokens.push(run);
  for (let i = 0; i < tokens.length; i += 1) tokens[i] = squeeze(tokens[i]);
  return tokens.some((t) => TOKEN_WORDS.includes(t) || SUBSTRING_WORDS.some((w) => t.includes(w)));
}

export const PROFANITY_MESSAGE = "Bu ifade uygun değil. Lütfen başka bir ad seç.";
