# Maraton Ürün Analitiği Denetimi

**Tarih:** 2 Ekim 2026  
**Kapsam:** Salt okuma. Uygulama kodu, migration ve canlı veri değiştirilmedi.  
**Sistemin genel adı:** Product analytics / ürün analitiği. Ekran görüntüleme, ekranda kalma süresi, kullanıcı akışı, huni ve retention ölçümü bu başlık altında değerlendirilir.

## Kısa cevap

**Evet, üzerine çalışma yapılmış ve uygulamada çalışan bir ürün analitiği temeli var.** Maraton şu anda Mixpanel, Amplitude veya PostHog kullanmıyor. Kendi olay toplama katmanını kullanıyor ve olayları Supabase'deki tablolara göndermek üzere tasarlanmış:

- Genel ürün analitiği: `analytics_events`
- Retention/nudge/paywall davranışı: `retention_events`
- Hata ve performans izleme: Sentry — bu ürün analitiğiyle aynı sistem değildir.

Uygulama otomatik olarak şunları ölçmek üzere bağlanmış:

- Hangi ekran açıldı (`screen.view`)
- Ekrandan ne zaman çıkıldı (`screen.exit`)
- Ekranda kaç saniye kalındı (`screen.duration`)
- Sonraki ekran hangisiydi (`nextScreen`)
- Ziyaret 2,5 saniyeden kısa mıydı (`isBounce`)
- Ekranın ait olduğu ürün akışı (`flow`)
- Bazı butonlar, formlar, kayıt/oturum, çalışma, deneme, rota, yanlış defteri, push ve paylaşım aksiyonları

Fakat sistem **ürün yöneticisinin açıp grafiklere baktığı tamamlanmış bir panel değil**. Ham olay toplama kodu var; hazır dashboard, kaydedilmiş SQL raporları, D1/D7/D30 görünümü, funnel tanımı ve veri kalite alarmı yok. Bugün verilere bakmanın yolu Supabase SQL Editor'da sorgu çalıştırmak.

## Bu konuda daha önce ne yapılmış?

Git geçmişinde üç somut çalışma var:

| Commit | Yapılan iş |
|---|---|
| `bc9d1dd` | İlk huni analitiği, temel olay gönderici ve `analytics_events` migration'ı |
| `57ae34b` | Analytics tamponu, retention olayları, form analitiği ve geniş olay seti |
| `dadfa8e` | Otomatik ekran açılışı, ekran çıkışı ve ekranda kalış süresi |

Yani konu yalnız konuşulmamış; kodlanmış. Buna rağmen ürün stratejisi belgelerinde “ölçüm stratejisi/dashboard eksik” olarak bırakılmış (`docs/PRODUCT_STRATEGY.md:57,123,171`).

## Sistem nasıl çalışıyor?

### 1. Ekran takibi

`NavigationContainer` hazır olduğunda ve rota değiştiğinde mevcut en iç ekran okunuyor (`src/navigation/AppNavigator.js:264-273`). `createNavigationTracker`:

1. Ekran açılınca `screen.view` gönderiyor.
2. Başka ekrana geçilince süreyi hesaplıyor.
3. `screen.exit` ve `screen.duration` olaylarını aynı süre bilgileriyle gönderiyor.
4. Uygulama arka plana giderse aktif ekranı `background` sebebiyle kapatıyor.
5. Uygulama yeniden aktif olunca aynı ekran için yeni bir `screen.view` başlatıyor.

Kaynak: `src/navigation/analytics/navigationTracker.js:13-80`, `src/navigation/AppNavigator.js:212-232`.

Ekran olayındaki önemli alanlar:

| Alan | Anlamı |
|---|---|
| `screen` | Ekran adı |
| `durationSec` | Ekranda geçirilen yaklaşık saniye |
| `nextScreen` | Sonraki ekran |
| `reason` | Navigasyon, background veya inactive |
| `isBounce` | 2,5 saniyeden kısa ziyaret |
| `stayCategory` | instant, quick, brief, medium, long, deep |
| `flow` | onboarding, daily loop, plan/stops vb. ürün akışı |
| `session_id` | Aynı uygulama oturumundaki olayları bağlayan kimlik |

### 2. Olayların cihazda tamponlanması

`track()` çağrıları önce cihaz belleğine ve AsyncStorage tamponuna yazılıyor (`src/lib/analytics.js:13-24,96-122`).

- 10 olay birikince gönderim deneniyor.
- Her 30 saniyede gönderim deneniyor.
- Uygulama arka plana giderken ve çıkış yapılırken flush deneniyor.
- Bağlantı yoksa olaylar yerel tamponda kalıyor.
- Genel tampon en fazla 200 olay, kimlik oluşmadan bekleyen tampon en fazla 120 olay tutuyor.
- Sunucuya bir seferde en fazla 50 olay gönderiliyor.

Kaynak: `src/lib/analytics.js:15-18,64-91,150-181`, `src/contexts/AuthContext.js:92-103`.

### 3. Supabase'e yazılması

Genel olaylar aşağıdaki biçimde `analytics_events` tablosuna insert ediliyor (`src/supabase/analyticsEvents.js:4-10`):

```text
user_id
session_id
event
props (JSON)
occurred_at
```

Retention olayları ayrı `retention_events` tablosuna yazılıyor. Burada comeback, nudge, paywall suppression ve çalışma oturumu sayacı gibi daha özel olaylar var (`src/constants/retention.js:1-18`, `src/supabase/retention.js:77-96`). Retention sistemi `client_event_id` ile tekrar gönderimlere karşı genel analytics sisteminden daha dayanıklı.

### 4. Kullanıcı kimliği

Olaylar `auth.users.id` ile kullanıcıya bağlıdır. Kullanıcı giriş yapmadan oluşan olaylar cihazda bekletilir ve girişten sonra hesaba bağlanır (`src/lib/analytics.js:93-121,150-172`). Hiç giriş yapmadan uygulamayı terk eden kullanıcının olayları sunucuya gitmez.

## Neler gerçekten ölçülüyor?

`src/constants/analytics.js` içinde 64 olay adı tanımlı. Bunların:

- **39 tanesi kodda gerçekten kullanılıyor.**
- **25 tanesi yalnız tanımlı; hiçbir yerden gönderilmiyor.**

Önemli çalışan olaylardan bazıları:

- `screen.view`, `screen.exit`, `screen.duration`
- `button.tap`
- `form.started`, `form.completed`, `form.abandoned`
- `auth.login`, `auth.register`
- `onboarding.complete`, seviye testi gönderildi/atlandı
- `plan.task_completed`
- `study.completed`
- `trial.entered`, `trial.started`, `trial.quota_blocked`
- `route.created`, `route.creation_failed`, `route.stop_transitioned`
- `streak.continued`, `streak.broken`
- Push alındı/açıldı
- Referral link paylaşıldı/uygulandı

Ürün açısından önemli olup bugün **gönderilmeyen** olaylardan bazıları:

- `plan.viewed`, `plan.all_completed`, `plan.task_skipped`
- `study.started`, `study.timer_started`, `study.timer_stopped`
- `trial.abandoned`, `trial.compared`
- `wrong.added`, `wrong.reviewed`
- `auth.logout`, Apple/Google giriş ayrımı
- `push.token_registered`

Premium, lig ve kart ödeme ile ilgili kullanılmayan olayların bir bölümü V1'de bu özellikler askıda olduğu için eksik kabul edilmemelidir.

## Verilere nereden bakacaksın?

Şu an hazır bir Maraton analytics paneli yok. Supabase Dashboard üzerinden bakılır:

1. Supabase projesini aç.
2. **SQL Editor** bölümüne gir.
3. Aşağıdaki sorgulardan birini yapıştır.
4. Sonuçları tablo veya chart görünümünde incele.

Table Editor'da `analytics_events` ve `retention_events` tablolarına bakmak ham olayları gösterir; karar vermek için aşağıdaki toplu sorgular daha anlamlıdır.

### En çok ve en az açılan ekranlar — son 30 gün

```sql
select
  props->>'screen' as screen,
  count(*) as views,
  count(distinct user_id) as unique_users
from public.analytics_events
where event = 'screen.view'
  and occurred_at >= now() - interval '30 days'
group by 1
order by views desc;
```

Listenin altındaki ekranlar az kullanılan ekranlardır. `unique_users`, aynı kişinin tekrar tekrar giriş yapmasının sonucu şişirmesini azaltır.

### Kullanıcıların en uzun/kısa kaldığı ekranlar

```sql
select
  props->>'screen' as screen,
  count(*) as exits,
  round(avg((props->>'durationSec')::numeric), 1) as avg_seconds,
  percentile_cont(0.5) within group (
    order by (props->>'durationSec')::numeric
  ) as median_seconds,
  round(100.0 * avg(case when (props->>'isBounce')::boolean then 1 else 0 end), 1) as bounce_pct
from public.analytics_events
where event = 'screen.duration'
  and props ? 'durationSec'
  and occurred_at >= now() - interval '30 days'
group by 1
having count(*) >= 5
order by avg_seconds desc;
```

Karar verirken ortalamadan çok `median_seconds` ve `bounce_pct` değerlerine bakmak daha güvenlidir.

### Ekrandan ekrana geçişler

```sql
select
  props->>'screen' as from_screen,
  props->>'nextScreen' as to_screen,
  count(*) as transitions
from public.analytics_events
where event = 'screen.exit'
  and props->>'reason' = 'navigation'
  and props->>'nextScreen' is not null
  and occurred_at >= now() - interval '30 days'
group by 1, 2
order by transitions desc;
```

Bu sorgu kullanıcıların uygulamada hangi yolları izlediğini gösterir.

### Günlük aktif kullanıcı

```sql
select
  (occurred_at at time zone 'Europe/Istanbul')::date as day,
  count(distinct user_id) as dau
from public.analytics_events
where occurred_at >= now() - interval '30 days'
group by 1
order by 1;
```

### Ana ürün hunisi

```sql
select
  count(distinct user_id) filter (where event = 'auth.register') as registered,
  count(distinct user_id) filter (where event = 'onboarding.complete') as onboarding_completed,
  count(distinct user_id) filter (where event = 'route.created') as route_created,
  count(distinct user_id) filter (where event = 'study.completed') as first_study_users,
  count(distinct user_id) filter (where event = 'trial.entered') as trial_users
from public.analytics_events
where occurred_at >= now() - interval '30 days';
```

Bu basit sorgu olayların sırasını zorlamaz. Gerçek funnel için her kullanıcının adımları doğru sırada yaptığı ve belirlenen süre penceresinde ilerlediği ayrıca kontrol edilmelidir.

### Son yedi gün veri geliyor mu?

```sql
select
  event,
  count(*) as event_count,
  max(occurred_at) as last_seen
from public.analytics_events
where occurred_at >= now() - interval '7 days'
group by event
order by event_count desc;
```

Bu sorgu boş dönüyorsa uygulama henüz gerçek kullanıcı görmemiş olabilir, tablo/grant eksik olabilir veya istemci insert'leri başarısız oluyor olabilir.

## Bulgular

### Hazır bir ürün analitiği dashboard'u bulunmuyor

- **Durum:** DOĞRULANDI
- **Ciddiyet:** YÜKSEK
- **Kanıt:** `package.json:20-66` içinde PostHog, Mixpanel, Amplitude veya Firebase Analytics yok; repoda analytics dashboard/view/RPC bulunmadı. `docs/PRODUCT_STRATEGY.md:123,171` bunu yapılacak iş olarak tutuyor.
- **Etkisi:** Veri toplansa bile düzenli olarak bakılmadığı için “hangi ekran az kullanılıyor, kullanıcı nerede düşüyor, D7 retention ne” soruları ürün kararına dönüşmüyor.
- **Öneri:** V1 için önce Supabase SQL sorgularını kaydedilmiş rapor/view haline getirin. Kullanım hacmi artınca PostHog veya Amplitude'a geçiş değerlendirilebilir.

### Analytics ve retention tablolarının oluşturma migration'ları aktif defterde değil

- **Durum:** DOĞRULANDI (repo); CANLI DURUM DOĞRULANAMADI
- **Ciddiyet:** YÜKSEK
- **Kanıt:** `analytics_events` tablosunu oluşturan tek dosya `supabase/migrations_archived_not_in_live_ledger/044_analytics_events.sql:9-35`; `retention_events` tablosunu oluşturan tek dosya `supabase/migrations_archived_not_in_live_ledger/20260903134050_retention_event_foundation.sql:5-44`. Aktif ilk migration `20260901140141...:5` var olduğunu varsaydığı `analytics_events` politikasını ALTER ediyor.
- **Etkisi:** Mevcut canlı veritabanında tablolar bulunabilir; fakat yalnız aktif `supabase/migrations/` klasöründen temiz veritabanı kurmak bu iki tablo bakımından tekrarlanabilir değil. Canlı tablolar yoksa istemci hatayı yutup olayları yalnız yerel tamponda tutar.
- **Öneri:** Canlıda admin yetkisiyle `to_regclass('public.analytics_events')`, `to_regclass('public.retention_events')`, indeksler, RLS ve grant'leri doğrulayın. Eksikler varsa canlı şemayla uyumlu, idempotent bir baseline migration hazırlayın; arşiv dosyasını körlemesine geri taşımayın.

### Olay kataloğundaki 25 olay hiçbir yerden gönderilmiyor

- **Durum:** DOĞRULANDI
- **Ciddiyet:** ORTA
- **Kanıt:** `src/constants/analytics.js` içindeki 64 sabitin statik kullanım taramasında 39'u çağrılıyor, 25'i çağrılmıyor.
- **Etkisi:** Sabitin varlığı ölçüm yapıldığı izlenimi veriyor. Özellikle plan görüntüleme/tamamlama, çalışma başlangıcı, timer başlangıç-bitiş, deneme terk ve yanlış defteri hunileri çıkarılamıyor.
- **Öneri:** V1'de karar verilecek 8-12 olayı seçin; askıdaki özellik olaylarını “inactive” diye belgeleyin, gerekli olayları gerçek başarı/terk noktalarına bağlayın.

### Giriş yapmadan uygulamayı terk eden kullanıcı sunucu analitiğinde görünmüyor

- **Durum:** DOĞRULANDI
- **Ciddiyet:** ORTA
- **Kanıt:** Kullanıcı kimliği yokken olaylar `pendingEvents`/AsyncStorage'a yazılıyor; yalnız `initAnalytics(userId)` sonrasında sunucu tamponuna aktarılıyor (`src/lib/analytics.js:93-121,150-172`).
- **Etkisi:** Karşılama, kayıt ve giriş ekranlarında düşüp hiç hesap açmayan kişiler ölçülemez. Kayıt dönüşüm oranının paydası eksik kalır ve olduğundan iyi görünebilir.
- **Öneri:** Hukuki/mağaza beyanı netleştirildikten sonra rastgele, kişisel olmayan install/anonymous kimliğiyle sınırlı pre-auth funnel düşünün veya raporlarda yalnız “kimliği doğrulanmış kullanıcı hunisi” ölçüldüğünü açıkça yazın.

### Kimliksiz bekleyen olayların gerçek zamanı giriş anıyla değiştiriliyor

- **Durum:** DOĞRULANDI
- **Ciddiyet:** ORTA
- **Kanıt:** Pending olay `at` alanıyla saklanıyor (`src/lib/analytics.js:99-108`), fakat giriş sonrası `track(e.event, e.props)` çağrısı eski `at` değerini geçirmiyor ve yeni zaman üretiyor (`...:169-172,112-118`).
- **Etkisi:** Kayıt öncesi ekranların sırası korunabilse de olay zamanları giriş anına yığılır. Ekranlar arası süre ve onboarding'in ne kadar sürdüğü güvenilmezleşir.
- **Öneri:** Pending olay yeniden kuyruğa alınırken özgün `at` ve gerekiyorsa anonim session kimliğini koruyun.

### Genel analytics gönderimi tam idempotent değil

- **Durum:** ŞÜPHE — kod akışıyla mümkün, süreç öldürme testi yapılmadı
- **Ciddiyet:** ORTA
- **Kanıt:** Batch önce sunucuya insert ediliyor, ardından bellekten çıkarılıp AsyncStorage'a yazılıyor (`src/lib/analytics.js:74-85`). `analytics_events` için `client_event_id`/unique idempotency alanı yok. Retention sistemi bu korumaya sahip (`src/supabase/retention.js:10-14,61-69`).
- **Etkisi:** Sunucu insert'i başarılı olduktan hemen sonra uygulama kapanırsa eski yerel tampon tekrar gönderilip ekran görüntülemelerini veya aksiyonları çift sayabilir.
- **Öneri:** Her genel olaya kararlı `client_event_id` ekleyin ve sunucuda `(user_id, client_event_id)` unique indeks kullanın.

### Ekran analitiği için otomatik test bulunmuyor

- **Durum:** DOĞRULANDI
- **Ciddiyet:** ORTA
- **Kanıt:** `tests/` altında `navigationTracker` veya genel `analytics.js` davranışını çalıştıran test yok. Var olan analytics ilişkili testler veri export'u, retention tamponu ve paylaşım kartı olayını metin/kontrat seviyesinde kontrol ediyor.
- **Etkisi:** Navigasyon yapısı değiştiğinde ekran süresi, background/resume veya çift event davranışı sessizce bozulabilir.
- **Öneri:** Sahte saatle `ready → change → pause → resume` senaryolarını; buffer retry, kullanıcı değişimi ve batch sınırlarını test edin.

### Gizlilik metni ürün analitiğinin gerçek amacını yeterince açık anlatmıyor

- **Durum:** DOĞRULANDI; hukuki yorum için inceleme gerekli
- **Ciddiyet:** YÜKSEK
- **Kanıt:** Canlı web kaynağı `web/privacy.html:25-31` verilerin yalnız uygulama işlevselliği/kişiselleştirme için kullanıldığını söylüyor. Kod ekran gezinmesini, kalış süresini, bounce ve kullanıcı akışını ürün ölçümü için topluyor. `store/privacy-labels.md:103-110` Product Interaction için yalnız “App Functionality” amacı yazıyor.
- **Etkisi:** Gerçek davranış ile App Store Privacy Labels, Google Play Data Safety ve gizlilik politikası arasında açıklama farkı oluşabilir.
- **Öneri:** Hukuki incelemeyle “uygulamanın kullanımını anlamak, performansı ve kullanıcı deneyimini geliştirmek” amacını açıkça ekleyin; Product Interaction için Analytics amacının seçilip seçilmeyeceğini gerçek veri akışına göre yeniden değerlendirin. Reklam/tracking yapılmadığını ayrıca koruyun.

### Bazı ekranların ürün akışı metadatası eksik

- **Durum:** DOĞRULANDI
- **Ciddiyet:** DÜŞÜK
- **Kanıt:** 110 ekran sabitinin 105'i `ROUTE_CONFIGS` içinde metadata alıyor. `PUBLISHER_COMPARISON_DETAIL` ile askıdaki dört ödeme ekranı eşleşmiyor.
- **Etkisi:** Bu ekranlarda `screen.view` yine gönderilir; ancak `flow`, `isTab` ve `deepLink` alanları boş/false olur. Askıdaki ödeme ekranları V1 için önemli değildir.
- **Öneri:** Yalnız canlı `PUBLISHER_COMPARISON_DETAIL` ekranını doğru ürün akışına ekleyin; askıdaki ekranları V1 ölçüm planına dahil etmeyin.

## Sağlam çıkanlar

- Ekran görüntüleme ve kalış süresi merkezi navigasyon katmanından otomatik ölçülüyor; her ekrana tek tek kod eklenmesine bağlı değil.
- Background/inactive geçişi aktif ekran süresini kapatıyor; uygulama arka plandayken süre işlemiyor.
- Olay özelliklerinde yapılan çağrı taramasında e-posta, ad veya serbest kullanıcı metninin analytics props'una açıkça gönderildiği bir örnek bulunmadı. Net, ders, ekran ve nesne kimliği gibi ürün verileri var.
- Analytics hataları kullanıcı akışını çökertmiyor.
- Genel olaylar bağlantı yokken tamponlanıyor; retention olayları ayrıca retry ve `client_event_id` idempotency mantığına sahip.
- Kullanıcı yalnız kendi analytics/retention satırlarını okuyup yazacak şekilde yerel RLS migration'ları hazırlanmış.
- Analytics ve retention tabloları kullanıcı hesabına FK ile bağlı tasarlanmış; hesap silinince cascade hedeflenmiş.
- Kullanıcının veri dışa aktarma kataloğunda analytics ve retention satırları yer alıyor (`src/supabase/dataExport.js:48,64`).
- İlgili odaklı testler **14/14** geçti; `npm run check` başarılı oldu.

## Bu denetimde doğrulanamayanlar

- Canlı Supabase'de `analytics_events` ve `retention_events` tablolarının gerçekten bulunması, son olay zamanı, satır sayısı, RLS/grant ve indekslerin canlı hali. Anon/publishable anahtarla şema okunamadı; admin/service erişimi olmadan kesin hüküm verilmedi.
- Production binary'nin gerçekten olay göndermesi. Bunun için test kullanıcıyla ekran değiştirip SQL Editor'da olayın görünmesi gereken bir smoke test gerekir.
- Sentry production DSN ve performans izleme akışı; bu ayrı bir hata/diagnostic sistemidir.

## Önerilen uygulama sırası

1. **Canlı tablo doğrulaması:** iki tablo, RLS, grant, indeks ve son olay zamanı.
2. **Tek gerçek cihaz smoke testi:** giriş yap, üç ekran gez, bir çalışma kaydet, uygulamayı background'a al; olayların Supabase'e düştüğünü doğrula.
3. **Ölçüm sözlüğü:** V1 için az ama karar verilebilir olay setini belirle.
4. **Kaydedilmiş Supabase raporları:** ekran kullanımı, süre/bounce, DAU ve ana funnel.
5. **Gizlilik uyumu:** privacy labels/data safety/web privacy metnini gerçek olaylarla eşleştir.
6. **D1/D7/D30 ve funnel:** ham SQL view veya düşük hacimde Supabase raporu; kullanıcı hacmi büyüdüğünde PostHog/Amplitude değerlendirmesi.

## Nihai değerlendirme

Maraton'da “hangi sayfaya kaç kez girildi, ne kadar kalındı ve sonra nereye gidildi” verisini toplamak için ciddi bir temel **var**. Şu an eksik olan şey veri toplama fikri değil; canlı veri doğrulaması, güvenilir event kapsamı ve senin her hafta açıp bakabileceğin raporlama katmanı. Dolayısıyla sistemin durumu **yok değil, yarı tamamlanmış** olarak değerlendirilmelidir.
