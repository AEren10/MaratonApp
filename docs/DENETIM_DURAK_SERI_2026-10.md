# Denetim: Durak · Program · Seri · Bildirim

**Tarih:** 1 Ekim 2026  
**Kapsam:** Salt okuma; uygulama kodu, migration ve canlı veri değiştirilmedi.  
**Sonuç:** 8 doğrulanmış bulgu ve 2 kod incelemesiyle güçlü şüphe bulundu; şüphelerden biri canlı ortamda doğrulanamayan veri bütünlüğü riskidir. Test paketi ve statik kontroller temiz geçse de aşağıdaki ekranlar arası durum eşitleme ve gün sınırı sorunları kullanıcıya yanlış sayı/bildirim gösterebilir.

## Yöntem ve doğrulama

- İstenen dosyaların varlığı doğrulandı; yalnız var olan dosya ve fonksiyonlar raporlandı.
- `npm test`: **882/882 test geçti**, çıkış kodu 0.
- `npm run check`: **başarılı**, çıkış kodu 0. Design drift artışı, runtime risk, undefined sembol, orphan screen, worklet ve motion-budget hatası bulunmadı.
- Odaklı testler: **63/63 geçti** (`todayStops`, program görünümleri, stop study log, effective streak, streak week, exam phase, prerequisites, notification plan, discovery, plan merge, offline identity ve notification scheduling).
- Ek saf fonksiyon sınamaları:
  - 400 durak 7 güne `58/57/57/57/57/57/57` dağıldı; ay sonu ve pazartesi örnekleri çalıştı.
  - 0 soru ve 0 dakika içeren durak çalışma kaydı üretmedi.
  - Aynı adaptif görev iki farklı günde aynı `planTaskKey` değerini üretti.
  - Rotasız yeni kullanıcıda Ana Sayfa 5, Programın tamamı 4 görev üretti.
  - En geniş bildirim bağlamında toplam 12 bekleyen bildirim ve gün başına en fazla 2 bildirim üretildi.
  - 21:00 tercih + 15 dakika öğrenilmiş saat kayması + 15 dakika jitter örneği 22:00'a sıkıştırıldı.
  - `America/New_York` saat diliminde Türkiye pazartesi 00:30 iken Program hafta başlangıcı önceki pazartesiye düştü.
  - UTC cihazda Türkiye pazartesi 01:00 iken çevrimdışı joker sıfırlama zamanı aynı pazartesi 07:00 TR olarak hesaplandı.
- Canlı Supabase için yalnız SELECT amaçlı CLI denemesi `AccessTokenRequiredError: Access token not provided` ile durdu. Bu nedenle canlı şema/fonksiyon sonuçları kesinmiş gibi sunulmadı.

## Zorunlu soruların kısa cevapları

### 1. Aynı günün durakları ve x/y sayısı

Rota mevcut ve yüklenmişken Ana Sayfa, Program > Hafta'nın bugünü ve Programın tamamı aynı `todayPlanStops` kaynağına bağlanıyor (`src/hooks/useHomeDashboard.js:92`, `src/hooks/useDayRouteStops.js:50-64`, `src/screens/plan/usePlanDetailViewModel.js:64`). Taşınan durak, bugün başka günden tamamlanan durak, prova günü, rota donması ve ilk hafta başlangıcı bu ortak kaynakta ele alınıyor (`src/domain/program/todayStops.js:28-69`, `src/domain/program/assignStopsToDays.js:63-110`).

Ancak **rota yokken aynı değiller**: Ana Sayfa ayrıca tek bir öneri ekliyor (`src/screens/home/useHomeController.js:99`, `src/hooks/useTodayStops.js:81-92`), Programın tamamı eklemiyor. Somut testte Ana Sayfa 5, Programın tamamı 4 görev gösterdi. Ayrıca tarih değişiminde tamamlanma belleğinin sıfırlanmaması x/y sayısını yeni güne taşıyabilir.

### 2. Aynı durağın iki ekrandan tiklenmesi

İstemci her iki ekranda da aynı kararlı `client_operation_id` üretir (`src/domain/plan/stopStudyLog.js:22-76`). Çevrimdışı kayıt aynı operasyon kimliğiyle kuyruğa girer ve bağlantı gelince gönderilir (`src/lib/stopCompletionLog.js:14-24`, `src/lib/offlineQueue.js`). Geri alma önce kuyruğu kaldırır, sonra sunucudaki aynı operasyon kimlikli satırı bulup siler (`src/lib/stopCompletionLog.js:38-51`).

Beklenen sonuç bir çalışma kaydıdır; fakat bunun yarış anında kesin olması canlıdaki `(user_id, client_operation_id)` UNIQUE indeksine bağlıdır. Aktif migration klasöründe bu indeks tanımı bulunmadı; yalnız canlı defter dışında arşivlenmiş migration'da var (`supabase/migrations_archived_not_in_live_ledger/20260903121406_harden_grants_and_idempotency.sql:20-22`). Canlı indeks okunamadığı için gerçek sonuç **kesin doğrulanamadı**. Ayrıca Programın tamamı yolunda yazma ile rota geçişi paralel başladığından başarısız geçişte geri alma yarışı oluşabilir.

### 3. Seri kuralları

- Bugünün TR tarihli ilk çalışma kaydı seriyi başlatır/artırır; aynı gün yeni kayıt tekrar artırmaz (`supabase/migrations/20261001151302_clde_streak_from_every_study_log.sql:15-68`).
- Son çalışma dünden eskiyse seri yeniden 1 olur; tam bir gün boşluk ve kullanılabilir joker varsa seri korunarak artar (`...:56-67`).
- Sunucu jokeri haftada bir, Türkiye haftasına göre sıfırlar (`...:45-51`). İstemcinin çevrimdışı hesabı cihaz saat dilimini kullandığı için sınırda aynı kuralı uygulamıyor (`src/lib/streakFreeze.js:14-23`).
- 00:00-03:00 TR arasındaki yeni kayıt `todayTR()` ile o takvim gününe yazılır (`src/lib/stopCompletionLog.js:15`, `src/lib/dateUtils.js:21-28`); önceki güne özel bir 03:00 toleransı yoktur.
- Geriye dönük kayıt seriyi oynatmaz: istemci yalnız bugün için sync çağırır; tetikleyici de yalnız bugünün TR tarihini işler (`src/screens/study/useAddStudyController.js:90-99`, migration `...:114-121`).
- Kayıt silinince seri yeniden hesaplanmaz. Bugünün tek kaydı silinirse seri yanlış biçimde kalabilir.

### 4. Seri şeridi, panel, modal, bildirim ve grup serisi

Kişisel seri bileşenleri aynı kişisel seri state'ini temel alıyor; fakat Programın tamamı tikinden sonra dönen seri Redux'a uygulanmadığı ve `todayLogs` hemen yenilenmediği için şerit/panel/bildirim geçici olarak farklı eski durum gösterebilir. Dönüm noktası mantığında odaklı testlerde ayrı bir yanlış sayı bulunmadı.

Grup serisinin kişisel seriyle aynı olması gerekmiyor: grup serisi, o tarihte gruba katılmış bütün üyeler çalıştıysa günü sayan ayrı bir metriktir (`supabase/migrations/20261001152234_clde_group_streak.sql:1-45`). Bu fark tasarlanmış davranıştır.

### 5. Bildirim planı

- Gün başına en fazla iki dilim var; testte sınır aşılmadı (`src/domain/notify/notificationPlan.js:107-115`).
- Gün tamamlandığında güncel bağlamla yeniden planlanırsa akşam bildirimi kurulmaz (`...:47-71`, `src/lib/notifications.js:314-357`).
- Durak tiki `todayLogs` Redux listesini hemen güncellemediği için bugün çalışan kullanıcıya seri uyarısı kalabilir.
- Tam **22:00** bildirimi üretilebiliyor; bu, belgelenen 22:00-08:00 sessiz aralığına aykırı.
- Uygulama açılmazsa yarın, 3., 7. ve 14. gün merdiveni doğru kuruluyor (`notificationPlan.js:47-57`).
- Test edilen en geniş planda 12 bekleyen bildirim vardı; iOS 64 sınırı aşılmıyor.

### 6. Keşif popup'ları

Denemesiz kullanıcıda deneme tabanlı hedef/tahmin/karşılaştırma popup'ı üretmiyor. Tahmin aynı türde 3 denemeden sonra, ilk karşılaştırma 2 denemede, sonraki karşılaştırmalar en az 3 net değişimde oluşuyor (`src/domain/notify/discovery.js:24-68`). Fren 3 gün (`...:19-23`) ve görülme kaydı kullanıcıya özel anahtarda tutuluyor (`src/hooks/useDiscoveryNudges.js:12-38`). Hedef bağlantısı `SCREENS.GOALS`, rota bağlantısı `SCREENS.ROADMAP` üzerinden tanımlı; hedef ekranı Rota stack'inde mevcut (`src/screens/home/nudgeNavigation.js:9-11`, `src/navigation/tabAssignment.js:28,64,93`). Bu alanda sorun bulunmadı.

### 7. Rota motoru

AYT payları kodda ve saf testte uygulandı: 151+ gün %33, 61-150 gün %70, 0-60 gün %90 (`src/domain/route/examPhase.js:15-17,30`; uygulama noktası `src/lib/routeEngine.js:317`). Ön koşul yalnız AYT sırasını yeniden düzenliyor; öğeyi filtrelemediği için tek başına durağı sonsuza dek yok etmiyor (`src/domain/route/examPhase.js:92-118`). Bitirilmiş konu yeni öğrenme durağı olarak dönmüyor; ancak zamanı gelen tekrar veya açık yanlış tekrarı olarak gelebiliyor (`src/lib/routeEngine.js:150-197`).

### 8. Supabase güvenliği

Yerel son tanımlarda incelenen fonksiyonların sabit `search_path` ve çağıran/üyelik kontrolü var: `private.touch_streak` `auth.uid()` kullanıyor, `private.apply_streak` dış rollere kapalı, `get_group_streak` üyelik denetliyor, `report_avatar`, `transition_route_stop` ve `persist_route_revision` çağıranı doğruluyor. Study log tetikleyicisi seri hatasını yakaladığı için seri hesabı başarısız olsa da çalışma kaydını düşürmüyor (`20261001151302...:107-129`). Yerel RLS migration'ları rota satırlarını kullanıcıya, grup üyelerini aynı gruba sınırlar; profil tablosunda kimliği/adı/avatarı gibi ürünce görünür sütunlar ayrı tasarlanmıştır.

Canlı fonksiyon gövdeleri, canlı politikalar, indeksler ve migration listesi bu oturumda okunamadı. Repo defteri 1 Ekim'de canlı migration listesinin hizalı olduğunu söylüyor (`docs/MIGRATION_LEDGER_2026-10.md`); bu, bu denetimde bağımsız canlı doğrulama yerine geçmez.

## Bulgular

### Rotasız kullanıcıda Ana Sayfa ve Programın tamamı farklı görev sayısı gösteriyor

- **Tür:** MANTIK / KULLANICI
- **Ciddiyet:** YÜKSEK
- **Nerede:** `src/screens/home/useHomeController.js:99`; `src/hooks/useTodayStops.js:81-92`; `src/screens/plan/usePlanDetailViewModel.js:64-78`
- **Nasıl tekrarlanır:** 1) Aktif rota haftası olmayan kullanıcı aç. 2) Günlük hedefle `generateDailyPlan` dört görev üretsin. 3) Ana Sayfadaki Bugünün Durakları ile Programın tamamını karşılaştır. Saf testte aynı girdide Programın tamamı 4, Ana Sayfa ek öneriyle 5 görev verdi.
- **Kullanıcı ne görür:** Aynı gün için iki ekranda farklı liste ve farklı x/y sayısı.
- **Önerilen düzeltme:** Ek önerinin tek günlük plan kaynağına dahil edilip iki görünümün de aynı birleşik modeli tüketmesini veya iki görünümden de kaldırılmasını sağlayın.
- **Emin misin:** DOĞRULANDI

### Tamamlanma belleği gece yarısında yeni güne sıfırlanmıyor

- **Tür:** KOD / MANTIK
- **Ciddiyet:** YÜKSEK
- **Nerede:** `src/hooks/usePlanCompletion.js:12-13,20-43,61,69-92`; `src/domain/plan/planTaskIdentity.js:5-20`
- **Nasıl tekrarlanır:** 1) Bir adaptif plan görevini tamamla. 2) Uygulamayı kapatmadan gece yarısını geçir. 3) Aynı konu/görev ertesi gün yeniden üretildiğinde hook'un effect'i yalnız `userId` değişimine bağlı olduğundan dünkü `doneIds` bellekte kalır. Saf test aynı adaptif görev anahtarının iki günde de aynı olduğunu doğruladı.
- **Kullanıcı ne görür:** Yeni günün görevi daha başlamadan tamamlanmış görünebilir; x/y sayısı yanlış başlayabilir. Sabit `ai_suggestion` kimliği de aynı riskte.
- **Önerilen düzeltme:** Hook'u TR gün anahtarına bağlayın; gün değişince ilgili günün yerel/uzak tamamlanma state'ini yeniden yükleyin ve eski ref/state'i temizleyin.
- **Emin misin:** DOĞRULANDI

### Durak tiki çalışma özetini ve bildirim bağlamını hemen güncellemiyor

- **Tür:** MANTIK / KULLANICI
- **Ciddiyet:** YÜKSEK
- **Nerede:** `src/lib/stopCompletionLog.js:14-24`; `src/hooks/useTodayStops.js:130-131`; `src/hooks/useHomeDashboard.js:63-70`; `src/hooks/useDataSync.js:135-153`; `src/hooks/useStreakReminderSync.js:13-24`
- **Nasıl tekrarlanır:** 1) Bugün henüz çalışma kaydı olmayan ve serisi en az 3 olan kullanıcıyla aç. 2) Bir durağı tikle. 3) Ana Sayfadaki bugünkü soru/dakika değerini ve planlanmış seri bildirimini tam veri senkronizasyonu olmadan kontrol et. Tik sunucu/kuyruğa kayıt yazar; Redux `todayLogs` listesine satır eklemez. Bu liste ancak DataSync yenilemesinde doldurulur.
- **Kullanıcı ne görür:** Tik tamamlanır fakat grafik/soru/dakika kıpırdamaz; o gün çalışmasına rağmen “serin bitmek üzere” bildirimi kalabilir.
- **Önerilen düzeltme:** Başarılı veya kuyruğa alınmış durak kaydını tek bir merkezi aksiyonla `todayLogs` state'ine idempotent biçimde yansıtın ve bildirim planını `studiedToday=true` ile hemen yenileyin; başarısız kalıcı yazmada geri alın.
- **Emin misin:** DOĞRULANDI

### Programın tamamı tik yolu dönen seri değerini ekrana uygulamıyor

- **Tür:** MANTIK / KULLANICI
- **Ciddiyet:** ORTA
- **Nerede:** `src/screens/plan/usePlanDetailTasks.js:63-76`; karşılaştırma: `src/hooks/useTodayStops.js:130-131`
- **Nasıl tekrarlanır:** 1) Programın tamamından günün ilk durağını tikle. 2) `recordStopCompletion` sonucunu izle. Bu yol promise sonucunu yok sayar; Ana Sayfa yolu aynı sonucu `applyStreak` ile Redux'a yazar.
- **Kullanıcı ne görür:** Program tiki tamamlanırken seri şeridi/paneli bir sonraki genel senkronizasyona kadar eski sayıda kalabilir; Ana Sayfadan tikte daha erken güncellenir.
- **Önerilen düzeltme:** Her iki ekranı aynı tamamlama komutuna bağlayın; çalışma kaydı, seri sonucu, Redux ve bildirim yan etkileri tek yerde çalışsın.
- **Emin misin:** DOĞRULANDI

### Bugünün tek çalışma kaydı silinince seri geri hesaplanmıyor

- **Tür:** MANTIK
- **Ciddiyet:** YÜKSEK
- **Nerede:** `src/supabase/studyLogs.js:144-153`; `supabase/migrations/20261001151302_clde_streak_from_every_study_log.sql:107-129`
- **Nasıl tekrarlanır:** 1) Bugünün tek study log satırını ekleyip seriyi artır. 2) Kaydı geri al/sil. 3) `streaks` satırını oku. Seri tetikleyicisi yalnız `AFTER INSERT`; silme yolunda yeniden hesaplama çağrısı yok.
- **Kullanıcı ne görür:** Bugün hiç çalışma kaydı kalmadığı halde seri devam ediyor ve kişisel seri göstergeleri yanlış sayı gösterebiliyor.
- **Önerilen düzeltme:** Delete sonrası kullanıcının benzersiz çalışma günlerinden seriyi güvenli biçimde yeniden hesaplayan sunucu fonksiyonu/trigger ekleyin; en uzun seri ve joker semantiğini açıkça tanımlayın.
- **Emin misin:** DOĞRULANDI

### Program tiki ile rota geçişinin paralel çalışması geri alma yarışına yol açabilir

- **Tür:** KOD
- **Ciddiyet:** YÜKSEK
- **Nerede:** `src/screens/plan/usePlanDetailTasks.js:65-76`; `src/lib/stopCompletionLog.js:38-51`
- **Nasıl tekrarlanır:** 1) Ağ gecikmeli iken bir rota durağını Programın tamamından tikle. 2) `recordStopCompletion` henüz tamamlanmadan `transitionStop` hata versin. 3) Catch bloğu silmeyi başlatsın; silme sorgusu insert'ten önce biterse daha sonra tamamlanan insert geride kalabilir.
- **Kullanıcı ne görür:** Durak tamamlanmamış görünürken grafikte/sorularda o durağın çalışma kaydı kalabilir.
- **Önerilen düzeltme:** Yazma ve rota geçişini sıralı/işlemsel bir komutta yönetin veya rollback'i aynı operasyon kimliği için insert tamamlandıktan sonra idempotent çalıştırın.
- **Emin misin:** ŞÜPHE

### Study log idempotency indeksi canlıda yoksa iki ekran aynı kaydı iki kez yazabilir

- **Tür:** KOD / MANTIK
- **Ciddiyet:** YÜKSEK
- **Nerede:** `src/domain/plan/stopStudyLog.js:22-76`; `supabase/migrations_archived_not_in_live_ledger/20260903121406_harden_grants_and_idempotency.sql:20-22`
- **Nasıl tekrarlanır:** 1) Aynı durağı Ana Sayfa ve Program ekranından eşzamanlı tikle. 2) İki istek aynı `client_operation_id` ile canlıya ulaşsın. 3) Canlıda UNIQUE indeks yoksa iki insert de kabul edilebilir. Aktif migration defterinde indeksin oluşturulması görünmüyor; arşiv dosyası canlı defter dışında.
- **Kullanıcı ne görür:** Soru/dakika/ilerleme iki kez sayılabilir. UNIQUE indeks canlıda varsa tek kayıt oluşur ve bu risk gerçekleşmez.
- **Önerilen düzeltme:** Canlıda `pg_indexes` ile `(user_id, client_operation_id) WHERE client_operation_id IS NOT NULL` benzersiz indeksini doğrulayın; yoksa veri temizliği planından sonra ayrı migration ile ekleyin.
- **Emin misin:** ŞÜPHE

### Sessiz saat başlangıcına tam 22:00 bildirimi kurulabiliyor

- **Tür:** MANTIK / KULLANICI
- **Ciddiyet:** ORTA
- **Nerede:** `src/domain/notify/notificationPlan.js:15,25-36`; `src/lib/notifications.js:178-188`
- **Nasıl tekrarlanır:** 1) Hatırlatma tercihini 21:00 yap. 2) Öğrenilmiş optimal saat 22 olsun veya 21:00 üzerine pozitif jitter gelsin. 3) Planı üret. Sınama tam 22:00 bildirim üretti çünkü üst sınır kapsayıcı.
- **Kullanıcı ne görür:** “22:00-08:00 sessiz” beklentisine rağmen tam 22:00'da bildirim.
- **Önerilen düzeltme:** Sessiz aralığı yarı açık tanımlayın; 22:00 ve sonrası bildirimi önceki güvenli dakikaya taşımak yerine ertesi uygun saate erteleyin veya hiç kurmayın.
- **Emin misin:** DOĞRULANDI

### Program haftası Türkiye günü ile cihaz haftasını karıştırıyor

- **Tür:** KOD / MANTIK
- **Ciddiyet:** ORTA
- **Nerede:** `src/hooks/useWeekProgram.js:30-39`; `src/lib/dateUtils.js:21-24,40-45,56-64`
- **Nasıl tekrarlanır:** 1) Cihazı `America/New_York` saat dilimine al. 2) Türkiye'de pazartesi 00:30 iken Programı aç. 3) `todayKey` Türkiye'ye göre pazartesi olurken `startOfWeek()` cihazda hâlâ pazar olduğu için önceki haftanın pazartesisini döndürür.
- **Kullanıcı ne görür:** Bugün pazartesi seçili/etiketli olsa da ekranda önceki haftanın programı veya yanlış tarih aralığı görünebilir.
- **Önerilen düzeltme:** Program haftasının tüm hesaplarını `startOfWeekTR` ve TR tarih anahtarlarıyla yapın; cihaz-local Date ile TR date key'i aynı akışta karıştırmayın.
- **Emin misin:** DOĞRULANDI

### Çevrimdışı joker sıfırlaması cihaz saat dilimine göre hesaplanıyor

- **Tür:** KOD / MANTIK
- **Ciddiyet:** ORTA
- **Nerede:** `src/lib/streakFreeze.js:5-23,30-42`; karşılaştırma: `supabase/migrations/20261001151302_clde_streak_from_every_study_log.sql:45-51`
- **Nasıl tekrarlanır:** 1) Cihaz UTC iken Türkiye'de pazartesi 01:00 anında çevrimdışı seri hesabı çalıştır. 2) `toDateStr` günü TR pazartesi alır; `nextMondayReset` ise cihaz-local `getDay/setHours` kullanarak aynı gün 04:00 UTC'yi, yani 07:00 TR'yi üretir. 3) Sunucu aynı haftanın gelecek pazartesi sınırını kullanır.
- **Kullanıcı ne görür:** Çevrimdışı durumda joker aynı pazartesi sabahı yeniden sıfırlanabilir veya sunucuyla bağlanınca joker sayısı/durumu değişebilir.
- **Önerilen düzeltme:** İstemcide reset sınırını tamamen Europe/Istanbul takviminden üretin ve sunucu kuralıyla aynı test vektörlerini paylaşın.
- **Emin misin:** DOĞRULANDI

## Temiz çıkanlar

- Rota varken bugünün rota durakları Ana Sayfa, Program > Hafta ve Programın tamamında ortak `todayPlanStops` kaynağından geliyor.
- Taşınan duraklar en fazla iki adet ve konu köküne göre tekilleştiriliyor; bugün başka günde tamamlanan durak bugünün listesinde korunuyor.
- Prova/bloklu gün, planın hafta ortasında başlaması, sınav günü ve rota donması dağıtımda ele alınıyor.
- 400 durak, ay sonu, pazartesi geçişi, yeni kullanıcı ve 0 soruluk durak saf fonksiyon sınamalarında çökmedi.
- Stop study log operasyon kimlikleri istemci tarafında kararlı; geri alma çevrimdışı kuyruğu ve sunucuyu aynı kimlikle hedefliyor.
- Geriye dönük çalışma kaydı seriyi oynatmıyor; 00:00 sonrası kayıt TR takviminde yeni güne yazılıyor.
- Sunucu seri tetikleyicisi kendi hatasını yakalıyor; seri hatası study log insert'ünü geri almıyor.
- Grup serisi kişisel seriden bilinçli olarak farklı tanımlı ve yalnız grup üyesine açık RPC üzerinden hesaplanıyor.
- Bildirim planı gün başına iki dilimi aşmadı; 3/7/14 gün merdiveni ve test edilen 12 bekleyen bildirim iOS 64 sınırı içinde.
- Keşif popup'ları gerçek deneme/hedef koşullarını kontrol ediyor, üç günlük fren ve kullanıcıya özel görülme kaydı çalışıyor; hedef/rota bağlantıları kayıtlı ekranlara gidiyor.
- AYT evre payları, yalnız AYT ön koşul sırası ve bitmiş konuların yalnız zamanı gelen tekrar/yanlış tekrarı olarak dönmesi odaklı testlerde doğru çıktı.
- Yerel migration kanıtında incelenen SECURITY DEFINER fonksiyonların `search_path` ve kimlik/üyelik kontrolleri mevcut; rota ve grup tablolarının RLS politikaları kullanıcı kapsamlı.

## Bakamadıkların

- Canlı Supabase `pg_get_functiondef`, RLS policy ve `pg_indexes` çıktıları: bu oturumda erişim tokenı yoktu; CLI salt-okuma bağlantısı kurulamadı.
- Canlıdaki study log UNIQUE indeksinin varlığı: çift tik sonucunun kesin olarak tek satır olduğunu söylemek için özellikle `pg_indexes` okunmalı.
- Canlı `list_migrations` ile son 10 migration'ın bu oturumdaki bağımsız karşılaştırması. Repo içindeki `docs/MIGRATION_LEDGER_2026-10.md`, 1 Ekim'de başka bir canlı MCP oturumunda hizalı bulunduğunu kaydediyor.
- Gerçek cihazda işletim sistemi bildirim merkezinin üreticiye özgü erteleme/iptal davranışı; burada plan üretimi ve scheduling kodu test edildi.
- Gerçek kullanıcı verisiyle yarış koşulu testi yapılmadı; canlı veri değiştirmeme kuralı nedeniyle Program tiki/rota geçişi yarışı kod akışından raporlandı.
