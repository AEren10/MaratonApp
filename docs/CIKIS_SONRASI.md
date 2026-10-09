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

## İlk güncelleme: eksik kullanıcı verileri (10 Ekim değerlendirmesi, öncelik sırasıyla)

Rapor kodda ve canlı DB'de doğrulandı. Bunlar hata değil, yeni özellik.

1. [ ] **Yanlış sebebi etiketi** -- `wrong_questions`'a alan (dikkatsizlik / bilgi eksiği /
       süre yetmedi / soru kökünü yanlış okuma); yanlış eklerken tek dokunuş. Koçluk cümleleri
       ("matematik yanlışlarının %70'i dikkatsizlik") bunun üstüne kurulur.
2. [ ] **Sınıf durumu** (11. sınıf / 12. sınıf / mezun) -- kurulumda tek soru; rota haftalık
       kapasitesi buna göre (12. sınıfta hafta içi okul saatleri).
3. [ ] **Deneme puanı ve Türkiye sıralaması / yüzdelik** -- deneme girişinde isteğe bağlı iki alan.
4. [ ] Kurulumda hedef bölüm (`profiles.target_department` var, sorulmuyor).
5. [ ] Çalışma yöntemi (konu anlatımı / video / soru bankası) ve kaynak kitap; yanlışa çözüm fotoğrafı.
6. [ ] Kurulumda mola günü sorusu (ders programındaki "boş gün" zaten var; kurulmazsa 7 gün varsayılıyor).
7. [ ] Çevrimdışı silme: deneme ve çalışma kaydı silme kuyruğa alınsın (şimdi hata verip geri geliyor).

Geçersiz çıkan iddialar (yapılmayacak): deneme taslağı zaten var; `adHocTasks` ölü kod; XP sunucu
otoritesi bilinçli.

## Denetimden kalan (9 Ekim)
- [ ] Apple ile girişte hesap silinirken token iptali (5.1.1(v)) -- .p8 anahtarı + edge function. App Store öncesi.
- [ ] Rota: sınava yakın haftalarda kapasite takvim haftasıyla hizalı değil (`scheduler.js`).
- [ ] Haftalık/aylık özet geçmiş dönem durak sayısı 0 (`summary/activity.js` geçmiş haftaları görmüyor).
- [ ] Aylık özette branş netleri TYT ile karışıyor (`monthNets.js`).
