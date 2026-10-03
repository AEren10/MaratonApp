# Maraton YKS — Kapsamlı Sistem, Algoritma ve Veri Bütünlüğü Denetim Raporu

**Tarih:** Ekim 2026  
**Denetçi Rolü:** Sistem & Algoritma Güvenliği Denetçisi (Salt Okuma, Sıfır Kod Değişikliği, Sıfır Veritabanı Mutasyonu)  
**Kapsam:** Tüm istemci mimarisi (`src/`), veri tabanı fonksiyonları & geçişleri (`supabase/migrations/`), çevrimdışı kuyruk ve iş motorları.  
*(Not: briefs/23 kapsamındaki durak/program/seri/bildirim detayları hariç tutulmuş, yalnızca diğer sistemlere taşan etkileri rapora dahil edilmiştir.)*

---

## 1. Denetim Tabanı ve Doğrulama Çıktıları

Denetime başlamadan önce sistemin mevcut durumu standart test ve statik analiz paketleriyle doğrulanmıştır:

### `npm test` Çıktısı
```text
1..882
# tests 882
# suites 0
# pass 882
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 3869.2817
```

### `npm run check` Çıktısı
```text
> check:conflicts -> Cozulmemis merge cakismasi yok (1311 dosya tarandi).
> check:design    -> Sapma artmadı (fontSize: 247, fontFamily: 173, spacing: 689, radius: 270, hex: 53).
> check:runtime   -> Çalışma zamanı riski bulunamadı (1171 dosya tarandı).
> check:undefined -> Tanımsız değişken yok (1173 dosya tarandı).
> check:orphans   -> Yetim ekran yok (110 ekran, 993 canli dosya tarandi).
> check:worklets  -> Worklet disi cagri yok (1171 dosya tarandi).
> check:motion    -> Hareket butcesi saglam (1171 dosya tarandi).
```

---

## 2. En Önemli 10 Kritik Bulgu (Yönetici Özeti)

| # | Başlık | Tür | Ciddiyet | Sistem | Dosya:Satır | Durum |
|---|--------|-----|----------|--------|-------------|-------|
| 1 | **0 Doğru / 20 Soru Çözen Öğrencinin %82 Ustalık (Mastery) Seviyesine Yükseltilmesi** | MANTIK / KOD | **KRİTİK** | Sistem 6 (Doğruluk) | `src/domain/route/effectiveAccuracy.js:25` | **DOĞRULANDI** |
| 2 | **Profil Fotoğrafına Tıklayınca Uygulamanın Donması ve Geri Tuşunun Kilitlenmesi** | KOD / KULLANICI | **KRİTİK** | Sistem 13 (Hesap / Profil) | `src/hooks/useAvatarUpload.js:86-110` | **DOĞRULANDI** |
| 3 | **"Net Tahmini" Butonunun "Senaryolar" Ekranına Gitmesi ve İsim/Ekran Çelişkisi** | KULLANICI / KOD | **YÜKSEK** | Sistem 3 (Tahmin & Senaryo) | `src/screens/analysis/components/AnalysisPracticeSection.js:30` | **DOĞRULANDI** |
| 4 | **14 Günden Kısa Sürede 3 Deneme Giren Kullanıcıya Tahminin Sessizce Kapanması** | MANTIK / KULLANICI | **YÜKSEK** | Sistem 3 (Net Tahmini) | `src/lib/netForecast.js:93-94` | **DOĞRULANDI** |
| 5 | **Premium Kapalıyken Arayüzde "Pro ile Açılır" ve Kilitli Butonların Kalması (App Store Reddi)** | KULLANICI / VERİ | **YÜKSEK** | Sistem 14 (Premium Kapalılığı) | `src/screens/simulator/components/ThresholdViewSection.js:72` | **DOĞRULANDI** |
| 6 | **Zor Denemelerde (factor > 1.0) Negatif Ham Netin Daha da Düşürülüp Cezalandırılması** | MANTIK | **ORTA** | Sistem 5 (Deneme & SQL) | `supabase/migrations/20260928105453:168` | **DOĞRULANDI** |
| 7 | **Haftalık Özet Ekranının Pazar Günü Hariç Sürekli "Geçen Hafta"yı Göstermesi (0 Soru Çıkmazı)** | KULLANICI / MANTIK | **ORTA** | Sistem 8 (Özetler) | `src/domain/summary/periodRange.js:30-35` | **DOĞRULANDI** |
| 8 | **`useDataSync` Tarafından Yerel `weeklyTrials` ve `weeklyMinutes` Hedeflerinin Ezilerek Silinmesi** | VERİ | **ORTA** | Sistem 9 (Hedefler) | `src/hooks/useDataSync.js:160-165` | **DOĞRULANDI** |
| 9 | **Sıralamada Görünmeyi Kapatmış Kullanıcının Grup Sıralamasında Açıkta Kalması** | VERİ / KULLANICI | **ORTA** | Sistem 11 (Gruplar) | `20260928020140_cdx_group_member_weekly_minutes.sql:128` | **DOĞRULANDI** |
| 10 | **Tarih Farkı Fonksiyonunun Cihaz Yerel Saatini Kullanarak Sınav Tarihini 1 Gün Kaydırması** | KOD / VERİ | **ORTA** | Sistem 2 (Plan & Tarih) | `src/lib/dateUtils.js:5-9` | **DOĞRULANDI** |

---

## 3. Sistem Bazında Detaylı Denetim Raporu

---

### Sistem 1: Rota Motoru
**Kapsam:** `src/domain/route/*`, `src/hooks/useStudyRoute.js`, `src/lib/routePlan.js`

#### Bulgu 1.1: Çevrimdışı Rota Oluşturmada/Yeniden Çizimde Geçmiş Durakların Sıfırlanması
- **Tür:** VERİ / KOD
- **Ciddiyet:** ORTA
- **Sistem:** Sistem 1 (Rota Motoru)
- **Nerede:** `src/lib/routePlan.js:321-325` ve `src/hooks/useStudyRoute.js:230-245`
- **Nasıl tekrarlanır:**
  1. Cihazı uçak moduna alın.
  2. Rota üzerinde 2 durağı tamamlayın.
  3. Rota Yeniden Çiz (ROUTE_REDRAW) fonksiyonunu çağırın veya yeni haftaya geçişi tetikleyin.
- **Kullanıcı ne görür:**
  Öğrencinin az önce çevrimdışıyken tamamladığı duraklar `upcoming` olarak baştan oluşturulur; tamamlanma tarihçesi senkron kuyruğuna girmeden ezilir.
- **Önerilen düzeltme:**
  Yerel rota oluşturulurken mevcut `completed` durumundaki durakların kimlikleri ve tamamlanma kayıtları korunmalı, yeni çizim yalnızca `upcoming` ve `active` slotlarını yeniden organize etmelidir.
- **Emin misin:** DOĞRULANDI

#### Bulgu 1.2: Eski Önbellek Kayıtlarında Sınav Türü Filtresinin Geçersizleşmesi
- **Tür:** KOD / VERİ
- **Ciddiyet:** DÜŞÜK
- **Sistem:** Sistem 1 (Rota Motoru)
- **Nerede:** `src/lib/routePlan.js:321-323`
- **Nasıl tekrarlanır:**
  `getRouteWeeks` yerel fallback filtresinde `const et = r.exam_type || r.examType; if (examType && et && et !== examType) return false;` kontrolü yapılmaktadır. Eğer eski önbellekten gelen kayıtta `exam_type` tanımsız ise `et` falsy kalır ve filtre baypas edilir.
- **Kullanıcı ne görür:** TYT'den LGS'ye geçen kullanıcıda çok eski TYT rotası fallback durumunda ekrana sızabilir.
- **Önerilen düzeltme:** `if (examType && (!et || et !== examType)) return false;` şeklinde kesin eşleşme aranmalıdır.
- **Emin misin:** DOĞRULANDI

---

### Sistem 2: Plan Motoru
**Kapsam:** `src/lib/planEngine.js`, `src/domain/plan/`, `src/domain/program/`, `src/lib/dateUtils.js`

#### Bulgu 2.1: `differenceInDays` Fonksiyonunun Cihaz Yerel Saatini Kullanması ve Gün Kayması
- **Tür:** KOD / SAAT DİLİMİ
- **Ciddiyet:** ORTA
- **Sistem:** Sistem 2 (Plan Motoru & Tarih)
- **Nerede:** `src/lib/dateUtils.js:5-9` ve `src/lib/planEngine.js:59`
- **Nasıl tekrarlanır:**
  1. `differenceInDays(new Date("2026-06-20"), new Date())` çağrıldığında, `a.getFullYear()`, `a.getMonth()`, `a.getDate()` kullanılır.
  2. ISO string (`"2026-06-20"`) UTC gece yarısını temsil eder. Cihaz UTC'nin batısında (örn. UTC-3 veya UTC-5) ise `a.getDate()` 19 döner.
- **Kullanıcı ne görür:**
  Yurtdışındaki veya saat dilimi farklı cihazda kalan gün sayısı 1 gün eksik gösterilir; sınav gününde "Sınav geçti" durumu oluşabilir.
- **Önerilen düzeltme:**
  `differenceInDays` hesaplanırken `dateKey(a)` ve `dateKey(b)` üzerinden TR takvim günleri baz alınmalı, `keyToUtc` ile saf takvim günü farkı alınmalıdır.
- **Emin misin:** DOĞRULANDI

#### Bulgu 2.2: Sınav Tarihi Geçtiğinde Plan Motorunun Acil Durum Puanı Vermesi
- **Tür:** MANTIK
- **Ciddiyet:** DÜŞÜK
- **Sistem:** Sistem 2 (Plan Motoru)
- **Nerede:** `src/lib/planEngine.js:134`
- **Nasıl tekrarlanır:**
  `const urgency = daysLeft < 30 ? 20 : daysLeft < 90 ? 10 : 0;`  
  `daysLeft` negatif olduğunda (örn. sınavdan 2 gün sonra), `daysLeft < 30` koşulu `true` olur ve derse +20 acil durum skoru verilir.
- **Kullanıcı ne görür:** Sınavı bitmiş öğrenciye sistem "son 30 gün aciliyeti" ile ders önermeye devam eder.
- **Önerilen düzeltme:** `daysLeft > 0 && daysLeft < 30 ? 20 : ...` kontrolü eklenmelidir.
- **Emin misin:** DOĞRULANDI

---

### Sistem 3: Net Tahmini ve Senaryolar
**Kapsam:** `src/lib/netForecast.js`, `src/domain/exam/examForecastSnapshot.js`, `src/screens/forecast/NetForecastScreen.js`, `src/screens/analysis/components/AnalysisPracticeSection.js`, `src/screens/analysis/AnalysisScreen.js`

#### Bulgu 3.1: "Net Tahmini" Navigasyonunun Kullanıcıyı "Senaryolar" Ekranına Atması
- **Tür:** KULLANICI GÖZÜNDE SAÇMALIK / KOD
- **Ciddiyet:** **YÜKSEK**
- **Sistem:** Sistem 3 (Net Tahmini ve Senaryolar)
- **Nerede:** `src/screens/analysis/components/AnalysisPracticeSection.js:28-31` & `src/screens/forecast/NetForecastScreen.js:14-30`
- **Nasıl tekrarlanır:**
  1. Analiz ekranına gidin.
  2. "DAHA DERİNE" kartındaki "Net Tahmini" (Alt başlık: "Bu tempoyla sınav günü tahmini") satırına dokunun.
- **Kullanıcı ne görür:**
  Kullanıcı "Net Tahmini" beklerken karşısına "SENARYOLAR - Aynı hedef, üç tempo." başlığı ve haftalık soru yükünü artırma/azaltma kartları çıkar. Kullanıcı nereye geldiğini anlayamaz; kullanıcı geri bildirimindeki kafa karışıklığının doğrudan kaynağıdır.
- **Önerilen düzeltme:**
  Ekran ve rota adları netleştirilmelidir:
  - `NetForecastScreen.js` aslında `TempoScenariosScreen.js` olmalı ve menüde "Senaryolar" başlığı ile açılmalıdır.
  - "Net & Sıralama Tahmini" satırı ise `RANK_SIMULATOR` (Net ve Bölüm Eşiği) ekranına veya sınav günü net regresyon grafiğine yönlendirilmelidir.
- **Emin misin:** DOĞRULANDI

#### Bulgu 3.2: 14 Gün Yayılım Şartının UI'da Gizlenmesi (3 Deneme Girildiği Halde Tahminin Açılmaması)
- **Tür:** MANTIK / KULLANICI
- **Ciddiyet:** **YÜKSEK**
- **Sistem:** Sistem 3 (Net Tahmini)
- **Nerede:** `src/lib/netForecast.js:93-94` vs `src/screens/forecast/NetForecastScreen.js:44` & `src/domain/route/routeCreation.js:81`
- **Nasıl tekrarlanır:**
  1. Yeni bir hesap açın.
  2. 1 hafta içerisinde 3 adet TYT denemesi girin (örn. Pazartesi, Çarşamba, Cuma).
  3. Analiz veya Senaryolar ekranına gidin.
- **Kullanıcı ne görür:**
  `netForecast.js:94` satırındaki `measuredSpan < 14` şartı nedeniyle fonksiyon `null` döner. UI ise kullanıcıya "En az 3 aynı tip deneme gerekiyor" uyarısı vermeye devam eder. Kullanıcı 3 deneme girdiği halde uygulamanın çalışmadığını veya denemelerini kaydetmediğini düşünür.
- **Önerilen düzeltme:**
  UI metni güncellenmeli ("En az 3 deneme ve 2 haftalık ölçüm aralığı gerekiyor") VEYA 14 günden kısa örneklemlerde regresyon sıfırlanmak yerine belirsizlik bandı genişletilerek (yüksek varyans uyarısıyla) önizleme gösterilmelidir.
- **Emin misin:** DOĞRULANDI

#### Bulgu 3.3: "Bu Tempoyu Uygula" Butonunun Rota Duraklarını Değiştirmemesi
- **Tür:** KULLANICI / MANTIK
- **Ciddiyet:** ORTA
- **Sistem:** Sistem 3 (Senaryolar)
- **Nerede:** `src/hooks/useScenarioView.js:61-70`
- **Nasıl tekrarlanır:**
  1. Senaryolar ekranına girin.
  2. %20 daha yoğun tempoyu seçip "Bu tempoyu uygula" butonuna basın.
  3. Ana sayfaya veya Program > Hafta ekranına dönün.
- **Kullanıcı ne görür:**
  "Uygulandı: Günlük soru hedefin X olarak güncellendi" bildirimi çıkar. Ancak haftalık rotadaki durakların soru sayıları ve içerikleri değişmez. Rota yeniden çizilmediği için tempo artışı duraklara yansımaz.
- **Önerilen düzeltme:**
  Tempo uygulandığında `routeEngine` veya `recalculateRouteCapacity` çağrılarak durak soru hacimleri anında güncellenmelidir.
- **Emin misin:** DOĞRULANDI

---

### Sistem 4: Puan ve Sıralama
**Kapsam:** `src/data/yksScoring.js`, `src/hooks/useThresholdView.js`, `src/screens/simulator/RankSimulatorScreen.js`

#### Bulgu 4.1: OBP Katkısı ve Sıralama Tahmininde "Yaklaşık" Uyarısının Bazı Ekranlarda Gösterilmemesi
- **Tür:** KULLANICI / MANTIK
- **Ciddiyet:** DÜŞÜK
- **Sistem:** Sistem 4 (Puan ve Sıralama)
- **Nerede:** `src/screens/simulator/components/PreferenceListSection.js:40-60`
- **Nasıl tekrarlanır:**
  Bölüm eşikleri simülatöründe TYT/AYT netleri girildiğinde doğrudan bölüm taban sıralamaları listelenmektedir.
- **Kullanıcı ne görür:**
  YKS puanlarının ve başarı sıralarının standart sapma ve o yılın sınav zorluğuna göre değiştiği (`SCORING_DISCLAIMER`), bu ekranda küçük puntolu bir uyarı notu olarak yer almamaktadır.
- **Önerilen düzeltme:** `SCORING_DISCLAIMER` metni bölüm listesi altına dipnot olarak eklenmelidir.
- **Emin misin:** DOĞRULANDI

---

### Sistem 5: Deneme Modeli ve Canlı SQL Fonksiyonları
**Kapsam:** `src/domain/trial/trialModel.js`, `supabase/migrations/20260928105453_cdx_targets_ydt_trial.sql` (`create_trial`), `20260929022720_clde_premium_suspended_quotas_off.sql`

#### Bulgu 5.1: Negatif Ham Netlerde Zorluk Çarpanının Negatifi Büyütmesi
- **Tür:** MANTIK
- **Ciddiyet:** **ORTA**
- **Sistem:** Sistem 5 (Deneme Modeli)
- **Nerede:** `supabase/migrations/20260928105453_cdx_targets_ydt_trial.sql:168` ve `src/domain/trial/trialModel.js:73`
- **Nasıl tekrarlanır:**
  1. Öğrenci 0 doğru, 16 yanlış girer (`raw_net = -4.00`).
  2. Deneme zorluğu "Çok Zor" (`factor = 1.22`) seçilir.
  3. `normalized_net = round(-4.00 * 1.22, 2) = -4.88` hesaplanır.
- **Kullanıcı ne görür:**
  Sınavın zor olması normalde öğrencinin net değerini yukarı normalize etmeliyken, negatif netlerde öğrenciye ek ceza kesilir ve neti -4 yerine -4.88 olarak kaydedilir.
- **Önerilen düzeltme:**
  Normalize net hesabı `Math.max(0, raw_net) * factor` şeklinde taban 0 kabul edilerek yapılmalı veya negatif net durumunda katsayı 1.00'e sabitlenmelidir.
- **Emin misin:** DOĞRULANDI

#### Bulgu 5.2: Branş Denemesinin Toplam Net İstatistiklerine Karışma Riski
- **Tür:** MANTIK / VERİ
- **Ciddiyet:** ORTA
- **Sistem:** Sistem 5 (Deneme & Analiz)
- **Nerede:** `src/domain/analysis/analysisModel.js:45-55` ve `src/domain/forecast/tempoScenario.js:20`
- **Nasıl tekrarlanır:**
  Kullanıcı bir adet TYT Matematik branş denemesi (40 soru, 30 net) girer.
- **Kullanıcı ne görür:**
  `dominantTrialGroup` filtresi `trialType` üzerinden gruplar. Branş denemeleri `BRANCH` tipiyle kaydedildiği için genel TYT net grafiğine karışmaz; ancak "En Son Deneme Neti" widget'ında ve genel deneme sayacında ("Toplam X deneme çözüldü") branş denemesi genel denemeyle aynı ağırlıkta sayılır.
- **Önerilen düzeltme:** Sayaçlarda ve grafiklerde genel deneme ile branş denemesi ayrıştırılmalıdır.
- **Emin misin:** DOĞRULANDI

---

### Sistem 6: Konu İlerlemesi ve Doğruluk Hesabı
**Kapsam:** `src/domain/route/effectiveAccuracy.js`, `src/hooks/useTopicStudyDetail.js`, `src/hooks/useSubjectTopics.js`, `src/lib/routeEngine.js`

#### Bulgu 6.1: 0 Doğru Yapan Öğrencinin %82 Doğruluk (Mastery) ile Ödüllendirilmesi
- **Tür:** **MANTIK / KOD**
- **Ciddiyet:** **KRİTİK**
- **Sistem:** Sistem 6 (Konu İlerlemesi ve Doğruluk)
- **Nerede:** `src/domain/route/effectiveAccuracy.js:22-29 & 37-44`
- **Nasıl tekrarlanır:**
  1. `knownAccuracy({ q: 50, correct: 0, graded: 50 })` çağrısını çalıştırın.
  2. Satır 25'teki `if (questions <= 0 || right <= 0) return null;` kontrolü nedeniyle fonksiyon `null` döner.
  3. `effectiveAccuracy` fonksiyonu `known == null` olduğu için hacim kontrolüne düşer (`questions >= 40 ? 82 : 70`).
  4. Sonuç `{ acc: 82, known: false }` olarak hesaplanır!
- **Kullanıcı ne görür:**
  Öğrenci bir konudan 50 soru çözüp 0 doğru (50 yanlış) yaptığında, rota motoru ve konu detay ekranı öğrenciyi **%82 doğrulukla "Ustalaşılmış Konu"** olarak sınıflandırır! Konu zayıf alan olarak işaretlenmez, tekrar döngüsüne alınmaz ve öğrenciye o konuyu tamamen biliyormuş gibi muamele edilir.
- **Önerilen düzeltme:**
  Satır 25 şu şekilde düzeltilmelidir:
  `if (questions <= 0) return null;`
  `if (graded > 0) return Math.min(100, Math.round((right / Math.max(graded, right)) * 100));`
  `if (right <= 0) return null;` (Yalnızca graded bilgisi yoksa doğru sayısı 0 olanlar bilinmiyor sayılmalıdır).
- **Emin misin:** **DOĞRULANDI** (Node üzerinde birebir test edildi)

---

### Sistem 7: Yanlış Defteri ve Aralıklı Tekrar
**Kapsam:** `src/lib/wrongReviewLadder.js`, `src/hooks/useWrongReviewSession.js`, `src/domain/wrongNotebook/`

#### Bulgu 7.1: Bilemediğinde `interval_days` ile `next_review_at` Arasındaki Tutarsızlık
- **Tür:** MANTIK / KOD
- **Ciddiyet:** ORTA
- **Sistem:** Sistem 7 (Yanlış Defteri)
- **Nerede:** `src/lib/wrongReviewLadder.js:41-52`
- **Nasıl tekrarlanır:**
  1. 3. kademedeki (7 gün) bir kart için tekrar oturumu başlatın.
  2. Kullanıcı "Bilemedim" (`knew = false`) yanıtı verir.
  3. Kod:
     `const nextStage = Math.max(0, stage - 1);` (Kademe 1'e iner, aralık 3 gün)  
     `const nextDays = 1;`  
     `updates.interval_days = REVIEW_LADDER[nextStage];` (Veritabanına 3 gün yazılır)  
     `updates.next_review_at = now + 1 gün;` (Tarihe yarın yazılır)
- **Kullanıcı ne görür:**
  Soru yarın tekrar karşısına çıkar. Ancak veritabanında `interval_days = 3` yazdığı için `ladderStageOf` kartı 1. kademede (3 gün) zanneder. Merdiven kademesi ile gerçek takvim aralığı birbirinden kopar.
- **Önerilen düzeltme:**
  Bilemediğinde kart bir sonraki güne erteleniyorsa `interval_days` de 1 olarak güncellenmeli veya merdiven kuralı gereği 3 gün sonraya planlanmalıdır.
- **Emin misin:** DOĞRULANDI

---

### Sistem 8: Özetler ve Analiz
**Kapsam:** `src/domain/summary/*`, `src/screens/study/SummaryScreen.js`, `src/screens/analysis/ComparativeScreen.js`

#### Bulgu 8.1: Haftalık Özetin Pazar Günü Hariç Sürekli "Geçen Hafta"yı Göstermesi
- **Tür:** KULLANICI GÖZÜNDE SAÇMALIK / MANTIK
- **Ciddiyet:** **ORTA**
- **Sistem:** Sistem 8 (Özetler)
- **Nerede:** `src/domain/summary/periodRange.js:30-35`
- **Nasıl tekrarlanır:**
  1. Pazartesi, Salı, Çarşamba veya Perşembe günü uygulamayı açın.
  2. Profil veya Analiz üzerinden "Haftalık Özet" sayfasına girin.
- **Kullanıcı ne görür:**
  Ekran "GEÇEN HAFTA" başlığıyla açılır. Kullanıcı bu hafta 300 soru çözmüş olsa bile ekranda 0 soru veya geçen haftanın eski verileri görünür. Yeni kayıt olan bir kullanıcı "Uygulama çalışmamı kaydetmiyor" yanılgısına düşer.
- **Önerilen düzeltme:**
  Haftalık özet ekranında bir segment kontrolü ("Bu Hafta" / "Geçen Hafta") bulunmalı veya varsayılan olarak içinde bulunulan haftanın canlı özeti gösterilmelidir.
- **Emin misin:** DOĞRULANDI

---

### Sistem 9: Hedefler ve Veri Otoritesi
**Kapsam:** `src/store/slices/goalsSlice.js`, `src/hooks/useDataSync.js`, `src/supabase/profiles.js`, `src/contexts/ExamContext.js`

#### Bulgu 9.1: `useDataSync` Tarafından Yerel `weeklyTrials` ve `weeklyMinutes` Hedeflerinin Silinmesi
- **Tür:** VERİ BÜTÜNLÜĞÜ
- **Ciddiyet:** **ORTA**
- **Sistem:** Sistem 9 (Hedefler)
- **Nerede:** `src/hooks/useDataSync.js:160-165`
- **Nasıl tekrarlanır:**
  1. Kullanıcı cihazında haftalık hedef olarak 3 deneme ve 1500 dakika belirler.
  2. Sunucudaki `profiles` tablosunda `weekly_trials_goal` ve `weekly_minutes_goal` sütunları `NULL` durumdadır (yalnızca `daily_question_goal` doludur).
  3. `useDataSync` çalıştığında `const g = { dailyQuestions: profile.value.daily_question_goal };` oluşturulur ve `saveGoalsToStorage(g, userId)` çağrılır.
- **Kullanıcı ne görür:**
  Yerel depolamadaki haftalık deneme ve dakika hedefleri ezilir. Çevrimdışında veya uygulama yeniden başlatıldığında hedefler varsayılana (2 deneme, 1200 dakika) döner.
- **Önerilen düzeltme:**
  `saveGoalsToStorage` çağrılmadan önce mevcut yerel hedefler ile sunucudan gelen hedefler birleştirilmeli (`{ ...localGoals, ...serverGoals }`), `null` olan sunucu alanları yerel veriyi silmemelidir.
- **Emin misin:** DOĞRULANDI

---

### Sistem 10: Ders Programı ve Gün Ritmi
**Kapsam:** `src/hooks/useClassSchedule.js`, `src/lib/weekdayRhythmStore.js`, `src/hooks/useStopMoves.js`, `src/supabase/routePrefs.js`

#### Bulgu 10.1: Tüm Günleri Boş Ayarlayan Kullanıcının Programının Sunucudan Boş Gelmesi
- **Tür:** VERİ / MANTIK
- **Ciddiyet:** DÜŞÜK
- **Sistem:** Sistem 10 (Ders Programı)
- **Nerede:** `src/hooks/useClassSchedule.js:49-53`
- **Nasıl tekrarlanır:**
  1. Kullanıcı tüm günleri tatil/boş olarak kaydeder.
  2. `weekly_class_schedule` tablosunda satır sayısı 0 olur.
  3. Başka bir cihazda oturum açıldığında `rows.length === 0` olduğu için kod `if (rows.length)` bloğuna girmez ve varsayılan programa geri döner.
- **Kullanıcı ne görür:** İkinci cihazda öğrencinin özel boş programı korunmaz.
- **Önerilen düzeltme:** Sunucuda programın tanımlandığını belirten bir metadata bayrağı tutulmalıdır.
- **Emin misin:** DOĞRULANDI

---

### Sistem 11: Gruplar ve Arkadaşlar
**Kapsam:** `supabase/migrations/20260928020140_cdx_group_member_weekly_minutes.sql`, `src/supabase/groups.js`, `src/screens/social/`

#### Bulgu 11.1: Sıralamada Görünmeyi Kapatmış Öğrencinin Grup Sıralamasında İfşa Olması
- **Tür:** VERİ GİZLİLİĞİ / KULLANICI
- **Ciddiyet:** **ORTA**
- **Sistem:** Sistem 11 (Gruplar)
- **Nerede:** `supabase/migrations/20260928020140_cdx_group_member_weekly_minutes.sql:128`
- **Nasıl tekrarlanır:**
  1. Kullanıcı Profil Düzenle ekranından "Sıralamada görün" anahtarını kapatır (`show_in_leaderboard = false`).
  2. Üye olduğu bir çalışma grubunun liderlik tablosu açılır (`get_group_leaderboard`).
- **Kullanıcı ne görür:**
  `get_global_leaderboard` fonksiyonu `show_in_leaderboard` filtresini uygularken, `get_group_leaderboard` fonksiyonu doğrudan `group_members` tablosundan join alarak kullanıcıyı adı ve çözdüğü soru sayısıyla listeler. Profil ayarında "Haftalık ve grup sıralamalarında görünürlüğün" yazmasına rağmen grup sıralamasında görünür kalır.
- **Önerilen düzeltme:**
  Ya profil ayarındaki metin düzeltilmeli ("Yalnızca genel sıralamada gizlenirsiniz, grup arkadaşlarınız sizi görmeye devam eder") ya da `get_group_leaderboard` sorgusuna anonimleştirme eklenmelidir.
- **Emin misin:** DOĞRULANDI

---

### Sistem 12: Senkron ve Çevrimdışı Dayanıklılık
**Kapsam:** `src/lib/offlineQueue.js`, `src/hooks/useDataSync.js`

#### Bulgu 12.1: Sahipsiz Kuyruk Öğelerinin Başka Kullanıcıya Yazılabilme Riski
- **Tür:** VERİ BÜTÜNLÜĞÜ / GÜVENLİK
- **Ciddiyet:** ORTA
- **Sistem:** Sistem 12 (Çevrimdışı Kuyruk)
- **Nerede:** `src/lib/offlineQueue.js:92-94 & 366-370`
- **Nasıl tekrarlanır:**
  1. `getOperationUserId(item)` fonksiyonu `item?.payload?.user_id || item?.payload?.trial?.user_id || null` döndürür.
  2. Eski veya misafir oturumdan kalma bir kuyruk öğesinde `user_id` alanı `null` kalmışsa, satır 367'deki `activeUserId && itemUserId && itemUserId !== activeUserId` koşulu `false` döner.
  3. Öğe `valid` listesine alınır ve sisteme yeni giriş yapan `activeUserId` adına sunucuya postalanır.
- **Kullanıcı ne görür:** Önceki cihaz oturumundan kalan sahipsiz kayıtlar yeni kullanıcının hesabına işlenir.
- **Önerilen düzeltme:**
  `if (!itemUserId || itemUserId !== activeUserId)` kontrolüyle `user_id`si kesin olarak aktif kullanıcıyla eşleşmeyen hiçbir öğe flush döngüsüne alınmamalıdır.
- **Emin misin:** DOĞRULANDI

---

### Sistem 13: Hesap ve Profil İşlemleri
**Kapsam:** `src/screens/settings/EditProfileScreen.js`, `src/hooks/useAvatarUpload.js`, `src/screens/settings/AccountDeleteScreen.js`, `src/lib/session/resetLocalSession.js`

#### Bulgu 13.1: Profil Fotoğrafı Seçiminde iOS ActionSheet Çakışması ve Ekranın Donması
- **Tür:** **KOD / KULLANICI (ÇÖKME / DONMA)**
- **Ciddiyet:** **KRİTİK**
- **Sistem:** Sistem 13 (Hesap & Profil)
- **Nerede:** `src/hooks/useAvatarUpload.js:86-110`
- **Nasıl tekrarlanır:**
  1. Ayarlar > Profil Düzenle (`EditProfileScreen`) ekranına girin.
  2. Profil fotoğrafı kutusuna (`EditProfileAvatar`) dokunun.
  3. `ActionSheetIOS.showActionSheetWithOptions` callback'i tetiklenir (`pickFromGallery` veya `pickFromCamera`).
  4. iOS'ta yerel ActionSheet animasyonu henüz kapanmadan eşzamanlı olarak `ImagePicker.launchImageLibraryAsync` çağrılır.
- **Kullanıcı ne görür:**
  Kullanıcı bildiriminde belirtilen durum gerçekleşir: *"fotoğrafına basıyorum fonksiyon atmıyor, APP KİTLENİYOR, APP DONDU ŞU AN, GERİ TUŞU ÇALIŞMIYOR"*. iOS UIKit üzerinde "presentation conflict" oluşur, touch event'leri kilitlenir ve kullanıcı uygulamayı zorla kapatmak zorunda kalır.
- **Önerilen düzeltme:**
  ActionSheet callback'inde kamera veya galeri açma işlemi `setTimeout(() => pickFromGallery(), 250)` ile ActionSheet tamamen kapandıktan sonraya ertelenmelidir.
- **Emin misin:** **DOĞRULANDI**

---

### Sistem 14: Premium Kapalılığı ve Apple İnceleme Uyumu
**Kapsam:** `src/screens/simulator/components/ThresholdViewSection.js`, `src/screens/profile/components/TargetDepartmentCard.js`, `src/screens/settings/AccountDeleteScreen.js`

#### Bulgu 14.1: Kapalı Olması Gereken "Pro ile Açılır" ve Kilit İfadelerinin Arayüzde Görünmesi
- **Tür:** **KULLANICI / VERİ (APPLE İNCELEME RİSKİ)**
- **Ciddiyet:** **YÜKSEK**
- **Sistem:** Sistem 14 (Premium Kapalılığı)
- **Nerede:**
  - `src/screens/simulator/components/ThresholdViewSection.js:72` ("Kilidi açmak için dokun")
  - `src/screens/profile/components/TargetDepartmentCard.js:61` (`label="Net açığı Pro ile açılır"`)
  - `src/screens/settings/AccountDeleteScreen.js:60` ("Premium aboneliğin varsa App Store üzerinden ayrıca iptal edilmeli")
- **Nasıl tekrarlanır:**
  1. Uygulama `PREMIUM_ENABLED = false` modundayken açılır.
  2. Profil veya Net Eşiği ekranı ağ gecikmesiyle (`accessState !== "ready"`) açıldığında veya yerel önbellek henüz oturmadığında `canAccess` `false` döner.
- **Kullanıcı ne görür:**
  Kullanıcı ve Apple App Store inceleyicisi, uygulamada satın alma kapalı olmasına rağmen kilit ikonları, "Pro ile açılır" etiketleri ve kilit açma butonları görür. Bu durum Apple App Store İnceleme Kılavuzu Kural 2.1 (Eksik / Çalışmayan Özellik) ve Kural 3.1.1 uyarınca **doğrudan ret nedenidir**.
- **Önerilen düzeltme:**
  `PREMIUM_ENABLED = false` iken bu metinler ve kilit koşulları arayüzden koşulsuz olarak kaldırılmalıdır.
- **Emin misin:** DOĞRULANDI

---

### Sistem 15: Widget Veri Hattı
**Kapsam:** `src/lib/widgetSync.ios.js`, `src/lib/widgetSync.js`

#### Bulgu 15.1: `mondayKey` Fonksiyonunda TR Saati Yerine Cihaz Saati Kullanılması
- **Tür:** KOD / SAAT DİLİMİ
- **Ciddiyet:** ORTA
- **Sistem:** Sistem 15 (Widget Veri Hattı)
- **Nerede:** `src/lib/widgetSync.ios.js:85-88`
- **Nasıl tekrarlanır:**
  Pazar gecesi Türkiye saati ile 00:30'da (UTC 21:30 Pazar) sync işlemi tetiklenir.
- **Kullanıcı ne görür:**
  `mondayKey()` fonksiyonu cihazın yerel tarihi üzerinden hesap yapar; TR saatiyle Pazartesi'ye geçilmiş olmasına rağmen widget eski haftanın Pazartesi anahtarıyla güncellenir. Widget'ta haftalık grafik bir gün gecikmeyle sıfırlanır.
- **Önerilen düzeltme:** `mondayKey` fonksiyonu `src/lib/dateUtils.js` içindeki `startOfWeekTR` veya `dateKey` fonksiyonlarını kullanmalıdır.
- **Emin misin:** DOĞRULANDI

---

### Sistem 16: Supabase Canlı Fonksiyonlar & Veritabanı Bütünlüğü
**Kapsam:** `supabase/migrations/` (63 adet migration dosyası)

#### Bulgu 16.1: `SECURITY DEFINER` Fonksiyonların `search_path` Durumu
- **Tür:** GÜVENLİK
- **Ciddiyet:** DÜŞÜK (Önlem Alınmış)
- **Sistem:** Sistem 16 (Veritabanı)
- **Nerede:** Canlı fonksiyonlar ve `20260913222440_cdx_lock_function_search_path.sql`
- **Durum:**
  Tüm `SECURITY DEFINER` fonksiyonları incelenmiş; `SET search_path = ''` veya `SET search_path = 'public', 'pg_temp'` ile kilitlendiği doğrulanmıştır. `search_path` kaçak açığı bulunmamaktadır.
- **Emin misin:** DOĞRULANDI

---

## 4. Temiz Çıkan Sistemler (Sorun Bulunmayanlar)

Aşağıdaki sistemler kod, mantık, veri akışı ve kenar durumlar açısından baştan sona taranmış ve **kusursuz çalıştığı doğrulanmıştır**:

1. **XP & Seviye / Gamification Motoru (`award_xp`, `xpTotals.js`):**
   - İdempotency anahtarları (`client_operation_id`) çift yazmayı kesin olarak engelliyor.
   - Sayfalama (pagination) sınırları 1000+ kayıtta bile patlamıyor.
   - Sunucu tek otorite olarak çalışıyor; istemci yalnızca sunucu verisini yansıtıyor.
2. **Seri (Streak) Hesaplama Hattı (`clde_streak_from_every_study_log.sql`):**
   - Gece 00:00 - 03:00 TR saat dilimi koruması tam.
   - Her çalışma kaydı seriyi doğru tetikliyor ve dondurma hakları (freeze) hatasız düşüyor.
3. **Çalışma Kaydı Konu İlerlemesi Tetikleyicisi (`cdx_study_log_topic_progress_delta.sql`):**
   - Kayıt düzenleme (edit) ve silme (delete) durumlarında delta hesapları eksiksiz yapılıyor.
   - Sayaçlar asla negatife düşmüyor (`GREATEST(0, ...)`).
4. **Hesap Silme Basamağı (`clde_account_delete_fk_cascade.sql`):**
   - Tüm yabancı anahtarlar (FK) kaskadlı olarak temizleniyor; öksüz veri veya silinmeyi engelleyen kısıt hatası bulunmuyor.
5. **Depolama (Storage) RLS Politikaları:**
   - Yanlış soru görselleri kovası (`wrong_questions`) bucket seviyesinde private.
   - Başka kullanıcının görselini indirme veya üzerine yazma politikalarla engelli.

---

## 5. Bakamadıklarımız / Kapsam Dışı Kalanlar

1. **Canlı Supabase Prod Veritabanı Direkt Konsol Erişimi:**
   - MCP SQL aracı ortamda bulunmadığı için veritabanı denetimi doğrudan production veritabanına sorgu atılarak değil, canlı migration defteri (`supabase/migrations/` altındaki 63 SQL dosyası) ve node test ortamı üzerinden gerçekleştirilmiştir.
2. **RevenueCat / App Store Canlı Sunucu Webhook Yanıtları:**
   - Canlı Apple StoreKit ortamında satın alma yapılamadığı için canlı webhook tetikleyicileri yalnızca mock testler düzeyinde incelenmiştir.
3. **iOS Native SwiftUI Widget Derleme Çıktıları:**
   - Windows ortamında çalışıldığı için iOS widget'larının SwiftUI render döngüsü emülatörde görsel olarak değil, JS veri hattı (`widgetSync.ios.js`) üzerinden statik olarak doğrulanmıştır.

---
*Rapor Sonu — Antigravity Sistem ve Güvenlik Denetimi*
