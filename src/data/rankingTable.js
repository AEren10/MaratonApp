// Net → tahmini başarı sırası ve puan tablosu.
//
// Kaynak: 2024-2025 YKS gerçek anchor noktaları (YÖK Atlas / ÖSYM verileri)
// üzerinden kalibre edildi.
// Net→puan→sıralama dönüşümü resmi formülle birebir değildir; tahmini yön verir.

// Puan türüne göre AYT/YDT ağırlığı (TYT 120, AYT 80, YDT 80 soru).
const AYT_WEIGHT = { say: 1.25, ea: 1.2, soz: 1.15, dil: 1.2 };

// Birleşik "skor" = tytNet + aytNet * ağırlık.
export function combinedScore({ tytNet = 0, aytNet = 0, type = "say" }) {
  const t = Math.max(0, Number(tytNet) || 0);
  const a = Math.max(0, Number(aytNet) || 0);
  return t + a * (AYT_WEIGHT[type] || 1.2);
}

// TYT tek başına sıralama çapaları (120 soru üzerinden).
const TYT_ANCHORS = [
  [115, 500], [108, 2500], [100, 8000], [90, 28000], [80, 75000],
  [70, 160000], [60, 280000], [50, 480000], [40, 850000], [30, 1400000],
];

// Skor → tahmini sıralama çapaları (YÖK Atlas gerçek noktalarına kalibre, azalan skor).
const ANCHORS = {
  say: [
    [216, 350], [208, 1500], [200, 6000], [192, 15000], [182, 30000],
    [170, 60000], [158, 95000], [145, 140000], [130, 200000], [113, 300000],
    [95, 450000], [75, 620000], [55, 800000],
  ],
  ea: [
    [185, 300], [175, 1500], [165, 3000], [158, 5000], [150, 9000],
    [140, 20000], [128, 45000], [115, 90000], [100, 160000], [85, 280000],
    [68, 450000], [50, 700000],
  ],
  soz: [
    [180, 400], [170, 2000], [160, 5000], [150, 12000], [138, 30000],
    [124, 70000], [110, 140000], [95, 250000], [80, 400000], [62, 600000],
    [45, 850000],
  ],
  dil: [
    [185, 300], [172, 1500], [160, 5000], [145, 12000], [130, 25000],
    [112, 45000], [95, 80000], [75, 130000], [55, 200000],
  ],
};

function interpolateAnchors(val, anchors) {
  if (!anchors || !anchors.length) return 100000;
  if (val >= anchors[0][0]) return anchors[0][1];
  const last = anchors[anchors.length - 1];
  if (val <= last[0]) return last[1];

  for (let i = 0; i < anchors.length - 1; i++) {
    const [s1, r1] = anchors[i];
    const [s2, r2] = anchors[i + 1];
    if (val <= s1 && val >= s2) {
      const t = (s1 - val) / (s1 - s2);
      const logR = Math.log(r1) + t * (Math.log(r2) - Math.log(r1));
      return Math.round(Math.exp(logR));
    }
  }
  return last[1];
}

// Yalnızca TYT netiyle başarı sırası tahmini.
export function estimateTytRank(tytNet = 0) {
  const t = Math.max(0, Number(tytNet) || 0);
  return interpolateAnchors(t, TYT_ANCHORS);
}

// Birleşik nete veya puan türüne göre başarı sırası tahmini.
export function estimateRank({ tytNet = 0, aytNet = 0, type = "say" }) {
  const t = Math.max(0, Number(tytNet) || 0);
  const a = Math.max(0, Number(aytNet) || 0);
  if (type === "tyt" || (a === 0 && t > 0)) {
    return estimateTytRank(t);
  }
  const score = combinedScore({ tytNet: t, aytNet: a, type });
  const anchors = ANCHORS[type] || ANCHORS.say;
  return interpolateAnchors(score, anchors);
}

// Tahmini yerleştirme puanı (ÖSYM katsayı yaklaşımı).
export function estimateScore({ tytNet = 0, aytNet = 0, type = "say", obp = 80 }) {
  const t = Math.max(0, Number(tytNet) || 0);
  const a = Math.max(0, Number(aytNet) || 0);
  const diploma = Math.min(100, Math.max(50, Number(obp) || 80));
  const obpContribution = diploma * 5 * 0.12; // 250-500 x 0.12 = 30-60 puan

  if (type === "tyt" || (a === 0 && t > 0)) {
    const raw = 100 + t * 3.33;
    return Math.round((raw + obpContribution) * 10) / 10;
  }

  const raw = 100 + t * 1.32 + a * 3.0;
  return Math.round((raw + obpContribution) * 10) / 10;
}

export function formatRankBand(rank) {
  if (!rank || rank <= 0) return "—";
  if (rank < 1000) return `ilk 1.000`;
  const min = Math.round((rank * 0.93) / 1000) * 1000;
  const max = Math.round((rank * 1.07) / 1000) * 1000;
  if (min >= 100000) {
    return `${Math.round(min / 1000)} – ${Math.round(max / 1000)} bin`;
  }
  return `${min.toLocaleString("tr-TR")} – ${max.toLocaleString("tr-TR")}`;
}

export function estimateRankDetails({ tytNet = 0, aytNet = 0, type = "say", obp = 80 }) {
  const rank = estimateRank({ tytNet, aytNet, type });
  const score = estimateScore({ tytNet, aytNet, type, obp });
  return {
    rank,
    score,
    scoreFormatted: score.toFixed(1).replace(".", ","),
    rankBand: formatRankBand(rank),
  };
}

export const RANKING_DISCLAIMER =
  "YÖK Atlas ve ÖSYM verilerine dayalı tahmindir; sınav zorluğuna göre gerçek sıralama değişebilir.";
