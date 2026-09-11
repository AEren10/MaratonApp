# Tasarım aktarımı — durum notu

**Tarih:** 2026-09-11 · **Dal:** `main` (push edilmiş) · **Toplam:** 56 CLD commit, bu oturumda 22
**Kapılar:** 179/179 test · `npm run check` üç kapı temiz · sapma her eksende düştü
(fontSize −44 · fontFamily −42 · spacing −79 · radius −21 · hex −10)

---

## Nerede duruyoruz

170 artboard → 95 navigasyon hedefi. Sosyal/topluluk (10 ekran) kapsam dışı.

| Faz | Konu | Durum |
|-----|------|-------|
| 1–1.5 | Envanter, akış denetimi, tasarım sistemi | ✅ |
| 2 | Sekme iskeleti, Ana Sayfa, rota grafiği | ✅ |
| 3 | Veri girişi | ✅ (OCR hariç) |
| 4 | Rota derinliği | ✅ |
| 5 | Analiz ve yanlış defteri | ✅ |
| 6 | Plan ve duraklar | ✅ **10/10** |
| 7 | Profil ve ayarlar | ⚠️ **7/15** |
| 8 | Premium ve ödeme | ⬜ |
| 9 | Zamana bağlı durumlar, kutlamalar | ⬜ |
| 10 | Boş/hata bileşenleri | ⬜ |

---

## FAZ 7 — biten 7

Profil kökü · Ayarlar · Gizlilik hub'ı · Belge (yeni) · Görünüm ·
Profil Düzenle · Hedef Düzenle · Şifre/E-posta Değiştir

## FAZ 7 — kalan 8

| Hedef | Durum | Not |
|--------|-------|-----|
| **Bildirimler** (gelen kutusu) | 🔴 engelli | tablo yok, aşağıya bak |
| **Bildirim ayarları** | ekran var, taşınmadı | `NotificationsSettingsScreen` |
| **Paylaşım Kartı** | ekran var, taşınmadı | `SHARE_CARD` kayıtlı |
| **Seviye** | ekran yok | `LEVEL` tanımlı değil |
| **Kilometre Taşı** | ekran yok | `MILESTONE` tanımlı değil |
| **Neye Göre Öneriyoruz** | ekran yok | `WHY_RECOMMEND` tanımlı değil |
| **Tarih Seçici** (sheet) | yok | sınav tarihi düzenlemeyi açar |
| **Ders Programı** | yok | Ayarlar'da satırı yazılmadı |
| **8 Story kartı** | — | organik büyüme, Paylaşım Kartı ile |

---

## Bu oturumda yapılanlar

**Yeni ekranlar (8):** Deneme Kayıtları · Konu Borcu · Plan vs Gerçek · Arama +
Sonuç Yok · Gün Detayı · Belge

**Yeniden yazılanlar (12):** Deneme Karşılaştırma · Program Hub · Takvim ·
Durak Ekle · Profil · Konu İlerlemesi · Öncelikli Konular · Ders Konuları ·
Konu Detayı · Ayarlar · Gizlilik · Görünüm · Profil Düzenle · Hedef Düzenle ·
Şifre/E-posta Değiştir

**Altyapı:** `subjectPalette.js` (ders anahtarı → yeni palet köprüsü) ·
`legalDocs.js` (yasal metin tek kaynak) · `planVsActual.js` · `searchIndex.js` ·
palette'e `scrim`/`scrimSoft` · `StatBlock` `page`/`count` boyutları ·
`TYPOGRAPHY.statPair`/`tableValue`/`tableHead`/`metaSemiBold` ·
`changePasswordSchema` · `editProfileSchema`

**Denetim raporu (tasarım tarafı) kapandı:** hedef net kalıcılığı (P1) ·
11px tabanı (P2) · satır içi `rgba` (P2) · çift ders paleti (P3) ·
AGENTS.md state dokümanı (P2)

**Migration'lar:** ikisi de canlıya uygulandı ve doğrulandı
(`user_tasks.task_time`+`series_id`, `product_features` iki paywall anahtarı).
`pending/` boş.

---

## Sende duran kararlar

1. **KVKK aydınlatma metni — yayın engeli.** Tasarım satırı gösteriyor, içerik
   yok. Yasal metin uyduramam. `src/constants/legalDocs.js`'e eklediğin an satır
   kendiliğinden görünür.
2. **Bildirim gelen kutusu.** Tasarımın "Bildirimler"i ayar değil gelen kutusu.
   Arkasında hiçbir şey yok: tablo, RLS, üreticiler (rota değişti / tekrar
   zamanı / hafta kapandı), okundu durumu. UI aktarımı değil, yeni sistem →
   Codex. `EMPTY_COPY.notifications` hazır bekliyor.
3. **Bölüm seçici yok.** `target_department` yazılabilir ama onu değiştiren
   arayüz hiçbir yerde yok (grep'le doğrulandı). `useThresholdView` ve band notu
   ona bağlı. Seçici yazılsın mı, yoksa kurulumda mı sorulsun?

---

## Bilinen borç

- **`curriculum.js` ölü palet taşıyor** — her dersin yanında eski hex
  (`#60a5fa`, `#fb923c`). `getSubjectColor` ölü renk döndürüyor, ~18 çağrı yeri.
  Köprü kuruldu (`subjectPalette.js`), süpürme açık.
- **`GlassCard` 3 dosyada kaldı** — hepsi `src/screens/analytics/`
  (`ComparativeScreen`, `PersonalBests`, `SubjectProgress`). Tasarımda bu ekranın
  karşılığı yok, o yüzden sıraya alınmadı.
- **150 satır üstü:** `HomeScreen` 307 · `TodayPlanCard` 330 ·
  `AddWrongScreen` 414 · `AddStudyScreen` 344 · `TrialInsightsScreen` 316.
  Sosyal olanlar (`FriendsScreen` 415, `ReferralScreen` 399) v1 dışı.
- **OCR** — arkasında çalışan özellik yok.
- **`updateRanking` ölü** — sıralama seçici kaldırıldı, çağrı yeri kalmadı.
  ExamContext'te duruyor (Codex alanı).
- **Topluluk kodu wrong-notebook'ta** — App Store 1.2 kullanıcı içeriği varsa
  bildirme/engelleme istiyor. Yayın öncesi karar.
- **Hiçbir şey cihazda çalıştırılmadı** — Expo'yu sen açana kadar beklemede.

---

## Uydurma veri yerine çıkarılanlar

Tasarımda görünüp arkasında hesap olmayan alanlar. Sayı uydurmak yerine
gösterilmedi:

| Alan | Neden |
|------|-------|
| Program Hub "12/18 durak" | geçmiş günlerin planlanan durak sayısı saklanmıyor |
| Takvim "Planlanan" süre | rastgele bir günün planlanan süresi yok |
| Durak Ekle "N konu kaldı" | ders başı kalan konu sayısı kaynağı yok |
| Durak Ekle Saat + haftalık tekrar | **artık kolonlar var**, yazılabilir |
| Öncelikli Konular "Uzun süredir yok" | doğruluk kademesini tazelik gibi gösteriyordu |
| Konu Borcu "%18 azaldı" / "Sayfayı temizle" | hesap yok / bayrak-RPC yok |
| Ders Konuları ünite başlıkları | curriculum'da ünite kavramı yok |
| Konu Detayı "Geçilen durak" | konu başı durak sayısı kaynağı yok |
| Profil Düzenle SINIF + KULLANICI ADI | `grade`/`username` kolonu yok |
| Hedef Düzenle "5 duraktan 6 durağa" | böyle bir simülasyon yok |
| Gizlilik "Kullanım verisi paylaşımı" | analytics opt-out tercihi yok |
| Görünüm "Gece 23.00'ten sonra koyu" | zamanlayıcı/tercih yok |

Düzeltilen yanlış eşlemeler: `TrialInsightsScreen` ≠ Deneme Kayıtları ·
`ComparativeScreen` ≠ Plan vs Gerçek. İkisi de ayrı gerçek ekranlar; tasarımın
karşılıkları yeni dosya olarak yazıldı.

**Ajan çıktılarında yakalanan sessiz işlev kayıpları:** Hedef Düzenle'de günlük
soru hedefi düzenlemesi (Ayarlar satırı çıkmaz sokak oluyordu) · Ayarlar'da 8
ekranın tek giriş noktasının silinmesi · senkron notunun `goBack`'ten önce set
edilip hiç görünmemesi (iki ayrı ekranda) · `TrialPickerModal` zemininin
şeffaf kalması.
