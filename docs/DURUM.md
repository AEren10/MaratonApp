# Nerede duruyoruz — 25 Eylül 2026

Kafan karıştıysa **tek bakman gereken dosya bu.** Diğer üçü artık arşiv:

| Dosya | Ne işe yarıyor |
|---|---|
| `TARAMA_2026-09-24.md` | 24 Eylül taraması. Bulguları aşağıya taşındı. |
| `CIKMADAN_ONCE_V1.md` | Mağaza/backend kontrol listesi. Detay için hâlâ geçerli. |
| `KURGU_RAPORU.md` | Akış raporu. Kalan maddeleri aşağıda. |

Aşağıdaki her satır **25 Eylül'de kodda doğrulandı**. Tahmin yok.

---

## 1. Şu an nerede olduğun

- Uygulama **TestFlight'ta**, kendi telefonunda çalışıyor
- Apple Developer hesabı hazır (enrollment A6T3MC86TR)
- Widget'lar cihazda doğrulandı, çalışıyor
- 582 test + yedi proje denetimi temiz
- Hareket sistemi bitti: basma kapsamı %93, rota çizgisi çiziliyor, sayılar sayıyor

**Mağazaya çıkmaya engel olan şey kod değil.** Aşağıdaki 3. bölüm.

---

## 2. Kodda açık kalan işler

Sıra, "kullanıcı bunu ne kadar çabuk hisseder"e göre.

### 🔴 1. İlk gün / boş durumlar — en büyük kör nokta
Bu ay yapılan her şey **dolu bir hesap** varsayıyor. Haftalık çubuklar, net
trendi, tekrar bekleyen sorular, grup sıralaması — yeni kullanıcıda hiçbiri yok.
O boş hâllerin çoğu hiç tasarlanmadı.

Sekme sırasından çok daha fazla terk üretecek yer burası. Mağazaya çıkmadan
önce kapatılmalı, çünkü ilk açılışı gören herkes buradan geçiyor.

### 🔴 2. Ana sayfa bütçesi yok
Ana sayfada 14 blok var. Ekran **"nasıl gidiyorum"** sorusunu beş kez
(kahraman sayı, grafik, rota şeridi, durak sayacı, konu borcu),
**"şimdi ne yapayım"** sorusunu bir kez cevaplıyor. Masaya oturan öğrencinin
sorusu ikincisi.

Kural gerekiyor: yeni özellik kart eklemek istiyorsa mevcut bir kartı çıkarmalı.

### 🔴 3. Rota önbelleği içerik değil uzunluk izliyor — Codex
`src/hooks/useStudyRoute.js:170` — anahtar `weekLogs.length` ve
`topicRows.length` kullanıyor. Mevcut bir kaydı **düzenlersen** uzunluk aynı
kalır, rota yeniden hesaplanmaz. Çalışma geçmişinde satır düzenlenebildiği için
erişilebilir bir yol. Veri katmanı → Codex.

### 🟡 4. Onboarding
- 6 ekran, kısaltılmalı
- Onboarding bitişi → ilk çalışma oturumu arası hiç tasarlanmadı

### 🟡 5. PROGRAM sekmesi yanlış ekranı açıyor
Müfredat ekranını açıyor. Tasarım testi sekme adını kilitliyor; değişmesi
gereken ekran. Navigasyon işi, cihaz testi ister.

### 🟡 6. Ufak temizlikler
- `src/screens/groups/` boş `components/` klasörü kalmış, silinebilir
- `check:orphans` ulaşılabilirliğe bakmıyor: kayıtlı ama hiçbir yerden
  navigate edilmeyen ekranı yakalamıyor
- "Bu haftanın raporu" satırı ile haftalık grafik dokunuşu iki ayrı yere gidiyor
- Hareket: `useReducedMotion` Reanimated kullanan 165 dosyanın 11'inde
- Hareket: 18 `<Modal>` elle yapılmış, sürüklenip kapanmıyor
  (skill `presentation: 'formSheet'` diyor — platformun gerçek sheet'i)

### ✅ 25 Eylül'de kapananlar
- Grup kartı durak → tekrar komşuluğunu bölüyordu, sona alındı (Bulgu 3)
- `FadeInDown` 268 yerden kaldırıldı, sevilmeyen animasyon
- 50 dosyada animasyonsuz basma sıçraması gerçek eğriye çevrildi
- `runOnJS` 11 yerde `scheduleOnRN`'e taşındı (Reanimated 4'te deprecated)
- Rota hattı artık kendini çiziyor, düğümler hat varınca oturuyor
- Sayılar ve plan halkası sıfırdan doluyor
- 5 listede satır silinince zıplama yok

---

## 3. Mağazaya çıkmak için — asıl engel burada

Kod değil, evrak. Sıra önemli, üstten aşağı.

### 🔴 A. Gizlilik + destek sayfaları
En küçük iş, en sert engel. Apple **herkese açık web adresi** istiyor;
uygulama içindeki gizlilik ekranı bunu karşılamıyor, ikisi ayrı şey.
İki statik sayfa yeter (GitHub Pages bedava).

### 🔴 B. Çökme raporlama hiç açılmadı
`.env.local`'da `EXPO_PUBLIC_SENTRY_DSN` **yorum satırı** (satır 9).
`src/lib/errorReporting.js:11` DSN yoksa hemen dönüyor → `Sentry.init` hiç
çağrılmıyor. Yani mağazada bir kullanıcıda çöktüğünde haberin olmaz.

- sentry.io'da organizasyon + proje aç, DSN al
- DSN'i EAS ortam değişkeni yap (production + preview)
- `SENTRY_DISABLE_AUTO_UPLOAD=true` üç profilde de açık: kaynak haritası
  yüklenmiyor, çökme raporu satır göstermez
- `app.json`'da iki farklı Sentry eklentisi kayıtlı (satır 71
  `@sentry/react-native/expo`, satır 95 `@sentry/react-native`) — biri fazla

TestFlight için şart değil, herkese açık yayın için şart.

### 🔴 C. Mağaza görselleri ve metni — hiçbiri yok
- iPhone 6.7" (1290x2796) en az 3, önerilen 5-6 ekran görüntüsü
- iPhone 5.5" (1242x2208)
- Uygulama adı (30), alt başlık (30), anahtar kelimeler (100),
  açıklama (4000, TR zorunlu), promosyon metni (170)

**Ekran görüntüleri dolu hesapla çekilmeli.** Ekran görüntüsü ürünün vaadidir.
Hangileri: ana sayfa, rota grafiği, günün durakları, yanlış defteri, analiz, widget.

### 🔴 D. İnceleyici için demo hesabı
App Review Information → Sign-In Required. Çalışan e-posta/şifre **ve içi
dolu bir hesap** — boş hesap "uygulama çalışmıyor" diye reddettiriyor.

### 🟡 E. `eas.json` submit bilgileri boş
`submit.production.ios` = `{}`. TestFlight'a elle girerek çıktın; otomatik
göndermek istiyorsan appleId / ascAppId / appleTeamId doldurulmalı.

### 🟡 F. Migration defteri yerelle uyuşmuyor
Beş migration'ın canlı zaman damgası yerel dosya adından farklı; biri defterde
hiç yok. `supabase db push` bunları uygulanmamış sanıp tekrar çalıştırır.
Çoğu idempotent ama tek tek eşitlenmeli. Detay: `CIKMADAN_ONCE_V1.md` B1.

### 🟡 G. Supabase son kontroller
- Leaked password protection kapalı (tek tık)
- E-posta doğrulama politikası kararı
- Yayın öncesi security + performance advisor taraması

### Privacy Nutrition Label
Supabase'de tutulan her veri beyan edilmeli. Yaş 4+, kategori Education.

---

## 4. Android — ayrı ve çok daha uzun takvim

Uygulama Android'de **hiç görülmedi**. Play Console hesabı yok ($25).
Kişisel hesaplarda **12 tester × 14 gün kesintisiz kapalı test** zorunlu:
"hazırım" dediğin günden en erken iki hafta sonra yayın.

Font yükseklikleri, elevation, safe area, geri tuşu, klavye — hepsi farklı
çıkabilir. Widget Android'de kapalı, Story Kademe B denenmedi.

**Karar:** iOS'u çıkar, Android'i sonra. Aynı anda ikisi olmaz.

---

## 5. Sırf sıra sorarsan

1. Gizlilik + destek sayfası (yarım gün, en sert engel)
2. İlk gün / boş durumlar (kod tarafında en önemli)
3. Demo hesabı + içini doldur
4. Ekran görüntüleri + mağaza metni
5. Sentry
6. Ana sayfa bütçesi
7. Onboarding kısaltma
8. Migration defteri
