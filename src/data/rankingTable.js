// Net → tahmini başarı sırası tablosu.
//
// Kaynak: 2024 YKS gerçek anchor noktaları (YÖK Atlas / ÖSYM, web araştırması Haziran 2026)
// üzerinden kalibre edildi. Örnek gerçek referanslar:
//   - Tıp tepe (Cerrahpaşa İng ~419, Hacettepe ~1.600) → ~78+ AYT SAY net + ~115 TYT
//   - ~70 AYT SAY net + iyi TYT → ~15.000 sıralama
//   - Hukuk: Ankara 3.242 / İstanbul 4.539 / Marmara 6.174 (gerçek 2024)
// Net→puan→sıralama dönüşümü resmi formülle birebir değildir; tahmini yön verir.

// Puan türüne göre AYT ağırlığı (TYT 120, AYT ~80 soru).
const AYT_WEIGHT = { say: 1.25, ea: 1.2, soz: 1.15 };

// Birleşik "skor" = tytNet + aytNet * ağırlık.
export function combinedScore({ tytNet = 0, aytNet = 0, type = "say" }) {
  return tytNet + aytNet * (AYT_WEIGHT[type] || 1.2);
}

// Skor → tahmini sıralama çapaları (2024 gerçek noktalarına kalibre, azalan skor).
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
};

// İki çapa arasında log(sıralama) üzerinden enterpolasyon.
export function estimateRank({ tytNet = 0, aytNet = 0, type = "say" }) {
  const score = combinedScore({ tytNet, aytNet, type });
  const anchors = ANCHORS[type] || ANCHORS.say;

  if (score >= anchors[0][0]) return anchors[0][1];
  const last = anchors[anchors.length - 1];
  if (score <= last[0]) return last[1];

  for (let i = 0; i < anchors.length - 1; i++) {
    const [s1, r1] = anchors[i];
    const [s2, r2] = anchors[i + 1];
    if (score <= s1 && score >= s2) {
      const t = (s1 - score) / (s1 - s2); // 0..1
      const logR = Math.log(r1) + t * (Math.log(r2) - Math.log(r1));
      return Math.round(Math.exp(logR));
    }
  }
  return last[1];
}

export const RANKING_DISCLAIMER =
  "2024 YKS verilerine kalibre tahmindir; resmi sıralama değildir, yön verir.";
