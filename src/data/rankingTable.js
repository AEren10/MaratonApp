// D) Net → tahmini başarı sırası tablosu.
//
// ⚠️ YAKLAŞIK DEĞERLER. Bunlar ÖSYM'nin resmi net→sıralama tablosu DEĞİLDİR.
// 2024 YKS genel eğilimlerine dayalı kaba tahminlerdir (kaynak: ÖSYM 2024
// yerleştirme istatistikleri + YÖK Atlas genel dağılımları, yaklaşıklaştırılmış).
// Gerçek sıralama; puan türü, baraj, OBP ve yıl bazında değişir.
// Amaç: kullanıcıya "şu kadar net daha → kabaca şu sıralama" hissi vermek.

// Puan türüne göre AYT ağırlığı (TYT 120, AYT ~80 soru).
const AYT_WEIGHT = { say: 1.25, ea: 1.2, soz: 1.15 };

// Birleşik "skor" = tytNet + aytNet * ağırlık.
export function combinedScore({ tytNet = 0, aytNet = 0, type = "say" }) {
  return tytNet + aytNet * (AYT_WEIGHT[type] || 1.2);
}

// Skor → tahmini sıralama çapaları (2024 yaklaşık). Skor azaldıkça sıralama büyür.
// [skor, sıralama] çiftleri (azalan skor).
const ANCHORS = {
  say: [
    [205, 60], [195, 300], [185, 1000], [170, 5000], [155, 15000],
    [140, 40000], [125, 90000], [110, 160000], [95, 280000], [80, 450000], [60, 750000],
  ],
  ea: [
    [200, 80], [188, 500], [175, 2000], [160, 8000], [145, 25000],
    [130, 60000], [115, 130000], [100, 230000], [85, 380000], [70, 600000], [50, 850000],
  ],
  soz: [
    [195, 100], [182, 700], [168, 3000], [152, 12000], [138, 35000],
    [122, 80000], [108, 160000], [92, 280000], [78, 430000], [62, 650000], [45, 900000],
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
  "Yaklaşık değerler — 2024 ÖSYM verilerine dayalı tahmindir, resmi sıralama değildir.";
