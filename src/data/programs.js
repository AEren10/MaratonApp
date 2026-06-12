// Bölüm/üniversite hedefleri — 2024 YKS başarı sıraları.
//
// Kaynak: YÖK Atlas / ÖSYM 2024 yerleştirme verileri (web araştırması, Haziran 2026).
// Çoğu değer gerçek 2024 başarı sırasıdır; "ort." (ortalama) etiketli satırlar o bölümün
// alt-orta seviye devlet üniversiteleri için yaklaşık değerdir. Her yıl değişir.
// rank = bölüme girmek için gereken yaklaşık başarı sırası (küçük = daha zor).

export const PROGRAMS = [
  // --- Tıp / Sağlık (SAY) ---
  { id: "tip_cerrahpasa", name: "Tıp", uni: "İÜ-Cerrahpaşa (İng)", type: "say", rank: 419 },
  { id: "tip_hacettepe", name: "Tıp", uni: "Hacettepe", type: "say", rank: 1600 },
  { id: "tip_istanbul", name: "Tıp", uni: "İstanbul (Çapa)", type: "say", rank: 2000 },
  { id: "tip_devlet", name: "Tıp", uni: "Devlet (ort.)", type: "say", rank: 50000 },
  { id: "dis_istanbul", name: "Diş Hekimliği", uni: "İstanbul", type: "say", rank: 13000 },
  { id: "dis_devlet", name: "Diş Hekimliği", uni: "Devlet (ort.)", type: "say", rank: 45000 },
  { id: "eczacilik_devlet", name: "Eczacılık", uni: "Devlet (ort.)", type: "say", rank: 110000 },

  // --- Mühendislik (SAY) ---
  { id: "bilg_koc", name: "Bilgisayar Müh.", uni: "Koç (Burslu)", type: "say", rank: 122 },
  { id: "bilg_bogazici", name: "Bilgisayar Müh.", uni: "Boğaziçi", type: "say", rank: 342 },
  { id: "bilg_odtu", name: "Bilgisayar Müh.", uni: "ODTÜ", type: "say", rank: 1200 },
  { id: "bilg_itu", name: "Bilgisayar Müh.", uni: "İTÜ", type: "say", rank: 3500 },
  { id: "bilg_hacettepe", name: "Bilgisayar Müh.", uni: "Hacettepe", type: "say", rank: 6500 },
  { id: "bilg_ytu", name: "Bilgisayar Müh.", uni: "Yıldız Teknik", type: "say", rank: 10000 },
  { id: "bilg_devlet", name: "Bilgisayar Müh.", uni: "Devlet (ort.)", type: "say", rank: 110000 },
  { id: "elektrik_itu", name: "Elektrik-Elektronik Müh.", uni: "İTÜ", type: "say", rank: 15000 },
  { id: "endustri_bogazici", name: "Endüstri Müh.", uni: "Boğaziçi", type: "say", rank: 3000 },
  { id: "endustri_devlet", name: "Endüstri Müh.", uni: "Devlet (ort.)", type: "say", rank: 120000 },
  { id: "makine_devlet", name: "Makine Müh.", uni: "Devlet (ort.)", type: "say", rank: 180000 },
  { id: "insaat_devlet", name: "İnşaat Müh.", uni: "Devlet (ort.)", type: "say", rank: 250000 },

  // --- Eşit Ağırlık (EA) ---
  { id: "hukuk_galatasaray", name: "Hukuk", uni: "Galatasaray", type: "ea", rank: 340 },
  { id: "hukuk_ankara", name: "Hukuk", uni: "Ankara", type: "ea", rank: 3242 },
  { id: "hukuk_hacettepe", name: "Hukuk", uni: "Hacettepe", type: "ea", rank: 4090 },
  { id: "hukuk_istanbul", name: "Hukuk", uni: "İstanbul", type: "ea", rank: 4539 },
  { id: "hukuk_marmara", name: "Hukuk", uni: "Marmara", type: "ea", rank: 6174 },
  { id: "hukuk_devlet", name: "Hukuk", uni: "Devlet (ort.)", type: "ea", rank: 55000 },
  { id: "isletme_bogazici", name: "İşletme", uni: "Boğaziçi", type: "ea", rank: 5000 },
  { id: "iktisat_bogazici", name: "İktisat", uni: "Boğaziçi", type: "ea", rank: 6000 },
  { id: "psikoloji_bogazici", name: "Psikoloji", uni: "Boğaziçi", type: "ea", rank: 3000 },
  { id: "psikoloji_devlet", name: "Psikoloji", uni: "Devlet (ort.)", type: "ea", rank: 80000 },
  { id: "isletme_devlet", name: "İşletme", uni: "Devlet (ort.)", type: "ea", rank: 150000 },

  // --- Sözel (SOZ) ---
  { id: "psikoloji_soz_devlet", name: "Tarih / Edebiyat", uni: "Devlet (ort.)", type: "soz", rank: 90000 },
  { id: "ogretmenlik_devlet", name: "Sınıf Öğretmenliği", uni: "Devlet (ort.)", type: "soz", rank: 130000 },
];

export function getProgramById(id) {
  return PROGRAMS.find((p) => p.id === id) || null;
}

export const PROGRAMS_DISCLAIMER =
  "2024 YÖK Atlas başarı sıralarına dayalı; 'ort.' satırları yaklaşıktır. Her yıl değişir.";
