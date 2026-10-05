# Çıkış sonrası / sonra yapılacaklar — 6 Ekim 2026

Mağaza çıkışını bekletmeyen, bilerek ertelenen işler. Çıkış öncesi açık işler
için docs/DURUM.md ve store/appreview.md.

## Süre sayacı (çalışma zamanlayıcısı)
- [ ] iOS Live Activity / Dinamik Ada: kilit ekranında akan sayaç (ders, faz,
      süre). Kendi widget altyapımız var; `expo-widgets` Live Activity desteği
      DOĞRULANMADI, önce araştır. Yeni native build gerekir.
- [ ] Android kilit ekranı canlı sayacı (ongoing bildirim + chronometer,
      Duraklat / Bitir düğmeleri). `expo-notifications` bunu doğrudan vermiyor
      olabilir; yerel kod ya da ayrı paket gerekebilir.
- [ ] Uygulama öldürülünce süre kaybı: oturum duraklatılmış geri geliyor
      (useStudyTimerController, kurtarma). Cihazda ölç, gerekirse çapadan devam.
- [ ] Faz geçişi arka planda yalnız ekran açılınca oluyor; bildirim yalnız
      haber veriyor. Sayaç uzun süre kapalı kalınca fazın nasıl hesaplandığını
      gözden geçir.
- [ ] İsteğe bağlı "ekran açık kalsın" seçeneği (varsayılan kapalı, pil).

## Kasma ve görsel
- [ ] Sekme geçişi kasması: cihazda ölçülmedi. Aday: ScreenDepth gradyan
      katmanı (resme / expo-linear-gradient'e çevir), Analiz/Profil ilk açılış.
- [ ] Seri alevi için 3B animasyonlu simge (3dicon benzeri): yalnız tek
      yerde, takvimde değil; tasarım diliyle (yassı, yüzey tonu) uyumu karar bekler.
- [ ] Onaylı logoda tam kırmızı zemin denemesi (iki versiyon yan yana göster).
- [ ] Paylaşım dosyalarında sabit renk kodları (#FFFFFF, #FF8A3D, #16161D):
      tokenlara taşı.

## Sosyal ve moderasyon
- [ ] Rapor kuyruğu: yeni rapor gelince bildirim/e-posta; "24 saatte incelenir"
      sözü için günlük kontrol prosedürü.
- [ ] Hesap silinince "Apple ile giriş" yetkisini Apple tarafında iptal et.
- [ ] Android'de "Widget ekle" kartı / widget rehberi görünüyorsa gizle
      (widget yalnız iOS; kontrol edilmedi).

## Altyapı ve mağaza
- [ ] Sentry anahtarını yenile (ekran görüntüsünde göründü), EAS production ve
      preview'a yeniden ekle.
- [ ] `apple-app-site-association` ve `assetlinks.json`: Apple Team ID gerekli;
      Android için EAS imza parmak izi + Play uygulama imzası SHA-256.
- [ ] Google Play: kişisel hesapta 12 test kullanıcısı x 14 gün kapalı test.
- [ ] KVKK aydınlatma metni; "Maraton Yayıncılık" marka çakışması ve TÜRKPATENT
      kontrolü (avukata danışılacak).
- [ ] Migration defteri: canlıda kayıt adı olmayan `friend_notifications`
      migration'ı (nesneleri canlıda var).
