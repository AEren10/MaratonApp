// DENEMEDEN SONRA "ROTANDA NE DEGISTI" (saf).
// Motor son denemede dusen dersi (subjectNetDrops) agirliklandirir; bu bir
// tahmin degil, rotanin gercekten kullandigi sinyal. Kullaniciya neden-sonuc
// olarak gosterilir: hangi ders dustu, rotada o dersin siradaki duragi ne.
import { subjectNetDrops } from "./trialWeakness.js";

const OPEN = new Set(["active", "upcoming"]);

export function trialRouteChanges({ trials = [], weeks = [], labelOf = (k) => k, limit = 2 } = {}) {
  const drops = subjectNetDrops(trials);
  const keys = Object.keys(drops).sort((a, b) => drops[b] - drops[a]).slice(0, limit);
  const stops = (weeks || []).flatMap((w) => w.stops || []);
  return keys.map((key) => {
    const next = stops.find((s) => s.subject === key && (!s.lifecycleStatus || OPEN.has(s.lifecycleStatus)) && !s.isReview);
    return { subject: key, label: labelOf(key) || key, nextTopic: next?.topic || null, drop: drops[key] };
  });
}
