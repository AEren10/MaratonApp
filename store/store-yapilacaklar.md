# Maraton — Mağaza Yayın Kontrol Listesi

Son güncelleme: 2026-06-20

---

## 1. Apple App Store

### 1.1 Apple Developer Program

- [ ] Apple Developer Program'a kayıt ol ($99/yıl) — https://developer.apple.com/programs/
- [ ] Kayıt onayını bekle (genellikle 24-48 saat, bazen 1 hafta)
- [ ] Apple Developer hesabında ödeme bilgilerini ekle (ücretli uygulama yayınlamayacaksan bile gerekli)

### 1.2 App Store Connect — Uygulama Oluşturma

- [ ] App Store Connect'te "My Apps" > "+" > "New App" ile uygulama oluştur
  - Platform: iOS
  - Name: `Maraton: YKS Çalışma Takibi`
  - Primary Language: Turkish
  - Bundle ID: `com.maraton.app` (Apple Developer portalında kayıtlı olmalı)
  - SKU: `maraton-app` (benzersiz, bir kez girilir)
- [ ] Kategori seç: **Education** (Eğitim)
- [ ] Fiyat: **Free** (Ücretsiz) olarak ayarla

### 1.3 Sertifika & Provisioning Profile

> EAS Build, sertifika ve profilleri otomatik yönetir. Manuel müdahale gerekmez, ancak ilk build'de EAS'e Apple hesap bilgilerin sorulacak.

- [ ] İlk production build'i çalıştırarak EAS'in sertifikaları oluşturmasını sağla:
  ```
  eas build --platform ios --profile production
  ```
- [ ] EAS'in sorduğu Apple Developer e-posta ve şifresini gir
- [ ] "Let EAS manage your credentials" seçeneğini onayla (önerilen)
- [ ] Build tamamlandıktan sonra Distribution Certificate ve Provisioning Profile'ın oluştuğunu doğrula:
  ```
  eas credentials --platform ios
  ```

### 1.4 Store Listing — Görseller

- [ ] 5 adet ekran görüntüsü hazırla (sıra ve içerik için bkz. `store/listing-tr.md`):
  - [ ] iPhone 6.7" (1290 × 2796 px) — iPhone 15 Pro Max / 16 Pro Max
  - [ ] iPhone 5.5" (1242 × 2208 px) — iPhone 8 Plus (zorunlu)
- [ ] Ekran görüntüsü overlay'lerini tasarla (başlık + cihaz çerçevesi + arka plan):
  1. Sıralama simülatörü — "Sıralamanı anında gör"
  2. Günlük plan + seri — "Günlük planınla hedefe koş"
  3. Deneme analizi grafiği — "Netlerin nasıl yükseliyor?"
  4. Yanlış defteri — "Yanlışlarını fotoğrafla, tekrarla"
  5. Lig & sosyal — "Arkadaşlarınla yarış"
- [ ] (Opsiyonel) 15-30 saniye App Preview videosu hazırla (H.264, ses opsiyonel)
- [ ] 1024 × 1024 px App Icon'un hazır olduğunu doğrula (`assets/icon.png`)

### 1.5 Store Listing — Metin

- [ ] Başlık gir: `Maraton: YKS Çalışma Takibi` (store/listing-tr.md'den)
- [ ] Alt başlık gir: `Deneme analizi & net takip`
- [ ] Keywords gir: `yks,tyt,ayt,deneme,net hesaplama,sıralama,çalışma takip,yanlış defteri,ders programı,sınav hazırlık`
- [ ] Promosyon metni gir (170 karakter)
- [ ] Açıklama gir (store/listing-tr.md'deki Apple App Store açıklaması)
- [ ] Destek URL'si gir: `https://maraton.app`
- [ ] Gizlilik Politikası URL'si gir: `https://maraton.app/privacy`

### 1.6 Privacy Nutrition Labels

- [ ] App Store Connect > App Privacy bölümünü doldur
- [ ] `store/privacy-labels.md` dosyasını referans alarak veri türlerini işaretle:
  - [ ] Data Used to Track You: yok
  - [ ] Data Linked to You: Contact Info (e-posta), Usage Data
  - [ ] Data Not Linked to You: yok (tüm veriler hesaba bağlı)
- [ ] Her veri türü için toplama amacını belirt (App Functionality)
- [ ] "Publish" ile kaydet

### 1.7 Yaş Derecelendirmesi

- [ ] Age Rating anketini doldur:
  - Tüm sorulara "None" / "No" cevabı ver (şiddet, kumar, yetişkin içerik yok)
  - Sonuç: **4+** olmalı
- [ ] "Made for Kids" sorusuna **No** cevabı ver (Kids Category'de değiliz)

### 1.8 App Review Bilgileri

- [ ] Demo hesap bilgilerini hazırla (Apple review ekibi için):
  - E-posta: `review@maraton.app` (veya test hesabı)
  - Şifre: güçlü bir test şifresi
  - Not: Hesaba örnek deneme sonuçları ve çalışma verileri ekle
- [ ] Contact Information bölümünü doldur:
  - Ad, soyad, telefon, e-posta
- [ ] Review Notes'a ekle:
  ```
  Bu uygulama YKS sınavına hazırlanan öğrenciler için bir çalışma takip aracıdır.
  Uygulama tamamen ücretsizdir, reklam ve uygulama içi satın alma yoktur.
  Test hesabı ile giriş yaparak tüm özellikleri deneyebilirsiniz.
  Kamera ve galeri izinleri sadece "Yanlış Defteri" özelliğinde kullanılır.
  ```
- [ ] `ITSAppUsesNonExemptEncryption: false` app.json'da zaten ayarlı — doğrula

### 1.9 Build & Upload

- [ ] Production build al:
  ```
  eas build --platform ios --profile production
  ```
- [ ] Build başarılı olduğunda App Store Connect'e gönder:
  ```
  eas submit --platform ios --profile production
  ```
- [ ] App Store Connect'te build'in göründüğünü doğrula (Processing 5-30 dk sürebilir)
- [ ] Compliance bilgisini onayla ("Uses Encryption: No" — app.json'da ayarlı)

### 1.10 TestFlight Beta Test

- [ ] App Store Connect > TestFlight > Internal Testing grubu oluştur
- [ ] Test kullanıcılarını ekle (Apple ID e-postaları ile)
- [ ] Build'i test grubuna dağıt
- [ ] En az 2-3 farklı cihazda test et:
  - [ ] Kayıt akışı
  - [ ] Deneme girişi ve analizi
  - [ ] Günlük plan oluşturma
  - [ ] Yanlış defteri fotoğraf çekimi
  - [ ] Bildirimler
  - [ ] Hesap silme akışı
- [ ] Crash ve hata raporlarını kontrol et

### 1.11 Submit for Review

- [ ] Version bilgisini son kontrol et (1.0.0)
- [ ] "Add for Review" butonuna bas
- [ ] "Submit to App Review" ile gönder
- [ ] Bekleme süresi: genellikle 24-48 saat (ilk uygulama daha uzun sürebilir)
- [ ] Reddedilirse: ret nedenini oku, düzelt, tekrar gönder

---

## 2. Google Play Store

### 2.1 Google Play Developer Hesabı

- [ ] Google Play Console'a kayıt ol ($25 tek seferlik) — https://play.google.com/console/signup
- [ ] Kimlik doğrulama sürecini tamamla (birkaç gün sürebilir)
- [ ] Geliştirici profil bilgilerini doldur (ad, adres, e-posta, telefon)

### 2.2 Uygulama Oluşturma

- [ ] Play Console > "Create app" ile uygulama oluştur:
  - App name: `Maraton: YKS Çalışma Takibi`
  - Default language: Turkish (tr-TR)
  - App or game: App
  - Free or paid: Free
- [ ] Declarations (beyanlar) bölümündeki soruları yanıtla:
  - [ ] Reklam var mı? Hayır
  - [ ] Developer Program Policies kabul

### 2.3 Store Listing — Görseller

- [ ] En az 4 adet ekran görüntüsü yükle (store/listing-tr.md sırasına göre):
  - Boyut: Minimum 1080 × 1920 px, önerilen 1440 × 2560 px
  - [ ] Sıralama simülatörü — "Sıralamanı anında gör"
  - [ ] Günlük plan + seri — "Günlük planınla hedefe koş"
  - [ ] Deneme analizi grafiği — "Netlerin nasıl yükseliyor?"
  - [ ] Yanlış defteri — "Yanlışlarını fotoğrafla, tekrarla"
  - [ ] Lig & sosyal — "Arkadaşlarınla yarış"
- [ ] Feature Graphic hazırla ve yükle: 1024 × 500 px (Play Store'da zorunlu)
- [ ] App Icon'un 512 × 512 px olarak hazır olduğunu doğrula
- [ ] (Opsiyonel) Promo videosu: YouTube linki olarak ekle

### 2.4 Store Listing — Metin

- [ ] Uygulama adı: `Maraton: YKS Çalışma Takibi`
- [ ] Kısa açıklama (80 karakter): store/listing-tr.md'den
- [ ] Tam açıklama (4000 karakter): store/listing-tr.md'den
- [ ] İletişim bilgileri:
  - E-posta: `destek@maraton.app`
  - Website: `https://maraton.app`
  - Gizlilik Politikası: `https://maraton.app/privacy`

### 2.5 Data Safety Formu

- [ ] Policy > App content > Data safety bölümünü doldur
- [ ] `store/data-safety.md` dosyasını referans alarak:
  - [ ] Veri toplama ve paylaşma beyanı
  - [ ] Veri türleri: Personal info (e-posta), App activity, App info and performance
  - [ ] Veri güvenliği: Transit encryption (HTTPS), Deletion mechanism (hesap silme)
  - [ ] Üçüncü taraflarla paylaşım: Hayır (reklam ağı ve analitik SDK yok ise)
- [ ] Gizlilik politikası URL'si: `https://maraton.app/privacy`

### 2.6 Content Rating (IARC)

- [ ] Policy > App content > Content rating > Start questionnaire
- [ ] IARC anketini doldur:
  - Kategori: Education / Reference
  - Şiddet, kumar, cinsel içerik, dil: hepsi "Hayır"
  - User interaction: Evet (topluluk özellikleri varsa)
  - Location sharing: Hayır
- [ ] Sonuç: **Everyone** (Herkes) olmalı — onayla ve kaydet

### 2.7 Hedef Kitle & İçerik

- [ ] Policy > App content > Target audience and content
  - [ ] Target age: 13-17, 18+ (her ikisini de seç)
  - [ ] Appealing to children: tüm sorulara "Hayır"
  - [ ] "Not primarily child-directed" olarak işaretle
- [ ] Policy > App content > News apps: "Hayır"
- [ ] Policy > App content > COVID-19 contact tracing / status: "Hayır"
- [ ] Policy > App content > Government apps: "Hayır"
- [ ] Policy > App content > Financial features: "Hayır"

### 2.8 App Signing

- [ ] Google Play App Signing'i etkinleştir (ilk upload'da otomatik aktifleşir, önerilen)
- [ ] eas.json'daki `serviceAccountKeyPath` yolunu doğrula: `./pc-api-key.json`
- [ ] Google Cloud Console'da Service Account oluştur (henüz yoksa):
  1. Google Cloud Console > IAM > Service Accounts
  2. "Create Service Account" — isim: `play-console-eas`
  3. JSON key indir, projenin kök dizinine `pc-api-key.json` olarak kaydet
  4. Google Play Console > Setup > API access > bu service account'u bağla
  5. Permission ver: "Release to production" veya en azından "Release to testing tracks"
- [ ] `pc-api-key.json` dosyasının `.gitignore`'da olduğunu doğrula

### 2.9 Test Aşamaları

- [ ] Internal testing track'i oluştur (Play Console > Release > Testing > Internal testing)
- [ ] Test kullanıcılarını ekle (Google e-posta adresleri ile)
- [ ] İlk build'i al ve yükle:
  ```
  eas build --platform android --profile production
  eas submit --platform android --profile production
  ```
- [ ] Internal test build'ini doğrula — testers listesindeki hesapla test et
- [ ] Closed testing'e geç (en az 20 tester ile 14 gün test önerilen — zorunlu değil ama önerilir)
- [ ] Test kontrol listesi:
  - [ ] Kayıt akışı
  - [ ] Deneme girişi ve analizi
  - [ ] Günlük plan oluşturma
  - [ ] Yanlış defteri fotoğraf çekimi
  - [ ] Bildirimler
  - [ ] Hesap silme akışı
  - [ ] Farklı Android sürümlerinde test (en az Android 10+)

### 2.10 Production Release

- [ ] Tüm Policy checklist'lerinin yeşil olduğunu doğrula (Play Console > Policy status)
- [ ] "Countries / regions" bölümünde Türkiye'yi seç (veya tüm ülkeler)
- [ ] Production track'e release oluştur
- [ ] İlk production sürümü: %20 staged rollout önerilen (opsiyonel ama faydalı)
- [ ] Review süresi: genellikle 1-7 gün (ilk uygulama daha uzun)

---

## 3. Web & Altyapı

### 3.1 Domain & DNS

- [ ] `maraton.app` domainini satın al (Google Domains / Namecheap / Cloudflare)
- [ ] DNS yapılandırmasını yap:
  - A / CNAME kaydı: web hosting'e yönlendir
  - MX kaydı: e-posta servisi için (bkz. 3.3)
- [ ] SSL sertifikasının aktif olduğunu doğrula (HTTPS zorunlu)

### 3.2 Web Sayfalarını Deploy Et

- [ ] `web/` klasöründeki dosyaları `maraton.app` adresine deploy et:
  - `privacy.html` → `https://maraton.app/privacy`
  - `terms.html` → `https://maraton.app/terms`
  - `delete-account.html` → `https://maraton.app/delete-account`
- [ ] Hosting seçenekleri: Vercel, Netlify, Cloudflare Pages (ücretsiz tier yeterli)
- [ ] Deploy sonrası tüm URL'lerin çalıştığını doğrula:
  - [ ] `https://maraton.app/privacy` erişilebilir mi?
  - [ ] `https://maraton.app/terms` erişilebilir mi?
  - [ ] `https://maraton.app/delete-account` erişilebilir mi?
- [ ] Mobil görünümde düzgün göründüğünü kontrol et

### 3.3 E-posta

- [ ] `destek@maraton.app` e-posta adresini oluştur
  - Seçenekler: Google Workspace, Zoho Mail (ücretsiz 1 kullanıcı), Improvmx (forwarding)
  - Forwarding: `destek@maraton.app` → `ahmet.hi@hotmail.com` (en basit çözüm)
- [ ] MX kayıtlarını DNS'e ekle
- [ ] Test e-postası gönderip alarak çalıştığını doğrula
- [ ] (Apple Review için) `review@maraton.app` veya alternatif bir demo hesap e-postası oluştur

### 3.4 Deep Link / Universal Link (Opsiyonel ama Önerilen)

- [ ] Apple App Site Association dosyasını `maraton.app/.well-known/apple-app-site-association` yoluna koy
- [ ] Android Asset Links dosyasını `maraton.app/.well-known/assetlinks.json` yoluna koy
- [ ] `maraton` URL scheme'inin app.json'da zaten tanımlı olduğunu doğrula

---

## 4. Hata Takibi & Monitoring

### 4.1 Sentry Kurulumu

- [ ] Sentry.io'da hesap oluştur (ücretsiz plan yeterli)
- [ ] Yeni proje oluştur: React Native, proje adı `maraton`
- [ ] DSN'yi al ve environment variable olarak ayarla
- [ ] EAS Build'de Sentry DSN'yi secret olarak ekle:
  ```
  eas secret:create --name SENTRY_DSN --value "https://xxx@sentry.io/yyy" --scope project
  ```
- [ ] Production build'de Sentry'nin çalıştığını doğrula (test crash gönder)

### 4.2 Supabase Production

- [ ] Supabase projesinin production modda olduğunu doğrula
- [ ] RLS (Row Level Security) politikalarının aktif olduğunu doğrula
- [ ] Database backup'larının etkin olduğunu doğrula
- [ ] Rate limiting / abuse protection ayarlarını gözden geçir

---

## 5. Demo & Test Hesabı

- [ ] Apple Review için demo hesap oluştur:
  - E-posta: `review@maraton.app` (veya `demo@maraton.app`)
  - Şifre: güçlü, hatırlanabilir (Apple ekibi kullanacak)
- [ ] Demo hesaba örnek veri ekle:
  - [ ] En az 3 deneme sonucu (TYT + AYT)
  - [ ] Birkaç günlük çalışma kaydı
  - [ ] Yanlış defterinde birkaç kayıt
  - [ ] Aktif bir seri (streak)
- [ ] Demo hesabın tüm özelliklere erişebildiğini doğrula
- [ ] Demo hesap bilgilerini güvenli bir yere not et

---

## 6. Son Kontroller (Her İki Platform)

### 6.1 Build Öncesi

- [ ] `app.json` version: `1.0.0` doğrula
- [ ] `app.json` ios.buildNumber: `1` doğrula
- [ ] `app.json` android.versionCode: `1` doğrula
- [ ] Console.log'ların production'da kapalı olduğunu doğrula
- [ ] Tüm ekranlarda ScreenErrorBoundary var mı kontrol et
- [ ] Splash screen düzgün görünüyor mu?
- [ ] App icon tüm boyutlarda düzgün mü?

### 6.2 Fonksiyonel Test

- [ ] Yeni hesap oluşturma akışı
- [ ] Giriş / çıkış akışı
- [ ] Şifre sıfırlama
- [ ] Hesap silme (Apple zorunlu kılıyor)
- [ ] Bildirim izni isteme
- [ ] Kamera / galeri izni isteme
- [ ] Offline durumda uygulama çökme testi
- [ ] Farklı ekran boyutlarında düzen kontrolü

### 6.3 Hukuki & Uyumluluk

- [ ] Gizlilik politikası web sayfası erişilebilir ve güncel
- [ ] Kullanım koşulları web sayfası erişilebilir ve güncel
- [ ] Hesap silme mekanizması çalışır durumda (Apple ve Google zorunluluğu)
- [ ] KVKK uyumluluğu gözden geçirildi (Türk kullanıcılar için)
- [ ] 13 yaş altı kullanıcılar için veli onayı gerekli mi değerlendir

---

## 7. Launch Sonrası

- [ ] Her iki mağazada uygulamanın yayında olduğunu doğrula
- [ ] Store listing'deki tüm bilgilerin doğru göründüğünü kontrol et
- [ ] Uygulama indirip kurulum testi yap (kendi telefonundan)
- [ ] Sentry'de production hataları izlemeye başla
- [ ] Supabase dashboard'da kullanıcı kayıtlarını izle
- [ ] Store rating ve yorumları takip etmeye başla (AppFollow veya benzeri araç)
- [ ] Destek e-postasını düzenli kontrol et

---

## Hızlı Referans — EAS Komutları

```bash
# iOS production build
eas build --platform ios --profile production

# Android production build
eas build --platform android --profile production

# iOS App Store'a gönder
eas submit --platform ios --profile production

# Google Play'e gönder (internal track)
eas submit --platform android --profile production

# Her iki platforma aynı anda build
eas build --profile production

# Credentials kontrol
eas credentials --platform ios
eas credentials --platform android

# Secret ekleme (Sentry DSN vb.)
eas secret:create --name SENTRY_DSN --value "..." --scope project
```
