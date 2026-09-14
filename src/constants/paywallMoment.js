// PAYWALL ANI — tasarimdaki "Paywall Anı" artboardundan BIREBIR.
//
// Baglami olmayan kaynaklarin (ozellikle kilitli rota ekrani, "route_gate")
// tam ekran paywall'i. Sayilar ekranda kullanicinin kendi kaydindan gelir;
// kayit yoksa sayi satiri hic cizilmez.

export const PAYWALL_MOMENT = {
  dayEyebrow: (day) => `ROTA · ${day}. GÜN`,
  lockedLabel: "ROTANIN TAMAMI · KİLİTLİ",
  todayLabel: "BUGÜN",
  quote: "Bir haftadır rotanı kullanıyorsun. Buradan sonrası Pro.",
  freeLabel: "ÜCRETSİZDE AÇIK",
  free: [
    "Çalışma kaydı ve oturum takibi",
    "Yanlış defteri ve aralıklı tekrar",
    "Seri, günlük ve haftalık özet",
    "Ayda 4 deneme kaydı ücretsiz",
  ],
  proLabel: "MARATON PRO",
  proTitle: "Ne çalıştığını ücretsiz kaydet. Ne çalışacağını Maraton söylesin.",
  proBody:
    "Rota durmaz — kilitliyken yalnızca görünmez. Pro açıldığında bıraktığın " +
    "yerden devam eder.",
  proChecks: [
    "Bugünün durakları · rota sana ne çalışacağını söyler",
    "Rotanın tamamı ve tahmin bandı",
    "Tempo senaryoları ve öncelikli konuların tamamı",
  ],
  cta: "7 gün ücretsiz dene",
  ctaNote: "Deneme bitmeden iptal edersen ücret alınmaz.",
  secondary: "Şimdi değil, ücretsiz devam et",
};

// Magaza kurali: satin alma dugmesinin yaninda geri yukleme ve yasal
// baglantilar bulunur (tasarim artboardu gostermiyor, magaza istiyor).
export const PAYWALL_LEGAL = {
  restore: "Satın almayı geri yükle",
  privacy: "Gizlilik Politikası",
  terms: "Kullanım Şartları",
};
