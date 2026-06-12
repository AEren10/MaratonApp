// AI study suggestions powered by Claude API.
// Falls back to a rule-based engine when no API key is present
// (so the app stays self-sufficient without Anthropic credits).

import { ALL_SUBJECTS } from "../screens/trial/trialTypes";

const ANTHROPIC_API_KEY = process.env.EXPO_PUBLIC_ANTHROPIC_KEY;
const MODEL = "claude-haiku-4-5-20251001";

function summarizeUser({ trials, todayLogs, streak, weakAreas, examLabel }) {
  const lines = [];
  lines.push(`Sınav türü: ${examLabel || "TYT/AYT"}`);
  lines.push(`Streak: ${streak} gün`);
  lines.push(`Bugün çalışılan ders sayısı: ${todayLogs.length}`);
  if (trials.length > 0) {
    const latest = trials[0];
    lines.push(`Son deneme: ${latest.name || latest.trialType} — ${latest.totalNet?.toFixed(1)} net`);
  }
  const weakList = Object.entries(weakAreas)
    .sort((a, b) => a[1] - b[1])
    .slice(0, 4)
    .map(([k, v]) => {
      const subj = ALL_SUBJECTS.find((s) => s.key === k);
      return `${subj?.name || k}: %${v}`;
    });
  if (weakList.length) lines.push(`Zayıf alanlar (düşükten yükseğe): ${weakList.join(", ")}`);
  return lines.join("\n");
}

function ruleBasedSuggestions({ weakAreas }) {
  const sorted = Object.entries(weakAreas)
    .filter(([k]) => ALL_SUBJECTS.find((s) => s.key === k))
    .sort((a, b) => a[1] - b[1])
    .slice(0, 3);

  if (!sorted.length) {
    return [
      { title: "Düzenli tekrar", body: "Henüz veri yok. Bir-iki deneme gir, sana özel öneri oluşturalım.", color: "#A0A0B0" },
    ];
  }
  return sorted.map(([key, pct]) => {
    const subj = ALL_SUBJECTS.find((s) => s.key === key) || { name: key, color: "#A0A0B0" };
    const advice =
      pct < 30 ? "Temel kavramlardan başla, video + kitap karması işe yarar."
      : pct < 50 ? "Yeni konu çalışmadan önce eski denemelerindeki yanlışlarını tekrarla."
      : "Soru çözümünü artır — günde 20 soru hedefle.";
    return {
      title: `${subj.name} (%${pct})`,
      body: advice,
      color: subj.color,
      subjectKey: key,
    };
  });
}

async function callClaude(promptText) {
  if (!ANTHROPIC_API_KEY) return null;
  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 600,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text:
                  "Aşağıdaki öğrenci verisine bakarak BUGÜN için 3 öneri ver. " +
                  "Her öneri için 'baslik', 'icerik' (en fazla 25 kelime), 'ders' (key) döndür. " +
                  "Sadece JSON dizisi döndür, başka hiçbir şey yazma.\n\n" +
                  promptText,
              },
            ],
          },
        ],
      }),
    });
    const json = await res.json();
    const text = json?.content?.[0]?.text;
    if (!text) return null;
    const match = text.match(/\[.*\]/s);
    if (!match) return null;
    const arr = JSON.parse(match[0]);
    return arr.map((a) => {
      const subj = ALL_SUBJECTS.find((s) => s.key === a.ders);
      return {
        title: a.baslik,
        body: a.icerik,
        color: subj?.color || "#F5A623",
        subjectKey: a.ders,
      };
    });
  } catch (_) {
    return null;
  }
}

export async function getAISuggestions(input) {
  const prompt = summarizeUser(input);
  const ai = await callClaude(prompt);
  if (ai && ai.length > 0) return ai;
  return ruleBasedSuggestions(input);
}
