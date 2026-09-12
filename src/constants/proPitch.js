// PRO SUNUMU — tasarimin "Premium" ve "Pro Onizleme" artboardlarindan BIREBIR.
//
// Fiyat ve deneme suresi BURADA DEGIL: tek kaynak src/constants/premium.js
// (PLANS, FREE_TRIAL_DAYS) ve onun uzerine yazan magaza paketi. Burada
// yalnizca metin durur, sayi yok.

export const PRO_PITCH = {
  eyebrow: "MARATON PRO",
  title: "Rotanı daha net gör.",
  lead: "Ne çalıştığını ücretsiz kaydet. Ne çalışacağını Maraton söylesin.",
  restore: "Geri yükle",
  cta: "7 gün ücretsiz dene",
  ctaNote: "Deneme bitmeden iptal edersen ücret alınmaz.",
};

// Tasarimin 8 satiri, sira ve metin aynen.
export const PRO_FEATURES = [
  {
    name: "Rota · bugünün durakları",
    desc: "Ne çalışacağını Maraton söyler. Her sabah sıradaki durak hazır bekler.",
  },
  {
    name: "Rotanın tamamı ve tahmin bandı",
    desc: "Gelecek duraklar, sınav günü tahmini ve güven bandı açılır.",
  },
  {
    name: "Rotanın kendini güncellemesi",
    desc: "Neti düşen dersin durakları öne alınır. Rotayı elle düzenlemeyi bırakırsın.",
  },
  {
    name: "Tempo senaryoları",
    desc: "Haftada bir durak fazla çalışsan ne olur, önceden görürsün. Karar tahminle değil sayıyla verilir.",
  },
  {
    name: "Konu ilerlemesi ve öncelikli konular",
    desc: "Hangi konu ne kadar kapandı, sırada hangisi var — tamamı görünür.",
  },
  {
    name: "Sınırsız deneme kaydı ve karşılaştırma",
    desc: "Ücretsizde ayda 4; Pro ile sınırsız kayıt ve tüm geçmişe erişim.",
  },
  {
    name: "Fotoğraftan deneme okuma",
    desc: "Optiği çekiyorsun, ders netleri kendiliğinden giriliyor. Kayıt bir dakikaya iner.",
  },
  {
    name: "Bölüm eşiği ve aylık rapor",
    desc: "Netin hangi bölümlere yetiyor, ay nasıl kapandı — hazır gelir.",
  },
];

// Plan satirinin metni. Yillik satirin alt satiri tasarimda
// "₺1.068/yıl · tek ödeme" — sayi kisminin kaynagi PLANS oldugu icin
// burada yalniz son parca duruyor.
export const PRO_PLAN_COPY = {
  yearly: { name: "Yıllık", note: "tek ödeme", badgeSuffix: "AVANTAJ" },
  monthly: { name: "Aylık", note: "İstediğin zaman iptal" },
};

export const PRO_PREVIEW = {
  title: "Pro bu rotayı nasıl derinleştirir?",
  haveLabel: "ŞU AN ELİNDE OLAN",
  unlockLabel: "PRO İLE AÇILAN",
  locked: [
    "3 farklı tempo senaryosu",
    "Sınırsız deneme karşılaştırması",
    "Ders trendine göre rota güncellemesi",
    "Detaylı haftalık rapor",
  ],
  body:
    "Ücretsiz sürüm mevcut ilerlemeni gösterir. Pro, bu verilerden daha fazla " +
    "rota seçeneği üretir ve neye öncelik verebileceğini görünür hale getirir. " +
    "Karar her zaman senin.",
  primary: "Pro önizlemesini aç",
  secondary: "Şimdilik devam et",
};
