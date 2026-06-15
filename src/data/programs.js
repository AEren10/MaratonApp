// Bölüm/üniversite hedefleri — 2024 YKS yaklaşık başarı sıraları.
//
// Kaynak: YÖK Atlas / ÖSYM 2024 yerleştirme verileri (kaba veriler, her yıl değişir).
// Çoğu değer gerçek 2024 başarı sırasıdır; "ort." (ortalama) etiketli satırlar o bölümün
// alt-orta seviye devlet üniversiteleri için yaklaşık değerdir.
// rank = bölüme girmek için gereken yaklaşık başarı sırası (küçük = daha zor).
// category: arama/filtreleme için ana kategori.

export const PROGRAM_CATEGORIES = [
  { id: "tip",    name: "Tıp & Sağlık",   icon: "activity",  color: "red"    },
  { id: "muh",    name: "Mühendislik",    icon: "hash",      color: "blue"   },
  { id: "fen",    name: "Fen",            icon: "zap",       color: "teal"   },
  { id: "hukuk",  name: "Hukuk",          icon: "shield",    color: "amber"  },
  { id: "isl",    name: "İşletme & Eko.", icon: "chart",     color: "green"  },
  { id: "sos",    name: "Sosyal Bilim",   icon: "users",     color: "purple" },
  { id: "ogr",    name: "Öğretmenlik",    icon: "bookOpen",  color: "pink"   },
  { id: "san",    name: "Sanat & Tasarım",icon: "edit",      color: "coral"  },
  { id: "dil",    name: "Dil & Edebiyat", icon: "globe",     color: "blue"   },
  { id: "spor",   name: "Spor",           icon: "target",    color: "green"  },
];

export const PROGRAMS = [
  // === Tıp & Sağlık (SAY) ===
  { id: "tip_cerrahpasa",  name: "Tıp",                 uni: "İÜ-Cerrahpaşa (İng)",  type: "say", category: "tip", rank: 419 },
  { id: "tip_hacettepe",   name: "Tıp",                 uni: "Hacettepe",            type: "say", category: "tip", rank: 1600 },
  { id: "tip_istanbul",    name: "Tıp",                 uni: "İstanbul (Çapa)",      type: "say", category: "tip", rank: 2000 },
  { id: "tip_marmara",     name: "Tıp",                 uni: "Marmara",              type: "say", category: "tip", rank: 4500 },
  { id: "tip_dokuz",       name: "Tıp",                 uni: "Dokuz Eylül",          type: "say", category: "tip", rank: 6800 },
  { id: "tip_ege",         name: "Tıp",                 uni: "Ege",                  type: "say", category: "tip", rank: 7200 },
  { id: "tip_gazi",        name: "Tıp",                 uni: "Gazi",                 type: "say", category: "tip", rank: 8500 },
  { id: "tip_devlet",      name: "Tıp",                 uni: "Devlet (ort.)",        type: "say", category: "tip", rank: 50000 },
  { id: "dis_hacettepe",   name: "Diş Hekimliği",       uni: "Hacettepe",            type: "say", category: "tip", rank: 11000 },
  { id: "dis_istanbul",    name: "Diş Hekimliği",       uni: "İstanbul",             type: "say", category: "tip", rank: 13000 },
  { id: "dis_devlet",      name: "Diş Hekimliği",       uni: "Devlet (ort.)",        type: "say", category: "tip", rank: 45000 },
  { id: "ecz_hacettepe",   name: "Eczacılık",           uni: "Hacettepe",            type: "say", category: "tip", rank: 25000 },
  { id: "ecz_devlet",      name: "Eczacılık",           uni: "Devlet (ort.)",        type: "say", category: "tip", rank: 110000 },
  { id: "vet_devlet",      name: "Veteriner",           uni: "Devlet (ort.)",        type: "say", category: "tip", rank: 220000 },
  { id: "hemsirelik",      name: "Hemşirelik",          uni: "Devlet (ort.)",        type: "say", category: "tip", rank: 300000 },
  { id: "fizyoterapi",     name: "Fizyoterapi",         uni: "Devlet (ort.)",        type: "say", category: "tip", rank: 180000 },
  { id: "diyetisyenlik",   name: "Beslenme & Diyetetik", uni: "Devlet (ort.)",       type: "say", category: "tip", rank: 200000 },
  { id: "saglik_yon",      name: "Sağlık Yönetimi",     uni: "Devlet (ort.)",        type: "say", category: "tip", rank: 400000 },

  // === Mühendislik (SAY) ===
  { id: "bilg_koc",        name: "Bilgisayar Müh.",     uni: "Koç (Burslu)",         type: "say", category: "muh", rank: 122 },
  { id: "bilg_bogazici",   name: "Bilgisayar Müh.",     uni: "Boğaziçi",             type: "say", category: "muh", rank: 342 },
  { id: "bilg_odtu",       name: "Bilgisayar Müh.",     uni: "ODTÜ",                 type: "say", category: "muh", rank: 1200 },
  { id: "bilg_itu",        name: "Bilgisayar Müh.",     uni: "İTÜ",                  type: "say", category: "muh", rank: 3500 },
  { id: "bilg_hacettepe",  name: "Bilgisayar Müh.",     uni: "Hacettepe",            type: "say", category: "muh", rank: 6500 },
  { id: "bilg_ytu",        name: "Bilgisayar Müh.",     uni: "Yıldız Teknik",        type: "say", category: "muh", rank: 10000 },
  { id: "bilg_gazi",       name: "Bilgisayar Müh.",     uni: "Gazi",                 type: "say", category: "muh", rank: 16000 },
  { id: "bilg_devlet",     name: "Bilgisayar Müh.",     uni: "Devlet (ort.)",        type: "say", category: "muh", rank: 110000 },
  { id: "yazilim_devlet",  name: "Yazılım Müh.",        uni: "Devlet (ort.)",        type: "say", category: "muh", rank: 130000 },
  { id: "yapay_zeka",      name: "Yapay Zeka Müh.",     uni: "Devlet (ort.)",        type: "say", category: "muh", rank: 90000 },
  { id: "elektrik_bogazici", name: "Elektrik-Elek. Müh.", uni: "Boğaziçi",           type: "say", category: "muh", rank: 1800 },
  { id: "elektrik_itu",    name: "Elektrik-Elek. Müh.", uni: "İTÜ",                  type: "say", category: "muh", rank: 15000 },
  { id: "elektrik_devlet", name: "Elektrik-Elek. Müh.", uni: "Devlet (ort.)",        type: "say", category: "muh", rank: 200000 },
  { id: "endustri_bogazici", name: "Endüstri Müh.",     uni: "Boğaziçi",             type: "say", category: "muh", rank: 3000 },
  { id: "endustri_itu",    name: "Endüstri Müh.",       uni: "İTÜ",                  type: "say", category: "muh", rank: 10000 },
  { id: "endustri_devlet", name: "Endüstri Müh.",       uni: "Devlet (ort.)",        type: "say", category: "muh", rank: 120000 },
  { id: "makine_itu",      name: "Makine Müh.",         uni: "İTÜ",                  type: "say", category: "muh", rank: 30000 },
  { id: "makine_devlet",   name: "Makine Müh.",         uni: "Devlet (ort.)",        type: "say", category: "muh", rank: 180000 },
  { id: "insaat_itu",      name: "İnşaat Müh.",         uni: "İTÜ",                  type: "say", category: "muh", rank: 35000 },
  { id: "insaat_devlet",   name: "İnşaat Müh.",         uni: "Devlet (ort.)",        type: "say", category: "muh", rank: 250000 },
  { id: "kimya_itu",       name: "Kimya Müh.",          uni: "İTÜ",                  type: "say", category: "muh", rank: 40000 },
  { id: "kimya_devlet",    name: "Kimya Müh.",          uni: "Devlet (ort.)",        type: "say", category: "muh", rank: 250000 },
  { id: "uzay_havacilik",  name: "Uzay & Havacılık Müh.", uni: "İTÜ",                type: "say", category: "muh", rank: 8000 },
  { id: "biyom_devlet",    name: "Biyomedikal Müh.",    uni: "Devlet (ort.)",        type: "say", category: "muh", rank: 100000 },
  { id: "gida_devlet",     name: "Gıda Müh.",           uni: "Devlet (ort.)",        type: "say", category: "muh", rank: 300000 },
  { id: "cevre_devlet",    name: "Çevre Müh.",          uni: "Devlet (ort.)",        type: "say", category: "muh", rank: 320000 },

  // === Fen (SAY) ===
  { id: "fizik_devlet",    name: "Fizik",               uni: "Devlet (ort.)",        type: "say", category: "fen", rank: 400000 },
  { id: "kimya_devlet_l",  name: "Kimya (Lisans)",      uni: "Devlet (ort.)",        type: "say", category: "fen", rank: 450000 },
  { id: "matematik_l",     name: "Matematik",           uni: "Devlet (ort.)",        type: "say", category: "fen", rank: 300000 },
  { id: "biyoloji_devlet", name: "Biyoloji",            uni: "Devlet (ort.)",        type: "say", category: "fen", rank: 380000 },
  { id: "istatistik",      name: "İstatistik",          uni: "Devlet (ort.)",        type: "say", category: "fen", rank: 350000 },
  { id: "molekuler",       name: "Moleküler Biyoloji",  uni: "Devlet (ort.)",        type: "say", category: "fen", rank: 250000 },
  { id: "bilg_prog",       name: "Bilgisayar Prog.",    uni: "Devlet (ort.)",        type: "say", category: "fen", rank: 200000 },
  { id: "yazilim_gel",     name: "Yazılım Geliştirme",  uni: "Devlet (ort.)",        type: "say", category: "fen", rank: 220000 },

  // === Hukuk (EA) ===
  { id: "hukuk_galatasaray", name: "Hukuk",             uni: "Galatasaray",          type: "ea", category: "hukuk", rank: 340 },
  { id: "hukuk_ankara",    name: "Hukuk",               uni: "Ankara",               type: "ea", category: "hukuk", rank: 3242 },
  { id: "hukuk_hacettepe", name: "Hukuk",               uni: "Hacettepe",            type: "ea", category: "hukuk", rank: 4090 },
  { id: "hukuk_istanbul",  name: "Hukuk",               uni: "İstanbul",             type: "ea", category: "hukuk", rank: 4539 },
  { id: "hukuk_marmara",   name: "Hukuk",               uni: "Marmara",              type: "ea", category: "hukuk", rank: 6174 },
  { id: "hukuk_ozel",      name: "Hukuk",               uni: "Vakıf (ort. burslu)",  type: "ea", category: "hukuk", rank: 12000 },
  { id: "hukuk_devlet",    name: "Hukuk",               uni: "Devlet (ort.)",        type: "ea", category: "hukuk", rank: 55000 },

  // === İşletme & Eko (EA) ===
  { id: "isletme_bogazici", name: "İşletme",            uni: "Boğaziçi",             type: "ea", category: "isl", rank: 5000 },
  { id: "isletme_koc",     name: "İşletme",             uni: "Koç (Burslu)",         type: "ea", category: "isl", rank: 800 },
  { id: "isletme_itu",     name: "İşletme",             uni: "İTÜ",                  type: "ea", category: "isl", rank: 25000 },
  { id: "isletme_devlet",  name: "İşletme",             uni: "Devlet (ort.)",        type: "ea", category: "isl", rank: 150000 },
  { id: "iktisat_bogazici", name: "İktisat",            uni: "Boğaziçi",             type: "ea", category: "isl", rank: 6000 },
  { id: "iktisat_itu",     name: "İktisat",             uni: "İTÜ",                  type: "ea", category: "isl", rank: 30000 },
  { id: "iktisat_devlet",  name: "İktisat",             uni: "Devlet (ort.)",        type: "ea", category: "isl", rank: 200000 },
  { id: "maliye_devlet",   name: "Maliye",              uni: "Devlet (ort.)",        type: "ea", category: "isl", rank: 250000 },
  { id: "uluslararasi",    name: "Uluslararası İlişk.", uni: "Devlet (ort.)",        type: "ea", category: "isl", rank: 110000 },
  { id: "calisma_eko",     name: "Çalışma Eko.",        uni: "Devlet (ort.)",        type: "ea", category: "isl", rank: 280000 },
  { id: "bankacilik",      name: "Bankacılık & Finans", uni: "Devlet (ort.)",        type: "ea", category: "isl", rank: 220000 },

  // === Sosyal Bilim ===
  { id: "psik_bogazici",   name: "Psikoloji",           uni: "Boğaziçi",             type: "ea",  category: "sos", rank: 3000 },
  { id: "psik_koc",        name: "Psikoloji",           uni: "Koç (Burslu)",         type: "ea",  category: "sos", rank: 1200 },
  { id: "psik_itu",        name: "Psikoloji",           uni: "İTÜ",                  type: "ea",  category: "sos", rank: 15000 },
  { id: "psik_devlet",     name: "Psikoloji",           uni: "Devlet (ort.)",        type: "ea",  category: "sos", rank: 80000 },
  { id: "sosyoloji",       name: "Sosyoloji",           uni: "Devlet (ort.)",        type: "soz", category: "sos", rank: 120000 },
  { id: "felsefe",         name: "Felsefe",             uni: "Devlet (ort.)",        type: "soz", category: "sos", rank: 150000 },
  { id: "antropoloji",     name: "Antropoloji",         uni: "Devlet (ort.)",        type: "soz", category: "sos", rank: 180000 },
  { id: "siyaset",         name: "Siyaset Bilimi",      uni: "Devlet (ort.)",        type: "ea",  category: "sos", rank: 90000 },
  { id: "kamu_yon",        name: "Kamu Yönetimi",       uni: "Devlet (ort.)",        type: "ea",  category: "sos", rank: 200000 },

  // === Öğretmenlik ===
  { id: "sinif_devlet",    name: "Sınıf Öğretmenliği",  uni: "Devlet (ort.)",        type: "soz", category: "ogr", rank: 130000 },
  { id: "okul_oncesi",     name: "Okul Öncesi Öğret.",  uni: "Devlet (ort.)",        type: "soz", category: "ogr", rank: 150000 },
  { id: "rehberlik",       name: "Rehberlik & PDR",     uni: "Devlet (ort.)",        type: "ea",  category: "ogr", rank: 70000 },
  { id: "matematik_ogr",   name: "Matematik Öğret.",    uni: "Devlet (ort.)",        type: "say", category: "ogr", rank: 250000 },
  { id: "fen_ogr",         name: "Fen Bilg. Öğret.",    uni: "Devlet (ort.)",        type: "say", category: "ogr", rank: 280000 },
  { id: "ingilizce_ogr",   name: "İngilizce Öğret.",    uni: "Devlet (ort.)",        type: "dil", category: "ogr", rank: 30000 },
  { id: "turkce_ogr",      name: "Türkçe Öğret.",       uni: "Devlet (ort.)",        type: "soz", category: "ogr", rank: 100000 },
  { id: "tarih_ogr",       name: "Tarih Öğret.",        uni: "Devlet (ort.)",        type: "soz", category: "ogr", rank: 150000 },
  { id: "ilahiyat",        name: "İlahiyat",            uni: "Devlet (ort.)",        type: "soz", category: "ogr", rank: 200000 },

  // === Sanat & Tasarım ===
  { id: "mimarlik_itu",    name: "Mimarlık",            uni: "İTÜ",                  type: "say", category: "san", rank: 12000 },
  { id: "mimarlik_devlet", name: "Mimarlık",            uni: "Devlet (ort.)",        type: "say", category: "san", rank: 100000 },
  { id: "ic_mimarlik",     name: "İç Mimarlık",         uni: "Devlet (ort.)",        type: "say", category: "san", rank: 150000 },
  { id: "endustri_tas",    name: "Endüstri Tasarımı",   uni: "Devlet (ort.)",        type: "say", category: "san", rank: 80000 },
  { id: "sehir_planlama",  name: "Şehir Planlama",      uni: "Devlet (ort.)",        type: "ea",  category: "san", rank: 180000 },
  { id: "gorsel_iletisim", name: "Görsel İletişim Tas.", uni: "Devlet (ort.)",       type: "soz", category: "san", rank: 90000 },
  { id: "grafik_tas",      name: "Grafik Tasarım",      uni: "Devlet (ort.)",        type: "soz", category: "san", rank: 100000 },
  { id: "moda_tas",        name: "Moda Tasarımı",       uni: "Devlet (ort.)",        type: "soz", category: "san", rank: 250000 },
  { id: "muzik",           name: "Müzik / Müzikoloji",  uni: "Devlet (ort.)",        type: "soz", category: "san", rank: 200000 },

  // === Dil & Edebiyat ===
  { id: "ing_filoloji",    name: "İngiliz Dili & Edeb.", uni: "Devlet (ort.)",       type: "dil", category: "dil", rank: 40000 },
  { id: "amer_kult",       name: "Amerikan Kültürü",    uni: "Devlet (ort.)",        type: "dil", category: "dil", rank: 50000 },
  { id: "muterc_terc_ing", name: "Mütercim-Terc. (İng)", uni: "Devlet (ort.)",       type: "dil", category: "dil", rank: 25000 },
  { id: "muterc_terc_alm", name: "Mütercim-Terc. (Alm)", uni: "Devlet (ort.)",       type: "dil", category: "dil", rank: 80000 },
  { id: "muterc_terc_fra", name: "Mütercim-Terc. (Fra)", uni: "Devlet (ort.)",       type: "dil", category: "dil", rank: 110000 },
  { id: "alman_dili",      name: "Alman Dili & Edeb.",  uni: "Devlet (ort.)",        type: "dil", category: "dil", rank: 130000 },
  { id: "turk_dili",       name: "Türk Dili & Edeb.",   uni: "Devlet (ort.)",        type: "soz", category: "dil", rank: 80000 },
  { id: "iletisim",        name: "İletişim / Gazetec.", uni: "Devlet (ort.)",        type: "soz", category: "dil", rank: 130000 },
  { id: "halkla_iliskiler", name: "Halkla İlişkiler",   uni: "Devlet (ort.)",        type: "soz", category: "dil", rank: 160000 },
  { id: "yeni_medya",      name: "Yeni Medya",          uni: "Devlet (ort.)",        type: "soz", category: "dil", rank: 200000 },
  { id: "radyo_tv",        name: "Radyo TV & Sinema",   uni: "Devlet (ort.)",        type: "soz", category: "dil", rank: 230000 },

  // === Spor ===
  { id: "antren",          name: "Antrenörlük",         uni: "Devlet (ort.)",        type: "soz", category: "spor", rank: 300000 },
  { id: "beden_egitimi",   name: "Beden Eğt. & Öğret.", uni: "Devlet (ort.)",        type: "soz", category: "spor", rank: 280000 },
  { id: "spor_yon",        name: "Spor Yöneticiliği",   uni: "Devlet (ort.)",        type: "ea",  category: "spor", rank: 320000 },
];

export function getProgramById(id) {
  return PROGRAMS.find((p) => p.id === id) || null;
}

export function searchPrograms(query, { type = null, category = null } = {}) {
  const q = (query || "").trim().toLocaleLowerCase("tr");
  return PROGRAMS.filter((p) => {
    if (type && p.type !== type) return false;
    if (category && p.category !== category) return false;
    if (!q) return true;
    return (
      p.name.toLocaleLowerCase("tr").includes(q) ||
      p.uni.toLocaleLowerCase("tr").includes(q)
    );
  });
}

export const PROGRAMS_DISCLAIMER =
  "2024 YÖK Atlas başarı sıralarına dayalı; 'ort.' satırları yaklaşıktır. Her yıl değişir.";
