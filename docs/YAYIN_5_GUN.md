# Markete çıkış: 5 gün (1–5 Ekim 2026)

**Hedef:** 5 Ekim Pazartesi akşamı iOS sürümü App Review'a gönderilmiş olsun. Apple incelemesi genelde 24-48 saat.
**Kapsam:** Yalnız iOS. Android ayrı ve daha uzun bir takvim (12 test kullanıcısı x 14 gün).
**Kaynak listeler (arşiv, detay için):** `docs/CIKMADAN_ONCE_V1.md`, `store/appreview.md`, `store/store-yapilacaklar.md`.

Sahipler: **Sen** · **Claude** (akış, mantık, DB) · **Codex** (veri, mağaza) · **Ant** (ekran)

---

## Gün 1 · Perşembe 1 Ekim: Kararlar ve altyapının başlaması

Uzun süren dış işler bugün başlamalı; onları beklerken kod işleri akar.

- [ ] **Sen:** App Store Connect'te uygulama kaydını aç.
  - Ad
  - Bundle `com.ahmeterensiranli.maraton`
  - SKU
  - Dil: Türkçe
  - Kategori: Education
- [ ] **Sen:** Codex'e `appleId`, `ascAppId` ve `appleTeamId` değerlerini ver.
- [ ] **Sen:** Alan adı kararı. `maraton.app` şu an çözümlenmiyor.
  - Hızlı yol: yasal sayfaları GitHub Pages ya da Vercel'in ücretsiz adresinde yayınla, alan adını sonra bağla.
- [ ] **Sen:** Supabase'de leaked password ayarını geri kapat.
- [ ] **Sen (canlı test):** 1 Ekim ay dönümü. Ay görünümü, ay özeti ve seri doğru geçti mi?
- [ ] **Codex:** Yasal sayfaları yayınla (`web/privacy.html`, `terms.html`, `delete-account.html`) ve destek e-postasını kur.
- [ ] **Codex:** `eas.json` → `submit.production.ios` alanını doldur.
- [ ] **Codex:** Belgelerdeki `com.maraton.app` kalıntılarını tekleştir.
- [ ] **Codex:** Topluluk soru-cevabının v1 grafiğinden tam çıktığını doğrula (Guideline 1.2); premium ve ödeme de öyle.
- [x] **Claude:** Bekleyen dört kararı uygula (1 Ekim, main):
  1. **Doğru sayısı:** Kayıt formlarında ve durak tikinde doğru sayısı sorulsun. Boş bırakılabilir; "bilinmiyor" 0 sayılmaz.
  2. **"Rotayı bitirdin · hedefe N soru":** Günün durakları bitti ama soru hedefi dolmadıysa gösterilecek metin.
  3. **"Gelecek haftadan öne çek":** Hafta bitince sonraki haftanın ilk durağını bugüne alma seçeneği.
  4. **Aylık hatırlatma:** "Okulda bitirdiğin konuları işaretle."
- [ ] **Claude:** `DURUM.md`'yi bu plana göre güncelle.
- [ ] **Ant:** Brief 19 (kutu temizliği).

## Gün 2 · Cuma 2 Ekim: İlk giriş ve onboarding

Apple incelemecisinin ve her yeni kullanıcının ilk gördüğü yer burası.

- [ ] **Claude:** Yeni hesapla uçtan uca akış.
  - Kayıt → sınav/hedef → ilk rota → ilk durak → ilk kayıt.
  - Onboarding bitişiyle ilk çalışma arası tasarlanmamıştı; kapat.
  - Gereksiz adımları kısalt.
- [ ] **Claude:** Çıkış yap / tekrar giriş, şifre sıfırlama, hesap silme uçtan uca.
- [ ] **Ant:** Onboarding ekranlarının görünümü (brief 20, Claude yazacak).
- [ ] **Codex:** Migration defterini canlı veritabanıyla eşitle; Supabase security ve performance advisor taraması.
- [ ] **Codex:** İnceleyici demo hesabı.
  - Dolu veri: 3+ deneme (TYT + AYT), birkaç günlük kayıt, yanlış defteri, aktif seri.
  - Boş hesap ret sebebi olabilir.
- [ ] **Sen:** Sıfırdan yeni bir hesapla uygulamayı baştan sona dene, gördüğünü at.

## Gün 3 · Cumartesi 3 Ekim: Açık tema, bildirimler, Story, cihaz build'i

- [ ] **Sen + Ant:** Açık tema için bir tur düzeltme.
  - **Kural:** Akşama kadar iyi görünmezse v1'de açık tema seçeneğini gizle; yarım bırakılmaz.
- [ ] **Sen + Claude:** Bildirimler cihazda: izin isteme, günlük hatırlatma gerçekten geliyor mu, dokununca doğru ekran açılıyor mu.
- [ ] **Claude / Ant:** Story Kademe A'yı bitir. Kademe B (Meta App ID) v1.0.1'e kalır.
- [ ] **Claude:** `app.json` → `runtimeVersion` sabit `"1.0.0"`. Bu hâliyle bir OTA güncellemesi, native kodu farklı bir build'e de iner ve uygulamayı çökertebilir. Production build'den önce `{ "policy": "fingerprint" }` yapılmalı.
- [ ] **Sen:** Dev build al (`npx expo install --fix` sonrası). Cihazda doğrulanmamış işler:
  - Widget'lar
  - Durak tiki → kayıt
  - Günü kapatma
  - Story paylaşımı
  - Swipe-back

## Gün 4 · Pazar 4 Ekim: Kod dondurma, mağaza malzemesi

**Bu günden sonra yalnız hata düzeltilir, yeni özellik yok.**

- [ ] **Sen:** Production build al ve TestFlight'a gönder (`eas build` / `eas submit`, profil: `production`).
- [ ] **Sen + Codex:** Ekran görüntüleri, demo hesaptan dolu veriyle.
  - 6.7" (1290x2796) ve 5.5" (1242x2208), 5-6 adet.
  - Aday ekranlar: ana sayfa, rota grafiği, günün durakları, Ders analizi, yanlış defteri, widget.
- [ ] **Codex:** Mağaza metinlerini güncelle (`store/listing-tr.md`). Lig, sosyal ve topluluk vaatleri metinden çıkmalı; v1'de yoklar.
- [ ] **Codex:** Privacy Nutrition Label, yaş derecelendirmesi (4+) ve App Review notu.
  - Not metni: premium yok, topluluk yok, kamera yalnız yanlış defteri için.
- [ ] **Claude:** TestFlight build'inde kritik senaryo turu. Bulunan her hata aynı gün düzeltilir.

## Gün 5 · Pazartesi 5 Ekim: Son tur ve gönderim

- [ ] **Sen (sabah):** Hafta devri canlı testi. Donmuş haftanın gerçekten ilk devri:
  - Yeni hafta kuruldu mu?
  - Geçen haftadan kalanlar doğru düştü mü?
  - Ana sayfa, Program ve Rota aynı şeyi mi söylüyor?
- [ ] **Hepsi:** Son senaryo turu (aşağıdaki liste).
- [ ] **Sen:** App Store Connect'te son kontrol, ardından **Submit for Review**.

---

## Her build'de oynanacak senaryolar

1. Sıfırdan hesap → ilk durak → ilk kayıt → ilk deneme
2. Durak ekle / taşı / ertele → ana sayfa, Program ve Rota anında güncelleniyor (uygulamayı kapatıp açmadan)
3. İnternetsiz kayıt → bağlantı gelince sunucuya gidiyor
4. Çıkış → farklı hesapla giriş → eski hesabın verisi görünmüyor
5. TYT ↔ AYT değişimi
6. Gece yarısı dönümü (00:00–03:00 arası "bugün" doğru mu?)
7. Hesap silme
8. Hiçbir yerde ödeme ekranı, "Premium" vaadi ya da topluluk girişi çıkmıyor

## Bilerek v1.0.1'e bırakılanlar

- Animasyon cilası (ekranlar oturduktan sonra, tek seferde)
- Story Kademe B (Meta App ID)
- Kaydırınca ışığın sönmesi
- Android (Play Console hesabı ve 14 günlük kapalı test ayrı takvimde)

## Riskler

- **Alan adı ve e-posta** bir günde bitmeyebilir: ücretsiz barındırma adresiyle başla.
- **İlk production build** widget hedefi için ayrı dağıtım profili ister; EAS Apple girişi soracak, bu adım sende.
- **İnceleme reddi** en çok boş demo hesap, ölü bağlantı ya da ödeme vaadi yüzünden gelir. Üçü de yukarıda ele alındı.
