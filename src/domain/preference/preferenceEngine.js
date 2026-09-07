import { RANK_BARRIERS, blockedFields } from "../../data/yksScoring";

// TERCİH LİSTESİ MOTORU
//
// Tasarım AKIŞ 12: "Hedef Seç → Bölümler → Tercih Listesi".
//
// Neden sıralama tabanlı: sınav zorluğu her yıl değiştiği için TABAN PUAN
// oynar, ama bir bölümün istediği BAŞARI SIRASI çok daha kararlı kalır
// (YÖK Atlas verisi bunu gösteriyor). Bu yüzden karşılaştırma puanla değil
// sıralamayla yapılıyor.
//
// KAYNAK: bkz. src/data/yksScoring.js dosya başı — ÖSYM ve YÖK Atlas.

// Bölüm kategorisi → hangi baraja tabi.
//
// "tip" kategorisi BİLEREK YOK. O kategoride Tıp'ın yanı sıra Hemşirelik,
// Fizyoterapi, Veteriner, Beslenme & Diyetetik ve Sağlık Yönetimi de var;
// bunların hiçbiri Tıp'ın 50.000 barajına tabi değil. Kategoriye bakarak
// baraj uygulamak 200.000 sıralamalı öğrenciye "Hemşirelik'e giremezsin"
// derdi — yanlış engel, eksik uyarıdan zararlı.
// Tıp/Diş/Eczacılık aşağıda TAM İSİMLE eşleştiriliyor.
const CATEGORY_BARRIER = {
  hukuk: "hukuk",
  muh: "muhendislik",
  ogr: "ogretmenlik",
};

// Mühendislik barajının kapsamadığı dallar (YÖK istisnası).
const ENGINEERING_EXEMPT = ["orman", "ziraat", "su ürünleri"];

/** Bir programın tabi olduğu baraj (varsa). */
export function barrierFor(program) {
  if (!program) return null;
  // Ad bazlı özel durumlar: kategori "tip" altında diş ve eczacılık da var.
  //
  // Eşleşme TAM olmalı. "İç Mimarlık" da "mimarlık" içeriyor ama Mimarlık
  // barajına tabi olduğu doğrulanmadı; emin olmadığımız yerde baraj UYGULAMAYIZ.
  // Yanlış "baraj engeli" göstermek, öğrenciye giremeyeceği yanlış bilgisini
  // verir — eksik uyarıdan daha zararlı.
  const name = (program.name || "").trim().toLocaleLowerCase("tr");
  if (name === "tıp") return RANK_BARRIERS.tip;
  if (name === "diş hekimliği") return RANK_BARRIERS.dis;
  if (name === "eczacılık") return RANK_BARRIERS.eczacilik;
  if (name === "mimarlık") return RANK_BARRIERS.mimarlik;
  const key = CATEGORY_BARRIER[program.category];
  if (!key) return null;
  if (key === "muhendislik" && ENGINEERING_EXEMPT.some((x) => name.includes(x))) return null;
  return RANK_BARRIERS[key];
}

/**
 * Bir programın kullanıcının sıralamasına göre durumu.
 *
 * "blocked" ile "reach" ARASINDAKİ FARK ÖNEMLİ:
 *   blocked → baraj nedeniyle tercih listesine EKLENEMEZ (resmi kural)
 *   reach   → eklenebilir ama sıralaman şu an yetmiyor (hedef olabilir)
 * Bu ikisini karıştırmak öğrenciye yanlış umut ya da yanlış vazgeçme verir.
 */
export function classifyProgram(program, currentRank) {
  if (!program) return null;
  const target = Number(program.rank) || null;
  const barrier = barrierFor(program);

  if (!currentRank || !target) {
    return { status: "unknown", program, barrier, gap: null };
  }

  if (barrier && currentRank > barrier.limit) {
    return {
      status: "blocked",
      program,
      barrier,
      gap: currentRank - barrier.limit,
      reason: `${barrier.label} için ilk ${barrier.limit.toLocaleString("tr-TR")} şartı var`,
    };
  }

  const ratio = currentRank / target;
  let status;
  if (ratio <= 0.8) status = "safe";        // sıralaman bölümün epey önünde
  else if (ratio <= 1.05) status = "target"; // sınırda — asıl hedef bandı
  else if (ratio <= 1.6) status = "reach";   // uzak ama ulaşılabilir
  else status = "far";

  return {
    status,
    program,
    barrier,
    gap: currentRank - target,
    ratio: Math.round(ratio * 100) / 100,
  };
}

/**
 * Tercih listesi önerisi.
 *
 * Klasik tercih stratejisi: listenin başına iddialı, ortasına hedef, sonuna
 * garanti tercihler konur. Hepsini "garanti"den seçmek düşük, hepsini
 * "iddialı"dan seçmek açıkta kalma riski demektir.
 */
export function buildPreferenceList(programs = [], currentRank, { size = 24 } = {}) {
  const classified = programs
    .map((p) => classifyProgram(p, currentRank))
    .filter((c) => c && c.status !== "unknown");

  const eligible = classified.filter((c) => c.status !== "blocked" && c.status !== "far");
  const blocked = classified.filter((c) => c.status === "blocked");

  const byRank = (a, b) => (a.program.rank || 0) - (b.program.rank || 0);
  const reach = eligible.filter((c) => c.status === "reach").sort(byRank);
  const target = eligible.filter((c) => c.status === "target").sort(byRank);
  const safe = eligible.filter((c) => c.status === "safe").sort(byRank);

  // Oran: %25 iddialı, %45 hedef, %30 garanti.
  const nReach = Math.round(size * 0.25);
  const nTarget = Math.round(size * 0.45);
  const nSafe = size - nReach - nTarget;

  const list = [
    ...reach.slice(0, nReach),
    ...target.slice(0, nTarget),
    ...safe.slice(0, nSafe),
  ];

  return {
    list,
    counts: {
      reach: Math.min(reach.length, nReach),
      target: Math.min(target.length, nTarget),
      safe: Math.min(safe.length, nSafe),
      blocked: blocked.length,
    },
    blocked,
    // Liste hedeflenen uzunluğa ulaşmadıysa açıkça söyle.
    incomplete: list.length < size,
    available: { reach: reach.length, target: target.length, safe: safe.length },
  };
}

/** Sıralamanın kapattığı alanlar — kullanıcıya dürüst uyarı. */
export function barrierWarnings(currentRank) {
  return blockedFields(currentRank);
}

export const PREFERENCE_STATUS_LABELS = {
  safe: "Garanti",
  target: "Hedef",
  reach: "İddialı",
  far: "Şu an uzak",
  blocked: "Baraj engeli",
  unknown: "Veri yok",
};
