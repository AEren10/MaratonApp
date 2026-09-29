import { TRIAL_TO_CURRICULUM } from "../trial/trialKeyMap.js";
import { subjectPaletteKey } from "../../themes/subjectPalette.js";

// Defteri tek derse suz. Analiz'den deneme anahtari gelebilir ("tyt_sosyal"
// = tarih + cografya + felsefe + din); mufredat anahtarina cevrilip palet
// anahtariyla karsilastirilir (tyt_/ayt_ ve alan ekleri ayni derse duser).
export function wrongMatchesSubject(item, subjectKey) {
  if (!subjectKey) return true;
  const keys = TRIAL_TO_CURRICULUM[subjectKey] || [subjectKey];
  const allowed = new Set(keys.map((k) => subjectPaletteKey(k)));
  const own = typeof item?.subject === "string" ? item.subject : item?.subject?.key;
  return allowed.has(subjectPaletteKey(own));
}
