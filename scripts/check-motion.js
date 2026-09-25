#!/usr/bin/env node
// Hareket butcesi bekcisi.
//
// 25 Eylul'de sunu bulduk: gunde onlarca kez dokunulan 430 Pressable'in
// yalnizca 13'unde basma geri bildirimi varken, kimsenin istemedigi
// 268 yerde giris animasyonu vardi. Butce yanlis tarafa harcaniyordu.
// Bu script o dengenin geri bozulmasini engeller.
const fs = require("fs");
const path = require("path");

const ROOT = process.argv[2] || "src";
const files = [];
(function walk(d) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    if (e.name === "node_modules" || e.name.startsWith(".")) continue;
    const f = path.join(d, e.name);
    if (e.isDirectory()) walk(f);
    else if (/\.jsx?$/.test(e.name)) files.push(f);
  }
})(ROOT);

const RULES = [
  {
    re: /\bFadeInDown\b/,
    msg: "FadeInDown — yukaridan asagi kayarak belirme kaldirildi. Giris gerekiyorsa kaymasiz FadeIn, o da yalniz nadir gorulen ekranda.",
  },
  {
    re: /transform:\s*\[\s*\{\s*scale:\s*pressed\s*\?/,
    msg: "Basma olcegi ani sicrama — animasyonsuz. components/design/Press kullan.",
  },
  {
    re: /\bEasing\.in\s*\(/,
    msg: "Easing.in UI'da yasak: yavas baslar, kullanicinin tam baktigi ani geciktirir. Easing.bezier(...ANIMATION.easing.easeOut) kullan.",
  },
  {
    re: /\brunOnJS\s*\(/,
    msg: "runOnJS Reanimated 4'te birakildi. react-native-worklets'ten scheduleOnRN kullan.",
  },
  { re: /\bPanResponder\b/, msg: "PanResponder koprudan gecer. Gesture.Pan() kullan." },
];

// Imza anlari: cizgi cizilir, hat gecis yapar, dugum parlar. Bunlar uzun surer.
const SLOW_OK = [
  "components/charts",
  "FirstDayRouteLine",
  "CurriculumCurve",
  "EmptyState",
  "SparkBurst",
  // AGENTS.md'nin uc imza aninden biri: odeme/rota hazir -> dugum bir kez parlar.
  "FirstRouteReadyScreen",
  "OneWeekCompletedScreen",
  "StudyProcessedScreen",
];

// Surekli hareket (spinner, marquee) sure tavanina tabi degil -- bir kez
// izlenen bir gecis degil, arka planda donen bir durum gostergesi.
const LOOP = /Animated\.loop|withRepeat|Easing\.linear|iterationCount/;

const hits = [];
for (const file of files) {
  const rel = file.split(path.sep).join("/");
  const lines = fs.readFileSync(file, "utf8").split(/\r?\n/);

  lines.forEach((line, i) => {
    if (/^\s*(\/\/|\*)/.test(line)) return;
    for (const r of RULES) {
      if (r.re.test(line)) hits.push({ rel, line: i + 1, msg: r.msg });
    }
    // Sure tavani: imza ani degilse 900ms'i gecen hareket yok (AGENTS.md: 0.5-0.9 sn)
    const m = line.match(/duration:?\s*\(?\s*(\d{3,5})\s*\)?/);
    const near = lines.slice(Math.max(0, i - 6), i + 6).join(" ");
    if (m && +m[1] > 900 && !LOOP.test(near) && !SLOW_OK.some((p) => rel.includes(p))) {
      hits.push({
        rel,
        line: i + 1,
        msg: `${m[1]}ms — tavan 900ms. Imza ani ise scripts/check-motion.js icindeki SLOW_OK'a ekle.`,
      });
    }
  });
}

if (!hits.length) {
  console.log(`Hareket butcesi saglam (${files.length} dosya tarandi).`);
  process.exit(0);
}
console.log(`\n${hits.length} hareket ihlali:\n`);
for (const h of hits) console.log(`  ${h.rel}:${h.line}\n    ${h.msg}`);
process.exit(1);
