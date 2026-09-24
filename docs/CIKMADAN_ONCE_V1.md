# Çıkmadan önce — v1 yayın listesi

Durum tarihi: 2026-09-24. Aşağıdakiler **repoda ve canlı veritabanında
doğrulanarak** yazıldı; doğrulanamayanlar "bilinmiyor" diye işaretli.

İşaretler: ✅ hazır · 🔴 çıkışı engeller · 🟡 gerekli ama engellemez · ❔ doğrulanamadı

---

## 0. Bir bakışta

| Alan | Durum |
|---|---|
| Kod / proje | Büyük ölçüde hazır, cihaz doğrulaması eksik |
| Supabase | Çalışıyor, migration defteri yerelle uyuşmuyor |
| Apple hesabı | ✅ Individual, enrollment A6T3MC86TR |
| App Store Connect kaydı | 🔴 yok |
| Mağaza görselleri/metni | 🔴 hiçbiri yok |
| Gizlilik + destek sayfaları | 🔴 yok |
| Android | Hesap yok, uygulama hiç Android'de görülmedi |

iOS'ta somut engel 5 madde. İkisi bir öğleden sonrada biter.

---

## A. Kod / proje tarafı

### A1. Cihazda doğrulanmamış işler 🔴

Yazıldı ama iOS'ta hiç görülmedi. Production build öncesi hepsi bir dev
build'de görülmeli:

- [ ] Dört widget (Bugün / Tekrar / Rota / Bu hafta)
- [ ] Widget zemin düzeltmesi (ana ekranda kırmızı yer tutucu sorunu)
- [ ] Durak tiki → çalışma kaydı yazması, çubukların dolması
- [ ] Günü kapatma sayacı (kopya durak hatası sonrası)
- [ ] Analiz'deki Denemeler / Yanlış Defteri segmenti
- [ ] Grup oluşturma (PostgREST aşırı yükleme düzeltmesi sonrası)
- [ ] Çalışma geçmişine giden haftalık grafik dokunuşu
- [ ] Story paylaşımı (bir kez çalıştığı doğrulandı, çökme düzeltmesi sonrası tekrar)

### A2. Temiz çıkanlar ✅

- console.log src'de 0
- DEV_BYPASS kodda yok
- 572 test geçiyor, altı proje denetimi temiz
- Hesap silme, gizlilik, veri indirme ekranları mevcut
- Kullanıcı üretimi genel içerik yok → Guideline 1.2 moderasyon
  zorunluluğu v1'i bağlamıyor

### A3. Ölü kod 🟡

- [ ] src/screens/groups/ komple ulaşılamaz (5 ekran + ~13 bileşen).
      Sosyal Merkez'e geçişten sonra kapısı kalmadı. Codex'e verildi.
- [ ] check:orphans ulaşılabilirliğe bakmıyor — kayıtlı ama hiçbir yerden
      navigate edilmeyen ekranı yakalamıyor

### A4. Bilinen açık kurgu işleri 🟡

- [ ] Onboarding 6 ekran, kısaltılmalı
- [ ] Onboarding bitişi → ilk çalışma oturumu arası tasarlanmamış
- [ ] PROGRAM sekmesi hâlâ Müfredat ekranını açıyor (tasarım testi sekme
      adını kilitliyor; değişmesi gereken ekran — navigasyon işi)
- [ ] İlk gün / boş durum ekranları gözden geçirilmeli

---

## B. Backend / Supabase

### B1. Migration defteri uyuşmazlığı 🔴

Yerel dosya adlarındaki zaman damgaları canlı defterle farklı:

| Migration | Canlı | Yerel dosya |
|---|---|---|
| clde_my_groups_user_rank | 20260920010941 | 20260920010000 |
| clde_grant_net_column_writes | 20260921161331 | 20260921030000 |
| clde_private_export_and_fk_indexes | 20260922214738 | 20260923000000 |
| clde_plan_tasks_unique_per_plan | 20260923005505 | 20260923120000 |
| clde_drop_stale_create_group_overload | 20260924005001 | 20260924090000 |

Sonucu: supabase db push bunları uygulanmamış sanıp tekrar çalıştırır.
Çoğu idempotent ama:

- 20260920050000_fix_generate_group_code_builtin_random defterde hiç yok
- 20260911142337_cdx_data_integrity_fixes hiç uygulanmadı; içindeki rota
  bloğu bilerek yorum satırına alındı (canlıdaki sürüm daha yeni)

- [ ] Defter ile yerel klasör tek tek eşitlenmeli

### B3. Çökme raporlama kapalı 🔴

Bugün fark edildi: **hiçbir çökme raporu toplanmıyor.**

- Paket kurulu (`@sentry/react-native` 7.11.0), `app.json`'da eklenti kayıtlı
- Ama `.env.local`'da `EXPO_PUBLIC_SENTRY_DSN` satırı **yorum satırı**
- `src/lib/errorReporting.js:11` DSN yoksa hemen dönüyor → `Sentry.init` hiç
  çağrılmıyor
- EAS ortamlarında da tanımlı değil

Yani mağazada bir kullanıcının telefonunda çöktüğünde haberin olmaz.

- [ ] sentry.io'da organizasyon + proje aç, DSN al
- [ ] DSN'i EAS ortam değişkeni olarak ekle (production + preview)
- [ ] Kaynak haritası yüklemesini aç: org/proje adı + auth token.
      Şu an `SENTRY_DISABLE_AUTO_UPLOAD=true` ile kapalı (üç profilde de) —
      açılmazsa çökme raporu küçültülmüş yığın olarak gelir, satır göstermez
- [ ] `app.json`'da Sentry eklentisi İKİ KEZ kayıtlı (satır 71 ve 95),
      biri fazla olabilir

TestFlight için şart değil; herkese açık yayından önce şart.

### B2. Diğer

- ✅ Storage bucket'ları: avatars, wrong-questions, community-answers
- ✅ RLS açık; user_entitlements / feature_usage_events bilerek politikasız
      (dar RPC üzerinden okunuyor)
- ✅ SECURITY DEFINER RPC'leri auth.uid() ile çağıranı tanıyor
- 🟡 Leaked password protection kapalı — Supabase Auth ayarı, tek tık
- [ ] E-posta doğrulama politikası kararı
- [ ] Yayın öncesi son kez security + performance advisor taraması

---

## C. Apple / App Store Connect

- [ ] 🔴 App Store Connect'te uygulama kaydı oluştur
      (ad, bundle com.ahmeterensiranli.maraton, SKU, birincil dil)
- [ ] 🔴 eas.json → submit.production.ios doldur: appleId, ascAppId,
      appleTeamId (şu an boş)
- [ ] 🔴 İnceleyici için test hesabı: App Review Information →
      Sign-In Required. Çalışan e-posta/şifre, ve hesabın İÇİ DOLU olmalı
      (boş hesap "uygulama çalışmıyor" diye reddettirebiliyor)
- [ ] Privacy Nutrition Label formu — Supabase'de tutulan her veri beyan edilmeli
- [ ] Yaş sınırı: 4+ yeterli
- [ ] Kategori: Education
- ✅ Export compliance: ITSAppUsesNonExemptEncryption false, zaten var
- ❔ İlk production build Apple ID girişi isteyecek: widget ikinci bir
      target (ExpoWidgetsTarget) açtığı için onun dağıtım profili ayrıca üretilecek

---

## D. Mağaza görselleri ve metin — hiçbiri yok 🔴

### D1. Görseller

- ✅ assets/icon.png, adaptive-icon.png, splash-icon.png, favicon.png var
- [ ] ❔ İkon 1024x1024 ve köşe yumuşatması olmadan mı — doğrulanmadı
- [ ] iPhone 6.7" ekran görüntüleri (1290x2796) — en az 3, önerilen 5-6
- [ ] iPhone 5.5" ekran görüntüleri (1242x2208)
- [ ] (opsiyonel) App Preview videosu
- iPad gerekmiyor: supportsTablet false

Hangi ekranlar: ana sayfa (dolu veriyle), rota grafiği, günün durakları,
yanlış defteri/tekrar, analiz, widget'lar. Boş hesapla çekilmemeli —
ekran görüntüsü ürünün vaadidir.

### D2. Metin

- [ ] Uygulama adı (30 karakter) ve alt başlık (30 karakter)
- [ ] Anahtar kelimeler (100 karakter)
- [ ] Açıklama (4000 karakter) — TR zorunlu
- [ ] Yenilikler metni
- [ ] Promosyon metni (170 karakter, incelemesiz güncellenebilir)

### D3. Zorunlu URL'ler 🔴

- [ ] Gizlilik politikası URL'si — barındırılan sayfa, zorunlu
- [ ] Destek URL'si — zorunlu
- [ ] (opsiyonel) Pazarlama URL'si

Uygulamanın içinde gizlilik EKRANI var ✅ ama mağazanın istediği şey
herkese açık bir WEB ADRESİ. İkisi ayrı.

---

## E. Android — ayrı ve daha uzun takvim

- [ ] Google Play Console hesabı ($25, tek seferlik) — yok
- [ ] Kimlik doğrulaması (kişisel hesap)
- [ ] 12 tester x 14 gün kesintisiz kapalı test — kişisel hesaplarda zorunlu.
      "Hazırım" dediğin günden en erken 2 hafta sonra yayın.
- [ ] Uygulama Android'de hiç görülmedi. Font yükseklikleri, elevation,
      safe area, geri tuşu, klavye — hepsi farklı çıkabilir.
- [ ] Adaptive icon kontrolü
- [ ] Story Kademe B Android tarafı denenmedi (kod var)
- [ ] Widget Android'de kapalı (expo-widgets Android yolu deneysel)

---

## F. Yayın günü sırası

1. Dev build al, A1'deki her maddeyi cihazda gör
2. Gizlilik + destek sayfalarını yayınla (en küçük iş, en sert engel)
3. App Store Connect kaydı + eas.json submit bilgileri
4. Migration defterini eşitle (B1)
5. Demo hesabı oluştur, içini doldur
6. Ekran görüntüleri ve mağaza metni
7. eas build --profile production --platform ios
8. eas submit --platform ios → TestFlight iç test
9. Privacy label + App Review Information formları
10. İncelemeye gönder
11. Paralel: Play Console hesabını aç, kapalı test sayacını başlat

---

## G. Bilerek v1 dışında

- Topluluk soru-cevap (Guideline 1.2 moderasyon yükü)
- Android widget
- Premium silinmedi, kapatıldı
