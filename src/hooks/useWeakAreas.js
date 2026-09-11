import { useMemo } from "react";
import { useSelector } from "react-redux";
import { selectTrials } from "../store/slices/trialSlice";
import { getAllSubjects } from "../domain/trial/trialTypes";
import { useC } from "../contexts/ThemeContext";

// Son 5 denemenin ders bazli ortalamasi %50'nin altinda kalan dersleri
// "geride kalan konu" olarak isaretler. Konu tarafinda yalniz ders bazli
// ilerleme takip edilebiliyor — rota gecikmesi ve defter sayisi bu veri
// setinde yok, bu yuzden hesaba katilmiyor.
function computeWeakTopics(C, trials) {
  if (!trials.length) return [];
  const sorted = [...trials].sort((a, b) => new Date(b.date) - new Date(a.date));
  const recent = sorted.slice(0, 5);
  const weak = [];
  getAllSubjects(C).forEach((s) => {
    const nets = recent
      .map((t) => t.subjects?.[s.key]?.net)
      .filter((n) => n !== undefined && n !== null);
    if (nets.length === 0) return;
    const avg = nets.reduce((a, b) => a + b, 0) / nets.length;
    const pct = Math.round((avg / s.max) * 100);
    if (pct < 50) {
      weak.push({
        name: s.parent ? `${s.parent} ${s.name}` : s.name,
        subject: { key: s.key, name: s.name, color: s.color, icon: s.icon },
        acc: Math.max(0, pct),
        // Iki kademe de DOGRULUK kademesi. "Uzun suredir yok" gibi bir
        // tazelik iddiasi burada yapilamaz: konu bazli son calisma tarihi
        // bu veri setinde tutulmuyor.
        status: pct < 25 ? "critical" : "low",
      });
    }
  });
  return weak.sort((a, b) => a.acc - b.acc);
}

export function useWeakAreas() {
  const C = useC();
  const trials = useSelector(selectTrials);
  const weakTopics = useMemo(() => computeWeakTopics(C, trials), [C, trials]);
  return { weakTopics, isEmpty: weakTopics.length === 0 };
}
