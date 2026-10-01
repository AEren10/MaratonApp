# Maraton — App Review ve Store Yayın Kontrol Defteri

Son güncelleme: 1 Ekim 2026

Amaç: App Store / Google Play gönderimi öncesinde neyi bitirdiğimizi, neyin kaldığını ve hangi riskleri bilinçli takip ettiğimizi tek yerde görmek.

V1 yayın kararı:

- [x] İlk sürüm tamamen ücretsiz olacak.
- [x] Premium, kart ödeme ve anonim topluluk soru-cevap V1 inceleme kapsamından çıkarıldı.
- [x] Store listing ve ekran görüntülerinde V1 dışı özellik gösterilmeyecek: lig, sosyal, topluluk, premium.
- [x] “Yapay zekâ” iddiası kullanılmayacak; sistem kural/algoritma tabanlı anlatılacak.

## 0. Genel durum

- [x] iOS bundle ID: `com.ahmeterensiranli.maraton`
- [x] Android package: `com.ahmeterensiranli.maraton`
- [x] Widget App Group hedefi: `group.com.ahmeterensiranli.maraton`
- [x] Widget extension bundle ID: `com.ahmeterensiranli.maraton.ExpoWidgetsTarget`
- [x] Kullanılacak canlı domain: `maratonapp.com`
- [x] Kullanılacak destek e-postası: `destek@maratonapp.com`
- [x] Test durumu güncel: `npm test` 853/853 başarılı.
- [x] Repo genel kontrolü: `npm run check` başarılı.
- [x] Çözülmemiş merge conflict marker yok.
- [ ] Final `.ipa` ve `.aab` üretildikten sonra native manifest kontrolü yapılacak.

## 1. Alan adı, yasal sayfalar ve destek kanalı

### Yapılanlar

- [x] `maratonapp.com` nihai domain olarak belirlendi.
- [x] `/privacy` sayfası hazırlandı.
- [x] `/terms` sayfası hazırlandı.
- [x] `/delete-account` sayfası hazırlandı.
- [x] `/support` sayfası hazırlandı.
- [x] `/delete-account` için web login zorunlu olmadığı kararı netleştirildi.
- [x] Hesap silme sayfası, uygulama içi silme yolunu ve destek e-postasına talep göndermeyi anlatacak şekilde planlandı.
- [x] Destek adresi metinlerde `destek@maratonapp.com` olarak güncellendi.

### Kalan kontroller

- [ ] Canlı sitede tekrar doğrula: `https://maratonapp.com/privacy`
- [ ] Canlı sitede tekrar doğrula: `https://maratonapp.com/terms`
- [ ] Canlı sitede tekrar doğrula: `https://maratonapp.com/delete-account`
- [ ] Canlı sitede tekrar doğrula: `https://maratonapp.com/support`
- [ ] Canlı sitede tekrar doğrula: `https://maratonapp.com/.well-known/apple-app-site-association`
- [ ] Canlı sitede tekrar doğrula: `https://maratonapp.com/.well-known/assetlinks.json`
- [ ] `destek@maratonapp.com` gelen/giden mail testi yapılacak.
- [ ] Footer veya sitedeki görünür linklerden legal sayfalara ulaşım tekrar kontrol edilecek.

## 2. Kimlikler ve platform eşleşmeleri

### Yapılanlar

- [x] Nihai bundle/package kimliği belirlendi: `com.ahmeterensiranli.maraton`
- [x] Eski `com.maraton.app` kimliğinin doküman kalıntısı olduğu netleştirildi.
- [x] Associated Domains ve Android App Links tarafında `maratonapp.com` hedeflendi.
- [x] App Group hedefi `group.com.ahmeterensiranli.maraton` olarak belirlendi.

### Kalan kontroller

- [ ] Apple Developer’da App Group gerçekten kayıtlı mı kontrol edilecek.
- [ ] Apple Associated Domains final build capability içinde var mı kontrol edilecek.
- [ ] Google Play / Android App Links SHA ve package eşleşmesi kontrol edilecek.
- [ ] Supabase Apple OAuth client ayarları final bundle ID ile uyumlu mu kontrol edilecek.
- [ ] Supabase Google OAuth client ayarları final Android package/SHA ile uyumlu mu kontrol edilecek.
- [ ] App Store Connect ve Google Play Console’da bundle/package değerleri son kez kontrol edilecek.

## 3. Topluluk / UGC / sosyal yüzeyler

### Yapılanlar

- [x] Anonim soru-cevap topluluğu V1 dışı bırakıldı.
- [x] Yanlış defteri detay ekranı community detail gövdesini import etmeyecek şekilde ayrıldı.
- [x] Legacy community soru/cevap yazma yüzeyinin kapatılması için migration canlı deftere dahil edildi.
- [x] Public `community-answers` medya erişimi kapatma işi migration defterinde takip edildi.
- [x] Store listing ve screenshot planından “toplulukla çöz” iddiası çıkarıldı.
- [x] V1 ekran görüntülerinde lig, sosyal, topluluk gösterilmeyecek kararı yazıldı.

### Bilinçli risk / kalan kontroller

- [ ] Lig, grup, arkadaş ve profil alanlarında kullanıcı adı / profil fotoğrafı / grup adı gibi kullanıcı kaynaklı içerikler hâlâ risk yüzeyi olabilir.
- [ ] Kullanıcı adı ve grup adı için uygunsuz içerik filtresi ayrıca doğrulanmalı.
- [ ] Lig/grup/arkadaş alanlarında kullanıcı şikâyet/engelleme akışı App Review öncesi tekrar değerlendirilmeli.
- [ ] V1 binary’de anonim soru-cevap topluluğuna route/import/deep link kalmadığı final build üzerinde doğrulanmalı.

## 4. Ödeme, premium, kart ödeme

### Yapılanlar

- [x] V1 ücretsiz yayın kararı verildi.
- [x] Store listing’de yalnız “tamamen ücretsiz” anlatımı kullanılacak.
- [x] App Store Connect ve Play Console’da V1 için IAP ürünü sunulmaması kararı verildi.
- [x] Production navigation artık premium ekranlarını ve kart ödeme ekranını açmıyor.
- [x] Eski premium deep link / route denemeleri ana ekrana düşecek şekilde güvenli davranış planlandı.
- [x] `react-native-purchases` runtime bağımlılığı kaldırıldığı raporlandı.
- [x] Kart numarası/CVC isteyen `PaymentCardScreen` production akışından çıkarıldı.

### Kalan kontroller

- [ ] Final binary içinde kart ödeme ekranına ulaşılmadığı gerçek cihazda doğrulanacak.
- [ ] Store listing’de premium, abonelik, fiyat, restore purchase metni kalmadığı son kez kontrol edilecek.
- [ ] App Store Connect’te IAP / subscription ürünü açık değil mi kontrol edilecek.
- [ ] Google Play Console’da in-app product / subscription açık değil mi kontrol edilecek.

## 5. İzinler ve production manifest

### Yapılanlar

- [x] `app.json` içinde Sentry ve `expo-widgets` plugin tekrarları temizlendiği raporlandı.
- [x] `expo-secure-store` Face ID izin açıklaması üretmeyecek şekilde yapılandırıldığı raporlandı.
- [x] Kamera/fotoğraf izinlerinin yanlış soru fotoğrafı, avatar ve paylaşım kartı gibi kullanıcı aksiyonlarına bağlı anlatılması planlandı.

### Kalan kontroller

- [ ] Final `.ipa` içinden `Info.plist` kontrol edilecek.
- [ ] Final `.aab` içinden `AndroidManifest.xml` kontrol edilecek.
- [ ] `NSMicrophoneUsageDescription` final iOS build’de kalıyor mu kontrol edilecek.
- [ ] `android.permission.RECORD_AUDIO` final Android build’de kalıyor mu kontrol edilecek.
- [ ] Expo Dev Client / local network açıklamaları production archive içinde yok mu kontrol edilecek.
- [ ] Android storage/media izinleri Google Play Data Safety beyanıyla uyumlu mu kontrol edilecek.
- [ ] Kamera ve galeri izin promptları yalnız ilgili kullanıcı aksiyonlarında tetikleniyor mu gerçek cihazda kontrol edilecek.

## 6. Privacy labels ve Google Play Data Safety

### Yapılanlar

- [x] Privacy copy içinde “hiçbir veri üçüncü taraflarla paylaşılmaz” gibi doğrulanmamış mutlak iddialardan kaçınılması gerektiği belirlendi.
- [x] Kullanılan servis sağlayıcılar not edildi: Supabase, Sentry, Expo/EAS/Updates/Notifications, Apple ve Google platform servisleri.
- [x] RevenueCat yalnız production’da gerçekten aktif edilirse beyana eklenecek kararı verildi.
- [x] Sentry ve Expo’nun reklam/tracking amacıyla değil, uygulama işlevi ve hata giderme için veri işlediği anlatım çizgisi belirlendi.

### Kalan kontroller

- [ ] App Store Privacy Labels final binary ve canlı backend davranışıyla eşleştirilecek.
- [ ] Google Play Data Safety final binary ve canlı backend davranışıyla eşleştirilecek.
- [ ] Bildirim tokenları ve bildirim tercihleri beyanlarda doğru yer alacak.
- [ ] Sentry hata verileri / cihaz bilgileri beyanlarda doğru yer alacak.
- [ ] Hesap silme sonrası saklanan/verilen veri kategorileri legal metinle uyumlu mu kontrol edilecek.

## 7. Store listing iddiaları ve ASO metinleri

### Yapılanlar

- [x] “Yapay zekâ destekli öneriler” çıkarıldı / kullanılmaması kararlaştırıldı.
- [x] “Toplulukla yanlış paylaş ve çöz” V1 listing’den çıkarıldı.
- [x] Güvenli alternatif cümleler belirlendi:
  - “Kişisel rota: bugün ne çalışacağını biz seçeriz”
  - “Yanlışlarını fotoğrafla kaydet ve unutmadan tekrar et”
  - “Deneme analizini ve net grafiğini takip et”
- [x] `store/listing-tr.md` altına 6 karelik “Ekran görüntüleri” bölümü eklendi.
- [x] Screenshot planında V1 dışı özellikler yasaklandı: lig, sosyal, topluluk, premium.

### Kalan kontroller

- [ ] App Store listing final metni panoya girmeden önce son kez okunacak.
- [ ] Google Play listing final metni panoya girmeden önce son kez okunacak.
- [ ] Ekran görüntülerinde V1 dışı feature görünmediği görsel bazda kontrol edilecek.
- [ ] Görsellerde kullanılan üst başlıkların 5 kelimeyi aşmadığı kontrol edilecek.

## 8. App Review demo hesabı

### Yapılanlar

- [x] `scripts/seed-review-account.mjs` yazıldı.
- [x] Betik kullanıcı hesabı veya şifre oluşturmuyor.
- [x] Service role key yalnız ortam değişkeninden okunuyor; repoya yazılmıyor.
- [x] Betik verilen e-postalı mevcut hesabı buluyor.
- [x] Betik iki kez çalıştırılırsa kendi demo verisini temizleyip yeniden yazacak şekilde idempotent tasarlandı.
- [x] Betik yalnız çalışma verisi üretir; uydurma ad, okul, telefon, kimlik veya fotoğraf üretmez.
- [x] Demo veri kapsamı:
  - 3 TYT + 2 AYT Sayısal deneme
  - Son 14 günde 12 çalışma kaydı
  - Fotoğrafsız, notlu 6 yanlış defteri kaydı
  - TYT + AYT Sayısal profil ayarı
  - Hedef net ve başlangıç neti
  - 10 günlük aktif seri
- [x] `node --check scripts/seed-review-account.mjs` başarılı.

### Kalan kontroller

- [ ] Demo hesap uygulamadan manuel oluşturulacak.
- [ ] Demo hesap e-postası ve şifresi App Store / Play review notlarına manuel yazılacak.
- [ ] `SUPABASE_SERVICE_ROLE_KEY` geçici env olarak ayarlanıp seed script canlı demo hesap için çalıştırılacak.
- [ ] Seed sonrası uygulamada demo hesabıyla giriş yapılıp Rota / Analiz / Yanlış Defteri / Profil ekranları kontrol edilecek.
- [ ] Demo hesapta kişisel veri veya gerçek öğrenci bilgisi bulunmadığı kontrol edilecek.

### Seed komutu

```bash
SUPABASE_URL="https://PROJECT_REF.supabase.co" \
SUPABASE_SERVICE_ROLE_KEY="SERVICE_ROLE_KEY" \
node scripts/seed-review-account.mjs reviewer@example.com
```

Windows PowerShell:

```powershell
$env:SUPABASE_URL="https://PROJECT_REF.supabase.co"
$env:SUPABASE_SERVICE_ROLE_KEY="SERVICE_ROLE_KEY"
node scripts/seed-review-account.mjs reviewer@example.com
Remove-Item Env:\SUPABASE_SERVICE_ROLE_KEY
Remove-Item Env:\SUPABASE_URL
```

## 9. Supabase migration defteri ve advisor

### Yapılanlar

- [x] Canlı migration defteri Claude tarafından `list_migrations` ile okundu.
- [x] `docs/MIGRATION_LEDGER_2026-10.md` güncellendi.
- [x] `supabase/migrations/` altındaki dosya numaralarının canlı defterle birebir hizalı olduğu not edildi.
- [x] Canlıda olmayan `20260926100000_clde_open_route_feature_access.sql` arşive alındı.
- [x] Supabase Advisor çıktısı canlıdan alındı ve `docs/SUPABASE_ADVISOR_2026-10.md` içinde özetlendi.
- [x] Advisor sonucunda çıkışı engelleyen `ERROR` yok.
- [x] Leaked password protection kapalı uyarısı bilinen karar olarak not edildi.
- [x] Performance `unused_index` uyarıları düşük trafik nedeniyle silme önerisi yapılmadan takip listesine alındı.

### Kalan kontroller

- [ ] `supabase db lint` canlı Postgres bağlantısı için `SUPABASE_DB_PASSWORD` istedi; DB password olan ortamda tekrar çalıştırılabilir.
- [ ] Advisor’daki `SECURITY DEFINER` RPC’ler yayın sonrası tekrar audit edilecek.
- [ ] Unused index uyarılarına gerçek kullanıcı trafiğinden yaklaşık 1 ay sonra tekrar bakılacak.
- [ ] Bu sohbette paylaşılan Supabase personal access token rotate/silinmeli.

## 10. Reviewer Notes taslağı

```text
Maraton, YKS öğrencileri için günlük çalışma planı, deneme takibi ve yanlış tekrar uygulamasıdır.

Demo hesap:
E-posta: [DEMO_EMAIL]
Şifre: [DEMO_PASSWORD]

Bu hesap gerçek kullanıcı değildir; App Review için örnek çalışma verisiyle hazırlanmıştır.

Ana sekmeler: Rota, Program, +, Analiz ve Profil.

Önerilen kontrol akışı:
1. Giriş yapın.
2. Rota sekmesinde günlük çalışma planını ve seri durumunu görün.
3. Ortadaki + butonundan deneme, çalışma veya yanlış kaydı ekleme akışını inceleyin.
4. Analiz sekmesinde TYT/AYT deneme grafikleri ve ders kırılımlarını görün.
5. Profil/Ayarlar üzerinden gizlilik, hesap ve destek bağlantılarını kontrol edin.

Kamera ve fotoğraf izinleri yalnızca yanlış soru fotoğrafı, avatar ve paylaşım kartı akışlarında kullanılır.

Version 1.0'da ücretli özellik, uygulama içi satın alma, abonelik veya kart ödeme bulunmamaktadır.

Anonim topluluk soru-cevap, lig/sosyal ve premium akışları V1 inceleme kapsamına dahil değildir.

Hesap silme: Profil → Ayarlar → Hesabı Sil.
```

## 11. Son gönderim öncesi kısa liste

- [ ] Final build üret.
- [ ] Final `.ipa` manifest kontrolü yap.
- [ ] Final `.aab` manifest kontrolü yap.
- [ ] Demo hesabı oluştur.
- [ ] Demo seed script’i canlı demo hesap için çalıştır.
- [ ] Demo hesapla gerçek cihazda giriş yap.
- [ ] Yasal sayfaları ve `.well-known` dosyalarını canlıdan aç.
- [ ] `destek@maratonapp.com` mail testini yap.
- [ ] Privacy Labels doldur.
- [ ] Play Data Safety doldur.
- [ ] App Store review notes içine demo hesabı ve yukarıdaki açıklamayı gir.
- [ ] Play Console test credentials / review notes alanına demo hesabı gir.
- [ ] V1 dışı özelliklerin listing/görsellerde görünmediğini son kez kontrol et.

## Resmî kaynaklar

- Apple App Review Guidelines: https://developer.apple.com/app-store/review/guidelines/
- Apple screenshot gereksinimleri: https://developer.apple.com/help/app-store-connect/manage-app-information/upload-app-previews-and-screenshots
- Apple privacy manifests: https://developer.apple.com/documentation/BundleResources/privacy-manifest-files
- Expo SDK 57 ImagePicker: https://docs.expo.dev/versions/v57.0.0/sdk/imagepicker/
- Expo SDK 57 Widgets: https://docs.expo.dev/versions/v57.0.0/sdk/widgets/
- Google Play yayın rehberi: https://support.google.com/googleplay/android-developer/answer/15191715?hl=en
