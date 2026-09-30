# Maraton — App Review ve Store Yayın Audit'i

Son denetim: 30 Eylül 2026

## Mevcut Durum

İlk mağaza gönderimi için ana karar: V1 tamamen ücretsiz yayınlanacak. Premium, kart ödeme ve anonim topluluk soru-cevap akışları production import zincirinden çıkarıldı veya kapatıldı.

Kod tarafında bu worktree'de doğrulananlar:

- iOS ve Android kimliği: `com.ahmeterensiranli.maraton`
- Production navigation artık premium ekranlarını ve kart ödeme ekranını açmıyor; eski premium deep link/route denemeleri ana ekrana düşüyor.
- `react-native-purchases` runtime bağımlılığı kaldırıldı.
- Yanlış defteri detay ekranı artık community detail gövdesini import etmiyor.
- Legacy soru-cevap UGC yazma ve public `community-answers` medya erişimi için Supabase migration hazırlandı.
- `app.json` içinde Sentry ve `expo-widgets` plugin tekrarları temizlendi.
- `expo-secure-store` Face ID izin açıklaması üretmeyecek şekilde yapılandırıldı.
- Associated Domains, Android App Links, app içi destek metinleri ve paylaşım linkleri `maratonapp.com` ile uyumlu.
- Test durumu: `npm test` 624/624 başarılı. `npx expo config --type introspect --json` başarılı.

## P0 — Göndermeden Önce Kesin Çözülmeli

### 1. Alan adı ve yasal sayfalar yayınlanmalı

Kullanılacak canlı alan adı `maratonapp.com`.

Yayınlanması ve mobilde kontrol edilmesi gereken adresler:

- `https://maratonapp.com/privacy`
- `https://maratonapp.com/terms`
- `https://maratonapp.com/delete-account`
- `https://maratonapp.com/.well-known/apple-app-site-association`
- `https://maratonapp.com/.well-known/assetlinks.json`
- `destek@maratonapp.com`

`/delete-account` için sitede login zorunlu değildir. Sayfa, uygulama içindeki hesap silme yolunu anlatmalı ve kullanıcıya kendi hesap e-postasından `destek@maratonapp.com` adresine silme talebi başlatan belirgin bir mailto butonu sunmalıdır.

### 2. Kimlikler tekleştirilmeli

Nihai kimlik:

- iOS bundle ID: `com.ahmeterensiranli.maraton`
- Android package: `com.ahmeterensiranli.maraton`
- Widget App Group: `group.com.ahmeterensiranli.maraton`
- Widget extension bundle ID: `com.ahmeterensiranli.maraton.ExpoWidgetsTarget`

Apple Developer, Google Play Console, Supabase OAuth, AASA ve Android Asset Links aynı kimliği kullanmalıdır. Eski `com.maraton.app` doküman kalıntısı kullanılmamalıdır.

### 3. Topluluk / UGC kapsamı V1 için kapatıldı

Anonim soru-cevap topluluğu V1 dışı bırakıldı. Buna rağmen lig, grup, arkadaş ve profil alanlarında kullanıcı adı, profil fotoğrafı ve grup adı gibi kullanıcı kaynaklı içerikler kalır.

V1 için asgari kontrol:

- Lig, grup ve arkadaş alanlarında kullanıcı engelleme/şikayet yüzeyi netleştirilmeli.
- Kullanıcı adı ve grup adı için basit uygunsuz içerik filtresi eklenmeli veya review öncesi risk kabulü yapılmalı.
- Legacy community verisi silinmedi; yeni soru/cevap yazma ve public medya okuma migration ile kapatılacak.
- Migration canlı Supabase'e uygulanmadan önce staging veya production backup üzerinden doğrulanmalı.

### 4. Ödeme modeli

V1 ücretsizdir.

- App Store Connect ve Play Console'da IAP ürünü sunulmayacak.
- Store listing yalnız “tamamen ücretsiz” diyecek.
- Premium ilk sürümde açılmayacaksa RevenueCat, subscription terms, restore purchase ve fiyat metinleri görünür metne girmeyecek.

### 5. Kart ödeme

`PaymentCardScreen` kaynak dosyası legacy olarak durabilir; production navigation registry artık bu ekranı import etmiyor. V1 binary'de kart numarası/CVC isteyen bir akış açılmamalıdır.

## P1 — Yüksek Öncelik

### 6. İzinler ve production manifest

Expo introspection başarılıdır, ancak final `.ipa` ve `.aab` içinden `Info.plist` ve `AndroidManifest.xml` tekrar incelenmelidir.

Özellikle kontrol:

- `NSMicrophoneUsageDescription` ve `android.permission.RECORD_AUDIO` final build'de kalıyor mu?
- Fotoğraf/kamera izinleri yalnız yanlış soru fotoğrafı ve avatar akışında tetikleniyor mu?
- Local network / Expo Dev Client açıklamaları production archive içinde yok mu?
- Android storage izinleri Play Data Safety ile uyumlu mu?

### 7. Privacy labels ve data safety

App Store Privacy Labels ve Google Play Data Safety beyanları release binary ve canlı backend davranışıyla uyumlu olmalıdır.

Kapsanması gereken servisler:

- Supabase
- Sentry
- Expo/EAS/Updates/Notifications
- Apple ve Google auth/platform servisleri
- RevenueCat yalnız production'da yeniden aktif edilirse

“Hiçbir veri üçüncü taraflarla paylaşılmaz” gibi kesin ifadeler kullanılmamalıdır. Sentry ve Expo gibi servis sağlayıcılar reklam/tracking amacıyla değil, uygulama işlevi ve hata giderme için veri işler.

### 8. Store listing iddiaları

Şu iddialar çıkarıldı veya düzeltilmelidir:

- “Yapay zekâ destekli öneriler” kullanılmamalı; sistem kural/algoritma tabanlıdır.
- “Toplulukla yanlış paylaş ve çöz” V1 listing'de kullanılmamalı.

Güvenli alternatif:

- “Kişisel rota: bugün ne çalışacağını biz seçeriz”
- “Yanlışlarını fotoğrafla kaydet ve unutmadan tekrar et”
- “Deneme analizini ve net grafiğini takip et”

### 9. Reviewer demo hesabı

Demo hesapta en az şunlar olmalı:

- Onboarding tamamlanmış profil
- Örnek TYT/AYT denemeleri
- Çalışma kayıtları
- Yanlış defteri fotoğrafsız ve fotoğraflı örnekler
- Lig/grup/arkadaş yüzeylerini gösterecek örnek durum

## Reviewer Notes Taslağı

Maraton, YKS öğrencileri için günlük çalışma planı, deneme takibi ve yanlış tekrar uygulamasıdır.

Demo hesap: `[E-POSTA]` / `[ŞİFRE]`

Ana sekmeler: Rota, Program, +, Analiz ve Profil.

Deneme ekleme: orta `+` butonu → deneme ekleme akışı.

Yanlış ekleme: orta `+` butonu → yanlış soru ekleme akışı.

Deneme analizi: `Analiz` sekmesi.

Günlük rota ve çalışma planı: `Rota` ve `Program` sekmeleri.

Kamera ve fotoğraf izinleri yalnızca yanlış soru fotoğrafı, avatar ve paylaşım kartı akışlarında kullanılır.

Version 1.0'da ücretli özellik, uygulama içi satın alma veya kart ödeme bulunmamaktadır.

Hesap silme: `Profil` → `Ayarlar` → `Hesabı Sil`.

## Kalan Manuel Kontroller

- `maratonapp.com` yasal sayfaları ve `.well-known` dosyaları yayında mı?
- `destek@maratonapp.com` çalışıyor mu?
- Apple Developer'da App Group `group.com.ahmeterensiranli.maraton` kayıtlı mı?
- Supabase Apple/Google OAuth client değerleri nihai kimliklerle güncel mi?
- Hesap silme canlı veritabanında tüm kullanıcı tablolarını, `route_prefs` dahil, temizliyor mu?
- Legacy community UGC migration production'a uygulanacak mı, önce backup alındı mı?
- Final TestFlight ve Play internal build üzerinde izin promptları ve deep linkler gerçek cihazda doğrulandı mı?

## Resmî Kaynaklar

- Apple App Review Guidelines: https://developer.apple.com/app-store/review/guidelines/
- Apple screenshot gereksinimleri: https://developer.apple.com/help/app-store-connect/manage-app-information/upload-app-previews-and-screenshots
- Apple privacy manifests: https://developer.apple.com/documentation/BundleResources/privacy-manifest-files
- Expo SDK 57 ImagePicker: https://docs.expo.dev/versions/v57.0.0/sdk/imagepicker/
- Expo SDK 57 Widgets: https://docs.expo.dev/versions/v57.0.0/sdk/widgets/
- Google Play yayın rehberi: https://support.google.com/googleplay/android-developer/answer/15191715?hl=en

## Demo hesap

İnceleyici hesabını bu betik oluşturmaz. Önce uygulamadan gerçek bir demo kullanıcı hesabı açılmalı ve şifresi mağaza panelindeki inceleme notlarına manuel yazılmalıdır.

Demo kullanıcı açıldıktan sonra canlı Supabase projesine gerçekçi ama kişisel olmayan çalışma verisi eklemek için:

```bash
SUPABASE_URL="https://PROJECT_REF.supabase.co" \
SUPABASE_SERVICE_ROLE_KEY="SERVICE_ROLE_KEY" \
node scripts/seed-review-account.mjs reviewer@example.com
```

Windows PowerShell örneği:

```powershell
$env:SUPABASE_URL="https://PROJECT_REF.supabase.co"
$env:SUPABASE_SERVICE_ROLE_KEY="SERVICE_ROLE_KEY"
node scripts/seed-review-account.mjs reviewer@example.com
Remove-Item Env:\SUPABASE_SERVICE_ROLE_KEY
Remove-Item Env:\SUPABASE_URL
```

Güvenlik notları:

- `SUPABASE_SERVICE_ROLE_KEY` repoya yazılmayacak; yalnız geçici ortam değişkeni olarak kullanılacak.
- Betik kullanıcı hesabı veya şifre oluşturmaz. E-posta bulunamazsa durur.
- Betik yalnız çalışma verisi yazar; uydurma ad, okul, telefon, kimlik, fotoğraf veya gerçek kişisel veri üretmez.
- Betik iki kez çalıştırılırsa `appreview-demo:v1:*` operasyon kimlikli eski deneme, çalışma ve yanlış defteri kayıtlarını önce temizler; veri ikilenmez.

Betik şu demo verilerini oluşturur:

- Son 6 haftaya yayılan 3 TYT + 2 AYT Sayısal denemesi.
- Son 14 güne yayılan 12 çalışma kaydı; bazı kayıtlarda doğru sayısı dolu, bazıları yalnız konu çalışma seansı.
- Fotoğrafsız, notlu 6 yanlış defteri kaydı.
- TYT + AYT Sayısal profil ayarı, hedef net ve başlangıç neti.
- 10 günlük aktif seri.

Mağaza inceleme notlarında kullanılacak taslak:

```text
Demo hesap:
E-posta: [DEMO_EMAIL]
Şifre: [DEMO_PASSWORD]

Bu hesap gerçek kullanıcı değildir; App Review için örnek çalışma verisiyle hazırlanmıştır.
Uygulama ilk sürümde ücretsizdir. Premium, topluluk soru-cevap ve sosyal/lig akışları V1 inceleme kapsamına dahil değildir.

Önerilen kontrol akışı:
1. Giriş yapın.
2. Rota sekmesinde günlük çalışma planını ve seri durumunu görün.
3. Ortadaki + butonundan deneme veya çalışma kaydı ekleme akışını inceleyin.
4. Analiz sekmesinde TYT/AYT deneme grafikleri ve ders kırılımlarını görün.
5. Profil/Ayarlar üzerinden gizlilik, hesap ve destek bağlantılarını kontrol edin.
```
