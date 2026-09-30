import test from "node:test";
import assert from "node:assert/strict";

import { topicStory, weekStory, trialStory, statsStory, formatDuration } from "../../src/domain/insight/storyLines.js";

test("konu: dogruluk varsa seviye, yoksa hacim/his; bekleyen yanlis once", () => {
  assert.equal(topicStory({ q: 0 }), "Bu konuya henüz başlamadın.");
  assert.equal(topicStory({ q: 40, accuracy: 55, wrongsOpen: 3 }), "Takılıyorsun: doğruluk %55. Defterde bekleyen 3 yanlış var.");
  assert.equal(topicStory({ q: 25, feel: "hard", daysSince: 20 }), "25 soru çözdün; zorladığını söyledin. 20 gündür dokunmadın; unutma başladı.");
});

test("hafta: gecen haftayla fark + en cok ders (eksiz)", () => {
  assert.equal(weekStory({ minutes: 0 }), "Bu hafta henüz çalışma kaydın yok.");
  assert.equal(weekStory({ minutes: 440, prevMinutes: 360, bySubject: [{ label: "Türkçe", minutes: 200 }, { label: "Matematik", minutes: 90 }] }),
    "Geçen haftadan 1 sa 20 dk fazla. En çok Türkçe çalıştın.");
  assert.equal(weekStory({ minutes: 300, prevMinutes: 305 }), "Geçen haftayla aynı tempodasın.");
});

test("deneme: en yuksek net ve en cok bos", () => {
  assert.equal(trialStory({ subjects: [{ label: "Matematik", net: 18.5, empty: 2 }, { label: "Fen", net: 7.25, empty: 9 }] }),
    "En yüksek net: Matematik (18,5). En çok boş: Fen (9).");
  assert.equal(trialStory({ subjects: [] }), "Bu denemede ders kırılımı yok.");
});

test("istatistik: son 4 hafta ortalamasi; bos hal durust", () => {
  assert.equal(statsStory({ weeks: [0, 0, 0, 0] }), "Son haftalarda çalışma kaydın yok; ilk kayıtla burası dolacak.");
  assert.equal(statsStory({ weeks: [300, 360, 420, 408], bestWeekLabel: "21 Eylül" }),
    "Son 4 haftanın ortalaması: haftada 6,2 saat. En iyi haftan: 21 Eylül.");
  assert.equal(formatDuration(80), "1 sa 20 dk");
});
