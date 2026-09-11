// Bos ve hata durumlarinin metinleri — kaynak: tasarim artboardlari
// (Maraton Uygulama.dc.html, AKIS 17 ve AKIS 18). Kopya UYDURULMAZ,
// tasarimdan birebir alinir. Ton kurali: sucu kullaniciya atmaz.

export const EMPTY_COPY = {
  trialRecords: {
    title: "Henüz deneme kaydın yok.",
    body: "İlk denemeni gir — rota o andan sonra netlerinle çizilmeye başlar.",
    primary: "İlk denemeni gir",
    secondary: "Nasıl çalıştığını gör",
  },
  analysisThin: {
    eyebrow: "TEK DENEME",
    title: "Bir denemeyle rota çizilir, eğilim çizilmez.",
    body: "İki nokta arasında yön okunur. İkinci denemeni girdiğinde ivme, düşüş ve tahmin bandı açılır.",
    primary: "İkinci denemeni gir",
    secondary: "Tek denemeyi incele",
  },
  priorityTopics: {
    title: "Öncelik listesi şu an boş.",
    body: "Son üç denemede belirgin şekilde geride kalan konu yok. Liste yeni deneme girdikçe kendini günceller.",
    primary: "Yol haritasına bak",
    secondary: "Konu borcunu gör",
  },
  studyHistory: {
    title: "Kayıtlı oturumun yok.",
    body: "Zamanlayıcıyla çalıştığında her oturum buraya süresi ve durağıyla düşer.",
    primary: "Çalışmaya başla",
    secondary: "Elle oturum ekle",
  },
  notifications: {
    title: "Yeni haber yok.",
    body: "Rotan değiştiğinde, defterinde tekrar zamanı geldiğinde ve hafta kapandığında burada görürsün.",
    secondary: "Bildirim ayarlarına bak",
  },
  streakZero: {
    title: "Seri henüz başlamadı.",
    body: "Bugün tek durak tamamlaman yeterli. Seri, kaçırdığın günde sıfırlanmaz — donar.",
    primary: "Bugünün durağına başla",
    secondary: "Seri nasıl işler",
  },
  calendarEmptyDay: {
    title: "Bu gün için henüz durak yok.",
    body: "İstersen 20 dakikalık bir dönüş durağı ekleyebilirsin.",
    primary: "Bugüne durak ekle",
    secondary: "Bu günü boş bırak",
  },
};

// Sunucuya yazilamamis ama cihazda duran deger icin kisa bilgi satiri.
// Tasarimda bu duruma ait ayri bir artboard yok; metin "Cevrimdisi Kuyruk"
// ekraninin kendi soz dagarcigindan uyarlandi ("Girdigin her sey cihazinda
// tutuluyor", "baglanti gelince yuklenecek") -- sifirdan uydurulmadi.
export const SYNC_PENDING_COPY = {
  targetNet: "Hedefin cihazında tutuluyor, bağlantı gelince yüklenecek.",
  baselineNet: "Sonucun cihazında tutuluyor, bağlantı gelince yüklenecek.",
};

export const ERROR_COPY = {
  server: {
    title: "Bizde bir sorun var.",
    body: "Rotan yerinde duruyor, şu an sunucudan okunamıyor. Birkaç dakika içinde tekrar dene.",
    primary: "Tekrar dene",
    secondary: "Çevrimdışı devam et",
    copyable: true,
  },
  sessionUnsaved: {
    title: "Oturum sunucuya yüklenemedi.",
    body: "Kaybolmadı — cihazında duruyor ve bağlantı gelince kendiliğinden yüklenir.",
    primary: "Şimdi tekrar dene",
    secondary: "Sonra yüklenmesine izin ver",
  },
  notificationDenied: {
    title: "Bildirimler kapalı.",
    body: "İzin telefon ayarlarından verilebiliyor. Uygulama içinde açamıyoruz.",
    primary: "Telefon ayarlarını aç",
    secondary: "Bildirimsiz devam et",
  },
  ocrUnreadable: {
    title: "Netler okunamadı.",
    body: "Sonuç tablosu bulanık çıkmış. Işığı arttırıp tabloyu kadraja tam sığdırarak tekrar çekebilirsin.",
    primary: "Tekrar çek",
    secondary: "Elle gir",
    hint: { label: "İYİ SONUÇ İÇİN", text: "Tabloyu düz tut, gölge bırakma, yalnızca ders satırlarını kadraja al." },
  },
};
