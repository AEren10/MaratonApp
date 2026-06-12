// D) Popüler bölüm/üniversite hedefleri — yaklaşık 2024 giriş başarı sırası.
//
// ⚠️ YAKLAŞIK DEĞERLER. 2024 YKS taban başarı sıralarından yuvarlanmış tahminlerdir
// (kaynak: YÖK Atlas / ÖSYM 2024, yaklaşıklaştırılmış). Kesin değildir; her yıl değişir.
// rank = bölüme girmek için gereken yaklaşık başarı sırası (küçük = daha zor).

export const PROGRAMS = [
  // Tıp
  { id: "tip_hacettepe", name: "Tıp", uni: "Hacettepe", type: "say", rank: 3000 },
  { id: "tip_istanbul", name: "Tıp", uni: "İstanbul (Çapa)", type: "say", rank: 8000 },
  { id: "tip_devlet", name: "Tıp", uni: "Devlet (ortalama)", type: "say", rank: 45000 },
  { id: "dis_hek", name: "Diş Hekimliği", uni: "Devlet (ortalama)", type: "say", rank: 70000 },
  { id: "eczacilik", name: "Eczacılık", uni: "Devlet (ortalama)", type: "say", rank: 110000 },

  // Mühendislik (SAY)
  { id: "bilg_bogazici", name: "Bilgisayar Müh.", uni: "Boğaziçi", type: "say", rank: 3000 },
  { id: "bilg_odtu", name: "Bilgisayar Müh.", uni: "ODTÜ", type: "say", rank: 8000 },
  { id: "bilg_itu", name: "Bilgisayar Müh.", uni: "İTÜ", type: "say", rank: 12000 },
  { id: "bilg_devlet", name: "Bilgisayar Müh.", uni: "Devlet (ortalama)", type: "say", rank: 90000 },
  { id: "elektrik_itu", name: "Elektrik-Elektronik Müh.", uni: "İTÜ", type: "say", rank: 20000 },
  { id: "makine_devlet", name: "Makine Müh.", uni: "Devlet (ortalama)", type: "say", rank: 150000 },
  { id: "endustri_devlet", name: "Endüstri Müh.", uni: "Devlet (ortalama)", type: "say", rank: 120000 },
  { id: "insaat_devlet", name: "İnşaat Müh.", uni: "Devlet (ortalama)", type: "say", rank: 200000 },

  // Eşit Ağırlık (EA)
  { id: "hukuk_istanbul", name: "Hukuk", uni: "İstanbul", type: "ea", rank: 12000 },
  { id: "hukuk_devlet", name: "Hukuk", uni: "Devlet (ortalama)", type: "ea", rank: 60000 },
  { id: "isletme_bogazici", name: "İşletme", uni: "Boğaziçi", type: "ea", rank: 5000 },
  { id: "iktisat_bogazici", name: "İktisat", uni: "Boğaziçi", type: "ea", rank: 6000 },
  { id: "isletme_devlet", name: "İşletme", uni: "Devlet (ortalama)", type: "ea", rank: 130000 },
  { id: "psikoloji_devlet", name: "Psikoloji", uni: "Devlet (ortalama)", type: "ea", rank: 80000 },
  { id: "siyaset_devlet", name: "Siyaset Bilimi / Uİ", uni: "Devlet (ortalama)", type: "ea", rank: 90000 },

  // Sözel (SOZ)
  { id: "ogretmenlik_devlet", name: "Sınıf Öğretmenliği", uni: "Devlet (ortalama)", type: "soz", rank: 120000 },
  { id: "hukuk_soz", name: "Hukuk (SÖZ kont.)", uni: "Devlet (ortalama)", type: "soz", rank: 50000 },
  { id: "psikoloji_soz", name: "Tarih / Edebiyat", uni: "Devlet (ortalama)", type: "soz", rank: 150000 },
];

export function getProgramById(id) {
  return PROGRAMS.find((p) => p.id === id) || null;
}

export const PROGRAMS_DISCLAIMER =
  "Bölüm sıralamaları yaklaşık 2024 değerleridir, kesin taban değildir.";
