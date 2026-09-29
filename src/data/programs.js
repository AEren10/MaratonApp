// Bölüm/üniversite hedefleri — 2024-2025 YKS yaklaşık başarı sıraları ve ortalama taban netleri.
//
// Kaynak: YÖK Atlas / ÖSYM yerleştirme verileri (Net Sihirbazı & Lisans Tercih Sihirbazı).
// rank = bölüme girmek için gereken yaklaşık başarı sırası (küçük = daha zor).
// tytNet = o bölüme yerleşen son adayın yaklaşık TYT neti.
// aytNet = o bölüme yerleşen son adayın yaklaşık AYT (veya YDT) neti.
// totalNet = tytNet + aytNet toplamı.

export const PROGRAM_CATEGORIES = [
  { id: "all",    name: "Tümü",           icon: "grid",      color: "gray"   },
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
  { id: "tip_cerrahpasa",  name: "Tıp",                 uni: "İÜ-Cerrahpaşa (İng)",  type: "say", category: "tip", rank: 419,    tytNet: 111, aytNet: 77, totalNet: 188 },
  { id: "tip_hacettepe",   name: "Tıp",                 uni: "Hacettepe",            type: "say", category: "tip", rank: 1600,   tytNet: 106, aytNet: 75, totalNet: 181 },
  { id: "tip_istanbul",    name: "Tıp",                 uni: "İstanbul (Çapa)",      type: "say", category: "tip", rank: 2000,   tytNet: 104, aytNet: 74, totalNet: 178 },
  { id: "tip_marmara",     name: "Tıp",                 uni: "Marmara",              type: "say", category: "tip", rank: 4500,   tytNet: 100, aytNet: 72, totalNet: 172 },
  { id: "tip_dokuz",       name: "Tıp",                 uni: "Dokuz Eylül",          type: "say", category: "tip", rank: 6800,   tytNet: 97,  aytNet: 70, totalNet: 167 },
  { id: "tip_ege",         name: "Tıp",                 uni: "Ege",                  type: "say", category: "tip", rank: 7200,   tytNet: 96,  aytNet: 70, totalNet: 166 },
  { id: "tip_gazi",        name: "Tıp",                 uni: "Gazi",                 type: "say", category: "tip", rank: 8500,   tytNet: 95,  aytNet: 69, totalNet: 164 },
  { id: "tip_devlet",      name: "Tıp",                 uni: "Devlet (ort.)",        type: "say", category: "tip", rank: 50000,  tytNet: 85,  aytNet: 58, totalNet: 143 },
  { id: "dis_hacettepe",   name: "Diş Hekimliği",       uni: "Hacettepe",            type: "say", category: "tip", rank: 11000,  tytNet: 93,  aytNet: 66, totalNet: 159 },
  { id: "dis_istanbul",    name: "Diş Hekimliği",       uni: "İstanbul",             type: "say", category: "tip", rank: 13000,  tytNet: 91,  aytNet: 65, totalNet: 156 },
  { id: "dis_devlet",      name: "Diş Hekimliği",       uni: "Devlet (ort.)",        type: "say", category: "tip", rank: 45000,  tytNet: 80,  aytNet: 52, totalNet: 132 },
  { id: "ecz_hacettepe",   name: "Eczacılık",           uni: "Hacettepe",            type: "say", category: "tip", rank: 25000,  tytNet: 86,  aytNet: 60, totalNet: 146 },
  { id: "ecz_devlet",      name: "Eczacılık",           uni: "Devlet (ort.)",        type: "say", category: "tip", rank: 110000, tytNet: 68,  aytNet: 40, totalNet: 108 },
  { id: "vet_devlet",      name: "Veteriner",           uni: "Devlet (ort.)",        type: "say", category: "tip", rank: 220000, tytNet: 55,  aytNet: 30, totalNet: 85 },
  { id: "hemsirelik",      name: "Hemşirelik",          uni: "Devlet (ort.)",        type: "say", category: "tip", rank: 300000, tytNet: 48,  aytNet: 25, totalNet: 73 },
  { id: "fizyoterapi",     name: "Fizyoterapi",         uni: "Devlet (ort.)",        type: "say", category: "tip", rank: 180000, tytNet: 60,  aytNet: 32, totalNet: 92 },
  { id: "diyetisyenlik",   name: "Beslenme & Diyetetik", uni: "Devlet (ort.)",       type: "say", category: "tip", rank: 200000, tytNet: 57,  aytNet: 30, totalNet: 87 },
  { id: "saglik_yon",      name: "Sağlık Yönetimi",     uni: "Devlet (ort.)",        type: "say", category: "tip", rank: 400000, tytNet: 44,  aytNet: 20, totalNet: 64 },

  // === Mühendislik (SAY) ===
  { id: "bilg_koc",        name: "Bilgisayar Müh.",     uni: "Koç (Burslu)",         type: "say", category: "muh", rank: 122,    tytNet: 113, aytNet: 78, totalNet: 191 },
  { id: "bilg_bogazici",   name: "Bilgisayar Müh.",     uni: "Boğaziçi",             type: "say", category: "muh", rank: 342,    tytNet: 111, aytNet: 77, totalNet: 188 },
  { id: "bilg_odtu",       name: "Bilgisayar Müh.",     uni: "ODTÜ",                 type: "say", category: "muh", rank: 1200,   tytNet: 107, aytNet: 75, totalNet: 182 },
  { id: "bilg_itu",        name: "Bilgisayar Müh.",     uni: "İTÜ",                  type: "say", category: "muh", rank: 3500,   tytNet: 102, aytNet: 73, totalNet: 175 },
  { id: "bilg_hacettepe",  name: "Bilgisayar Müh.",     uni: "Hacettepe",            type: "say", category: "muh", rank: 6500,   tytNet: 98,  aytNet: 69, totalNet: 167 },
  { id: "bilg_ytu",        name: "Bilgisayar Müh.",     uni: "Yıldız Teknik",        type: "say", category: "muh", rank: 10000,  tytNet: 94,  aytNet: 67, totalNet: 161 },
  { id: "bilg_gazi",       name: "Bilgisayar Müh.",     uni: "Gazi",                 type: "say", category: "muh", rank: 16000,  tytNet: 90,  aytNet: 63, totalNet: 153 },
  { id: "bilg_devlet",     name: "Bilgisayar Müh.",     uni: "Devlet (ort.)",        type: "say", category: "muh", rank: 110000, tytNet: 68,  aytNet: 38, totalNet: 106 },
  { id: "yazilim_devlet",  name: "Yazılım Müh.",        uni: "Devlet (ort.)",        type: "say", category: "muh", rank: 130000, tytNet: 65,  aytNet: 35, totalNet: 100 },
  { id: "yapay_zeka",      name: "Yapay Zeka Müh.",     uni: "Devlet (ort.)",        type: "say", category: "muh", rank: 90000,  tytNet: 72,  aytNet: 42, totalNet: 114 },
  { id: "elektrik_bogazici", name: "Elektrik-Elek. Müh.", uni: "Boğaziçi",           type: "say", category: "muh", rank: 1800,   tytNet: 105, aytNet: 74, totalNet: 179 },
  { id: "elektrik_itu",    name: "Elektrik-Elek. Müh.", uni: "İTÜ",                  type: "say", category: "muh", rank: 15000,  tytNet: 91,  aytNet: 64, totalNet: 155 },
  { id: "elektrik_devlet", name: "Elektrik-Elek. Müh.", uni: "Devlet (ort.)",        type: "say", category: "muh", rank: 200000, tytNet: 56,  aytNet: 30, totalNet: 86 },
  { id: "endustri_bogazici", name: "Endüstri Müh.",     uni: "Boğaziçi",             type: "say", category: "muh", rank: 3000,   tytNet: 103, aytNet: 73, totalNet: 176 },
  { id: "endustri_itu",    name: "Endüstri Müh.",       uni: "İTÜ",                  type: "say", category: "muh", rank: 10000,  tytNet: 94,  aytNet: 67, totalNet: 161 },
  { id: "endustri_devlet", name: "Endüstri Müh.",       uni: "Devlet (ort.)",        type: "say", category: "muh", rank: 120000, tytNet: 66,  aytNet: 37, totalNet: 103 },
  { id: "makine_itu",      name: "Makine Müh.",         uni: "İTÜ",                  type: "say", category: "muh", rank: 30000,  tytNet: 84,  aytNet: 58, totalNet: 142 },
  { id: "makine_devlet",   name: "Makine Müh.",         uni: "Devlet (ort.)",        type: "say", category: "muh", rank: 180000, tytNet: 58,  aytNet: 31, totalNet: 89 },
  { id: "insaat_itu",      name: "İnşaat Müh.",         uni: "İTÜ",                  type: "say", category: "muh", rank: 35000,  tytNet: 82,  aytNet: 56, totalNet: 138 },
  { id: "insaat_devlet",   name: "İnşaat Müh.",         uni: "Devlet (ort.)",        type: "say", category: "muh", rank: 250000, tytNet: 52,  aytNet: 27, totalNet: 79 },
  { id: "kimya_itu",       name: "Kimya Müh.",          uni: "İTÜ",                  type: "say", category: "muh", rank: 40000,  tytNet: 80,  aytNet: 54, totalNet: 134 },
  { id: "kimya_devlet",    name: "Kimya Müh.",          uni: "Devlet (ort.)",        type: "say", category: "muh", rank: 250000, tytNet: 52,  aytNet: 27, totalNet: 79 },
  { id: "uzay_havacilik",  name: "Uzay & Havacılık Müh.", uni: "İTÜ",                type: "say", category: "muh", rank: 8000,   tytNet: 96,  aytNet: 69, totalNet: 165 },
  { id: "biyom_devlet",    name: "Biyomedikal Müh.",    uni: "Devlet (ort.)",        type: "say", category: "muh", rank: 100000, tytNet: 70,  aytNet: 40, totalNet: 110 },
  { id: "gida_devlet",     name: "Gıda Müh.",           uni: "Devlet (ort.)",        type: "say", category: "muh", rank: 300000, tytNet: 48,  aytNet: 25, totalNet: 73 },
  { id: "cevre_devlet",    name: "Çevre Müh.",          uni: "Devlet (ort.)",        type: "say", category: "muh", rank: 320000, tytNet: 46,  aytNet: 24, totalNet: 70 },

  // === Fen (SAY) ===
  { id: "fizik_devlet",    name: "Fizik",               uni: "Devlet (ort.)",        type: "say", category: "fen", rank: 400000, tytNet: 44,  aytNet: 21, totalNet: 65 },
  { id: "kimya_devlet_l",  name: "Kimya (Lisans)",      uni: "Devlet (ort.)",        type: "say", category: "fen", rank: 450000, tytNet: 42,  aytNet: 19, totalNet: 61 },
  { id: "matematik_l",     name: "Matematik",           uni: "Devlet (ort.)",        type: "say", category: "fen", rank: 300000, tytNet: 48,  aytNet: 25, totalNet: 73 },
  { id: "biyoloji_devlet", name: "Biyoloji",            uni: "Devlet (ort.)",        type: "say", category: "fen", rank: 380000, tytNet: 45,  aytNet: 22, totalNet: 67 },
  { id: "istatistik",      name: "İstatistik",          uni: "Devlet (ort.)",        type: "say", category: "fen", rank: 350000, tytNet: 46,  aytNet: 23, totalNet: 69 },
  { id: "molekuler",       name: "Moleküler Biyoloji",  uni: "Devlet (ort.)",        type: "say", category: "fen", rank: 250000, tytNet: 52,  aytNet: 27, totalNet: 79 },
  { id: "bilg_prog",       name: "Bilgisayar Prog.",    uni: "Devlet (ort.)",        type: "say", category: "fen", rank: 200000, tytNet: 57,  aytNet: 30, totalNet: 87 },
  { id: "yazilim_gel",     name: "Yazılım Geliştirme",  uni: "Devlet (ort.)",        type: "say", category: "fen", rank: 220000, tytNet: 55,  aytNet: 29, totalNet: 84 },

  // === Hukuk (EA) ===
  { id: "hukuk_galatasaray", name: "Hukuk",             uni: "Galatasaray",          type: "ea", category: "hukuk", rank: 340,   tytNet: 101, aytNet: 68, totalNet: 169 },
  { id: "hukuk_ankara",    name: "Hukuk",               uni: "Ankara",               type: "ea", category: "hukuk", rank: 3242,  tytNet: 90,  aytNet: 60, totalNet: 150 },
  { id: "hukuk_hacettepe", name: "Hukuk",               uni: "Hacettepe",            type: "ea", category: "hukuk", rank: 4090,  tytNet: 88,  aytNet: 59, totalNet: 147 },
  { id: "hukuk_istanbul",  name: "Hukuk",               uni: "İstanbul",             type: "ea", category: "hukuk", rank: 4539,  tytNet: 87,  aytNet: 58, totalNet: 145 },
  { id: "hukuk_marmara",   name: "Hukuk",               uni: "Marmara",              type: "ea", category: "hukuk", rank: 6174,  tytNet: 85,  aytNet: 56, totalNet: 141 },
  { id: "hukuk_ozel",      name: "Hukuk",               uni: "Vakıf (ort. burslu)",  type: "ea", category: "hukuk", rank: 12000, tytNet: 80,  aytNet: 52, totalNet: 132 },
  { id: "hukuk_devlet",    name: "Hukuk",               uni: "Devlet (ort.)",        type: "ea", category: "hukuk", rank: 55000, tytNet: 68,  aytNet: 42, totalNet: 110 },

  // === İşletme & Eko (EA) ===
  { id: "isletme_bogazici", name: "İşletme",            uni: "Boğaziçi",             type: "ea", category: "isl", rank: 5000,   tytNet: 94,  aytNet: 63, totalNet: 157 },
  { id: "isletme_koc",     name: "İşletme",             uni: "Koç (Burslu)",         type: "ea", category: "isl", rank: 800,    tytNet: 102, aytNet: 67, totalNet: 169 },
  { id: "isletme_itu",     name: "İşletme",             uni: "İTÜ",                  type: "ea", category: "isl", rank: 25000,  tytNet: 84,  aytNet: 54, totalNet: 138 },
  { id: "isletme_devlet",  name: "İşletme",             uni: "Devlet (ort.)",        type: "ea", category: "isl", rank: 150000, tytNet: 56,  aytNet: 30, totalNet: 86 },
  { id: "iktisat_bogazici", name: "İktisat",            uni: "Boğaziçi",             type: "ea", category: "isl", rank: 6000,   tytNet: 93,  aytNet: 62, totalNet: 155 },
  { id: "iktisat_itu",     name: "İktisat",             uni: "İTÜ",                  type: "ea", category: "isl", rank: 30000,  tytNet: 82,  aytNet: 52, totalNet: 134 },
  { id: "iktisat_devlet",  name: "İktisat",             uni: "Devlet (ort.)",        type: "ea", category: "isl", rank: 200000, tytNet: 52,  aytNet: 27, totalNet: 79 },
  { id: "maliye_devlet",   name: "Maliye",              uni: "Devlet (ort.)",        type: "ea", category: "isl", rank: 250000, tytNet: 48,  aytNet: 24, totalNet: 72 },
  { id: "uluslararasi",    name: "Uluslararası İlişk.", uni: "Devlet (ort.)",        type: "ea", category: "isl", rank: 110000, tytNet: 62,  aytNet: 34, totalNet: 96 },
  { id: "calisma_eko",     name: "Çalışma Eko.",        uni: "Devlet (ort.)",        type: "ea", category: "isl", rank: 280000, tytNet: 47,  aytNet: 23, totalNet: 70 },
  { id: "bankacilik",      name: "Bankacılık & Finans", uni: "Devlet (ort.)",        type: "ea", category: "isl", rank: 220000, tytNet: 50,  aytNet: 26, totalNet: 76 },

  // === Sosyal Bilim ===
  { id: "psik_bogazici",   name: "Psikoloji",           uni: "Boğaziçi",             type: "ea",  category: "sos", rank: 3000,   tytNet: 96,  aytNet: 64, totalNet: 160 },
  { id: "psik_koc",        name: "Psikoloji",           uni: "Koç (Burslu)",         type: "ea",  category: "sos", rank: 1200,   tytNet: 100, aytNet: 66, totalNet: 166 },
  { id: "psik_itu",        name: "Psikoloji",           uni: "İTÜ",                  type: "ea",  category: "sos", rank: 15000,  tytNet: 88,  aytNet: 58, totalNet: 146 },
  { id: "psik_devlet",     name: "Psikoloji",           uni: "Devlet (ort.)",        type: "ea",  category: "sos", rank: 80000,  tytNet: 68,  aytNet: 40, totalNet: 108 },
  { id: "sosyoloji",       name: "Sosyoloji",           uni: "Devlet (ort.)",        type: "soz", category: "sos", rank: 120000, tytNet: 56,  aytNet: 40, totalNet: 96 },
  { id: "felsefe",         name: "Felsefe",             uni: "Devlet (ort.)",        type: "soz", category: "sos", rank: 150000, tytNet: 52,  aytNet: 36, totalNet: 88 },
  { id: "antropoloji",     name: "Antropoloji",         uni: "Devlet (ort.)",        type: "soz", category: "sos", rank: 180000, tytNet: 49,  aytNet: 33, totalNet: 82 },
  { id: "siyaset",         name: "Siyaset Bilimi",      uni: "Devlet (ort.)",        type: "ea",  category: "sos", rank: 90000,  tytNet: 65,  aytNet: 36, totalNet: 101 },
  { id: "kamu_yon",        name: "Kamu Yönetimi",       uni: "Devlet (ort.)",        type: "ea",  category: "sos", rank: 200000, tytNet: 52,  aytNet: 27, totalNet: 79 },

  // === Öğretmenlik ===
  { id: "sinif_devlet",    name: "Sınıf Öğretmenliği",  uni: "Devlet (ort.)",        type: "ea",  category: "ogr", rank: 130000, tytNet: 60,  aytNet: 42, totalNet: 102 },
  { id: "okul_oncesi",     name: "Okul Öncesi Öğret.",  uni: "Devlet (ort.)",        type: "soz", category: "ogr", rank: 150000, tytNet: 58,  aytNet: 40, totalNet: 98 },
  { id: "rehberlik",       name: "Rehberlik & PDR",     uni: "Devlet (ort.)",        type: "ea",  category: "ogr", rank: 70000,  tytNet: 70,  aytNet: 44, totalNet: 114 },
  { id: "matematik_ogr",   name: "Matematik Öğret.",    uni: "Devlet (ort.)",        type: "say", category: "ogr", rank: 250000, tytNet: 56,  aytNet: 30, totalNet: 86 },
  { id: "fen_ogr",         name: "Fen Bilg. Öğret.",    uni: "Devlet (ort.)",        type: "say", category: "ogr", rank: 280000, tytNet: 53,  aytNet: 28, totalNet: 81 },
  { id: "ingilizce_ogr",   name: "İngilizce Öğret.",    uni: "Devlet (ort.)",        type: "dil", category: "ogr", rank: 30000,  tytNet: 70,  aytNet: 68, totalNet: 138 },
  { id: "turkce_ogr",      name: "Türkçe Öğret.",       uni: "Devlet (ort.)",        type: "soz", category: "ogr", rank: 100000, tytNet: 64,  aytNet: 46, totalNet: 110 },
  { id: "tarih_ogr",       name: "Tarih Öğret.",        uni: "Devlet (ort.)",        type: "soz", category: "ogr", rank: 150000, tytNet: 56,  aytNet: 38, totalNet: 94 },
  { id: "ilahiyat",        name: "İlahiyat",            uni: "Devlet (ort.)",        type: "soz", category: "ogr", rank: 200000, tytNet: 50,  aytNet: 34, totalNet: 84 },

  // === Sanat & Tasarım ===
  { id: "mimarlik_itu",    name: "Mimarlık",            uni: "İTÜ",                  type: "say", category: "san", rank: 12000,  tytNet: 92,  aytNet: 65, totalNet: 157 },
  { id: "mimarlik_devlet", name: "Mimarlık",            uni: "Devlet (ort.)",        type: "say", category: "san", rank: 100000, tytNet: 70,  aytNet: 40, totalNet: 110 },
  { id: "ic_mimarlik",     name: "İç Mimarlık",         uni: "Devlet (ort.)",        type: "say", category: "san", rank: 150000, tytNet: 62,  aytNet: 34, totalNet: 96 },
  { id: "endustri_tas",    name: "Endüstri Tasarımı",   uni: "Devlet (ort.)",        type: "say", category: "san", rank: 80000,  tytNet: 74,  aytNet: 44, totalNet: 118 },
  { id: "sehir_planlama",  name: "Şehir Planlama",      uni: "Devlet (ort.)",        type: "ea",  category: "san", rank: 180000, tytNet: 54,  aytNet: 28, totalNet: 82 },
  { id: "gorsel_iletisim", name: "Görsel İletişim Tas.", uni: "Devlet (ort.)",       type: "soz", category: "san", rank: 90000,  tytNet: 66,  aytNet: 48, totalNet: 114 },
  { id: "grafik_tas",      name: "Grafik Tasarım",      uni: "Devlet (ort.)",        type: "soz", category: "san", rank: 100000, tytNet: 64,  aytNet: 46, totalNet: 110 },
  { id: "moda_tas",        name: "Moda Tasarımı",       uni: "Devlet (ort.)",        type: "soz", category: "san", rank: 250000, tytNet: 47,  aytNet: 29, totalNet: 76 },
  { id: "muzik",           name: "Müzik / Müzikoloji",  uni: "Devlet (ort.)",        type: "soz", category: "san", rank: 200000, tytNet: 50,  aytNet: 34, totalNet: 84 },

  // === Dil & Edebiyat ===
  { id: "ing_filoloji",    name: "İngiliz Dili & Edeb.", uni: "Devlet (ort.)",       type: "dil", category: "dil", rank: 40000,  tytNet: 66,  aytNet: 64, totalNet: 130 },
  { id: "amer_kult",       name: "Amerikan Kültürü",    uni: "Devlet (ort.)",        type: "dil", category: "dil", rank: 50000,  tytNet: 62,  aytNet: 60, totalNet: 122 },
  { id: "muterc_terc_ing", name: "Mütercim-Terc. (İng)", uni: "Devlet (ort.)",       type: "dil", category: "dil", rank: 25000,  tytNet: 72,  aytNet: 70, totalNet: 142 },
  { id: "muterc_terc_alm", name: "Mütercim-Terc. (Alm)", uni: "Devlet (ort.)",       type: "dil", category: "dil", rank: 80000,  tytNet: 52,  aytNet: 50, totalNet: 102 },
  { id: "muterc_terc_fra", name: "Mütercim-Terc. (Fra)", uni: "Devlet (ort.)",       type: "dil", category: "dil", rank: 110000, tytNet: 46,  aytNet: 44, totalNet: 90 },
  { id: "alman_dili",      name: "Alman Dili & Edeb.",  uni: "Devlet (ort.)",        type: "dil", category: "dil", rank: 130000, tytNet: 44,  aytNet: 41, totalNet: 85 },
  { id: "turk_dili",       name: "Türk Dili & Edeb.",   uni: "Devlet (ort.)",        type: "soz", category: "dil", rank: 80000,  tytNet: 68,  aytNet: 50, totalNet: 118 },
  { id: "iletisim",        name: "İletişim / Gazetec.", uni: "Devlet (ort.)",        type: "soz", category: "dil", rank: 130000, tytNet: 58,  aytNet: 42, totalNet: 100 },
  { id: "halkla_iliskiler", name: "Halkla İlişkiler",   uni: "Devlet (ort.)",        type: "soz", category: "dil", rank: 160000, tytNet: 54,  aytNet: 37, totalNet: 91 },
  { id: "yeni_medya",      name: "Yeni Medya",          uni: "Devlet (ort.)",        type: "soz", category: "dil", rank: 200000, tytNet: 50,  aytNet: 34, totalNet: 84 },
  { id: "radyo_tv",        name: "Radyo TV & Sinema",   uni: "Devlet (ort.)",        type: "soz", category: "dil", rank: 230000, tytNet: 48,  aytNet: 31, totalNet: 79 },

  // === Spor ===
  { id: "antren",          name: "Antrenörlük",         uni: "Devlet (ort.)",        type: "soz", category: "spor", rank: 300000, tytNet: 46,  aytNet: 26, totalNet: 72 },
  { id: "beden_egitimi",   name: "Beden Eğt. & Öğret.", uni: "Devlet (ort.)",        type: "soz", category: "spor", rank: 280000, tytNet: 48,  aytNet: 28, totalNet: 76 },
  { id: "spor_yon",        name: "Spor Yöneticiliği",   uni: "Devlet (ort.)",        type: "ea",  category: "spor", rank: 320000, tytNet: 45,  aytNet: 22, totalNet: 67 },
];

export function getProgramById(id) {
  return PROGRAMS.find((p) => p.id === id) || null;
}

export function searchPrograms(query, { type = null, category = null } = {}) {
  const q = (query || "").trim().toLocaleLowerCase("tr");
  return PROGRAMS.filter((p) => {
    if (type && type !== "all" && p.type !== type) return false;
    if (category && category !== "all" && p.category !== category) return false;
    if (!q) return true;
    return (
      p.name.toLocaleLowerCase("tr").includes(q) ||
      p.uni.toLocaleLowerCase("tr").includes(q)
    );
  });
}

/**
 * Belirli bir net değerine yakın bölümleri getirir.
 * Sınav türü (TYT veya AYT/Toplam) bazında karşılaştırma yapar.
 */
export function getProgramsNearNet({ net, examType = "tyt", scoreType = null, tolerance = 10, limit = 6 }) {
  const target = Number(net);
  if (!Number.isFinite(target) || target <= 0) return [];

  const isTytOnly = examType === "tyt";

  return PROGRAMS
    .filter((p) => {
      if (scoreType && scoreType !== "all" && p.type !== scoreType) return false;
      const ref = isTytOnly ? p.tytNet : (p.totalNet || (p.tytNet + p.aytNet));
      return Math.abs(ref - target) <= tolerance;
    })
    .map((p) => {
      const ref = isTytOnly ? p.tytNet : (p.totalNet || (p.tytNet + p.aytNet));
      const diff = Math.round((target - ref) * 10) / 10;
      return {
        ...p,
        requiredNet: ref,
        diff,
        status: diff >= 0 ? "in_reach" : "needs_work",
      };
    })
    .sort((a, b) => Math.abs(a.diff) - Math.abs(b.diff))
    .slice(0, limit);
}

export const PROGRAMS_DISCLAIMER =
  "YÖK Atlas ve ÖSYM verilerine dayalı tahmindir; sınav zorluğuna göre taban netler ve sıralamalar her yıl değişir.";
