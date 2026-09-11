# Tasarım aktarımı — durum notu

**Tarih:** 2026-09-11 · **Dal:** `main` (push edilmiş) · **Toplam:** 46 CLD commit, bu oturumda 12
**Kapılar:** 150/150 test geçiyor · `npm run check` üç kapı temiz · sapma her eksende düştü

---

## Nerede duruyoruz

170 artboard → 95 navigasyon hedefi. Sosyal/topluluk (10 ekran) kapsam dışı.

| Faz | Konu | Durum |
|-----|------|-------|
| 1–1.5 | Envanter, akış denetimi, tasarım sistemi | ✅ bitti |
| 2 | Sekme iskeleti, Ana Sayfa, rota grafiği | ✅ bitti |
| 3 | Veri girişi (Deneme Gir, Hızlı Ekle) | ✅ bitti (OCR hariç) |
| 4 | Rota derinliği | ✅ bitti |
| 5 | Analiz ve yanlış defteri | ✅ bitti |
| 6 | Plan ve duraklar | ⚠️ 8/10 — Konu Detayı + Ders Konuları kaldı |
| 7 | Profil ve ayarlar | ⚠️ 1/15 — Profil kökü bitti |
| 8 | Premium ve ödeme | ⬜ başlanmadı |
| 9 | Zamana bağlı durumlar, kutlamalar | ⬜ başlanmadı |
| 10 | Boş/hata bileşenleri | ⬜ başlanmadı |

---

## Bu oturumda yapılanlar

**Yeni ekranlar**
- **Deneme Kayıtları** — filtreli, aya gruplu liste; 8 haftalık ücretsiz pencere + `trial_compare` paywall
- **Konu Borcu** — geçilmeyen durakların saat karşılığı; "dağıt" atlanan durakları `RESCHEDULED`'a taşıyor (sunucuda kalıcı)
- **Plan vs Gerçek** — plan/gerçek durak hattı, "PLANDA n / GERÇEKTE n", boşluk kapanma süresi
- **Arama** + **Arama Sonuç Yok** — konu ve yanlış defterinde yerel arama, son aramalar, düzeltme önerisi
- **Gün Detayı** — takvimde güne dokununca açılan alt sayfa

**Yeniden yazılanlar**
- **Deneme Karşılaştırma** — GlassCard'dan çıktı, ikili net başlığı + ders tablosu
- **Program Hub** (PROGRAM kökü) — 94 satır
- **Takvim** — ay ızgarası `React.memo`, ölü mor HEATMAP gitti
- **Durak Ekle** — 233 → 142 satır, Zod doğrulaması bağlandı
- **Profil kökü** — 137 satır, 6 ölü bileşen silindi
- **Konu İlerlemesi**, **Öncelikli Konular**

**Altyapı**
- `src/themes/subjectPalette.js` — ders anahtarı → yeni palet köprüsü (4 test)
- `src/domain/route/planVsActual.js` (6 test), `src/lib/searchIndex.js` (7 test)
- `TYPOGRAPHY.statPair/tableValue/tableHead/metaSemiBold`, `StatBlock size="page"`

---

## Sırada ne var

**1. FAZ 6'nın kalanı** (ajanlar oturum limitine takıldı, limit 17:10'da açılıyor)
- **Konu Detayı** (`TopicStudyScreen.js`) — ~277. satırda `C.purple`, ~302'de `C.blue` ölü takma adları var
- **Ders Konuları** (`SubjectDetailScreen.js`, 321 satır) — ünite gruplaması müfredatta YOK, düz liste olacak

**2. FAZ 7 — Ayarlar ve belgeler (14 hedef)**
Ayarlar · Profil Düzenle · Bildirimler · Görünüm · Gizlilik · Belge · Hedef Düzenle · Paylaşım Kartı · Seviye · Kilometre Taşı · Neye Göre Öneriyoruz · Veri İndir · Hesap Silme · Şifre/E-posta değiştir.
KVKK belgeleri, hesap silme ve veri indirme **yayın için zorunlu**.

**3. FAZ 8 — Premium** · **FAZ 9 — Zamana bağlı** · **FAZ 10 — Boş/hata**

**4. Animasyonlar** — `animate-expo` + `emil-design-eng`, tasarım oturduktan sonra tek geçişte (anlaşıldığı gibi)

---

## Migration'lar: ikisi de uygulandı ✅

Chrome bağlantısı geldiği an tarayıcıdan Supabase SQL editörüne bağlanıp
ikisini de uyguladım (2026-09-11, proje `zrycqfehhyjrsujmajpf`).

### A) `user_tasks` — `task_time` + `series_id`
`supabase/migrations/20260911120000_user_tasks_time_and_repeat.sql`
"Success. No rows returned." REST ile bağımsız doğrulandı: sorgu 42703
(kolon yok) yerine 42501 (anon yetkisi yok) dönüyor — kolonlar var, RLS hâlâ kapalı.

### B) `product_features` — iki paywall anahtarı
`supabase/migrations/20260911130000_product_features_extend.sql`
Üzerine yazmadan önce canlı fonksiyonun yerel dosyayla birebir aynı olduğu
doğrulandı (uzunluk 1795, `monthlyReport` var, `topicProgress` yok,
`first_week OR pro` 9 kez). Sonrasında: dört kontrol de `true`,
`first_week OR pro` 9 → 11 (tam olarak eklenen iki özellik).

`src/constants/premium.js` artık gerçek anahtarları kullanıyor —
`topic_progress` ve `department_threshold` `routePriorities`'e eşlenmiş
değil. Bekleyen migration kalmadı.

**Kalan tek iş:** Durak Ekle'nin Saat + "Her hafta tekrarla" satırlarını
yazmak. Kolonlar artık hazır.

---

## Bilinen borç

- **`curriculum.js` ölü palet taşıyor** — her dersin yanında eski hex (`#60a5fa`, `#fb923c`). `getSubjectColor` ölü renk döndürüyor, ~18 çağrı yeri. Köprü kuruldu, süpürme açık.
- **`HomeScreen.js` 307 satır** (limit 150)
- **Yanlış defteri token borcu** — satır içi hex+alpha, `SHADOWS.orange`
- **OCR** (Fotoğraftan Oku / Okuma Onayı) — arkasında çalışan bir özellik yok
- **Topluluk kodu wrong-notebook'ta hâlâ duruyor** — App Store 1.2 kullanıcı içeriği varsa bildirme/engelleme istiyor. Yayın öncesi karar.
- **Hiçbir şey cihazda çalıştırılmadı** — Expo'yu sen açana kadar beklemede.

---

## Uydurma veri yerine çıkarılanlar

Tasarımda görünen ama arkasında veri olmayan alanlar — sayı uydurmak yerine gösterilmedi:

| Alan | Neden |
|------|-------|
| Program Hub "12/18 durak" | geçmiş günlerin planlanan durak sayısı saklanmıyor |
| Takvim "Planlanan" süre | rastgele bir günün planlanan süresi yok |
| Durak Ekle "N konu kaldı" | ders başı kalan konu sayısı kaynağı yok |
| Öncelikli Konular "Uzun süredir yok" | **doğruluk** kademesini **tazelik** iddiası gibi gösteriyordu |
| Konu Borcu "%18 azaldı" | bunu üretecek hesap yok |
| Konu Borcu "Sayfayı temizle" | ne bayrak ne RPC var |

Ayrıca düzeltilen iki yanlış eşleme: `TrialInsightsScreen` ≠ Deneme Kayıtları, `ComparativeScreen` ≠ Plan vs Gerçek. İkisi de ayrı gerçek ekranlar; tasarımın karşılıkları yeni dosya olarak yazıldı.
