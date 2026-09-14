# CDX çalışma notları

## 2026-09-11 — rota/export/challenge/premium/push sertleştirme

- Rota persist işlemi `persist_route_revision` RPC hattında toparlandı; `route_weeks` yazımı ayrı client upsert olarak kalmamalı. İleride rota yazımı eklenirse aynı transaction sınırı korunmalı.
- Plan task kayıt ve toggle işlemleri kullanıcı sahipliğiyle ilerliyor. Yeni plan task akışlarında `user_id` taşınmazsa offline replay ve RLS sessizce bozulabilir.
- Challenge progress artık `sync_challenge_progress` RPC ile server-resolved ve idempotent. Çalışma/deneme kaydı gibi kaynaklardan challenge'a katkı yazılırken `source` + `sourceOperationId` verilmesi kritik.
- KVKK/GDPR export kapsamına route lifecycle, product entitlement/usage ve route companionship verileri eklendi. Yeni user-scoped tablo eklenirse export kataloğu veya private export RPC de güncellenmeli.
- RevenueCat key'leri build env'den okunuyor. Production'da package yüklenmezse dev trial fallback'i açılmamalı.
- `send-push` Edge Function repo tarafında sertleştirildi; canlıya yansıması için ayrıca function deploy gerekir.
- Yeni Supabase migration dosyaları canlı DB'ye uygulanmadan uygulama tarafındaki bazı güvenlik/entegrasyon fix'leri tam etkili olmaz.

### Kalan dikkat noktaları

- Canlı Supabase baseline/migration zinciri için proje sahibi erişimiyle `supabase db push` / migration history kontrolü yapılmalı.
- Edge Function deploy'u local commit değildir; `send-push` için deploy pipeline adımı ayrıca çalışmalı.
- `design/Mobile app design.zip` dirty görünüyor; CDX kapsamında dokunulmadı.

## 2026-09-11 — RPC search_path ve hedef net sync hijyeni

- CDX'in etkilediği `SECURITY DEFINER` RPC yüzeylerinde `search_path` boş değere kilitlenmeli; yeni RPC eklenirse migration içinde `SET search_path = ''` veya `ALTER FUNCTION ... SET search_path = ''` unutulmamalı.
- `targetNetSyncPending` ve `baselineNetSyncPending` bayrakları sadece yazılmamalı, profil yüklenirken tekrar denenmeli. Aksi halde kullanıcı hedef/baslangıç netini kaydettiğini sanır ama değer yalnız cihazda kalır.
- Bekleyen yerel net değişikliği sunucudaki eski değerden daha yeni kabul edilir. Bayrak varsa yerel değer kazanmalı; bayrak yoksa sunucu değeri kazanmalı.

## 2026-09-11 — avatar upload veri kaybı sırası

- Avatar upload akışında eski uzantıdaki dosyalar yeni upload başarıyla tamamlandıktan sonra silinmeli. Önce silme yapılırsa ağ/Storage hatasında kullanıcının çalışan eski avatarı kaybolabilir.

## 2026-09-12 — Supabase runtime kolon seçimi

- Runtime okumalarda `select("*")` yerine ihtiyaç duyulan kolon listesi kullanılmalı. KVKK export gibi bilinçli “tüm veriyi indir” akışları bunun istisnası.
- Rota durakları ve route state için kolon listesi geniş ama açık tutuldu; yeni UI/logic alanı bu satırlara ihtiyaç duyarsa önce listeye bilinçli eklenmeli.

## 2026-09-12 — hesap silme storage cleanup sırası

- Hesap silme öncesi Storage temizliği kısmen başarısızsa auth hesabı silinmemeli. Auth satırı gittikten sonra istemci kalan public/private dosyaları kendi yetkisiyle temizleyemeyebilir.
- Storage cleanup hataları kullanıcıya güvenli mesajla gösterilmeli; sessizce “hesap silindi ama bazı dosyalar kaldı” durumuna düşmemeli.

## 2026-09-12 — Storage RLS policy hijyeni

- Storage mutating policy'leri `TO authenticated` ile açıkça sınırlandırılmalı.
- `UPDATE` policy mutlaka hem `USING` hem `WITH CHECK` içermeli; aksi halde kullanıcı satırı okuyabildiği halde yeni değerin sahiplik şartı yeterince ifade edilmemiş olur.

## 2026-09-12 — KVKK export büyük veri dayanıklılığı

- `user_id` taşımayan ilişki tabloları export edilirken tek büyük `.in(...)` çağrısı kullanılmamalı; ID listesi chunk'lanmalı ve her chunk ayrıca sayfalanmalı.
- Export kodu "az kayıtla çalışıyor" diye tamam sayılmamalı; çok deneme/çok detay kaydı olan gerçek kullanıcı senaryosu testle korunmalı.

## 2026-09-12 — Challenge idempotency fallback kuralı

- `sourceOperationId` taşıyan challenge progress olayları replay-sensitive kabul edilmeli. İdempotent RPC yoksa eski client fallback'e düşmek yerine fail-closed davranmalı; aksi halde offline replay aynı çalışmayı/denemeyi tekrar sayabilir.
- Legacy `bump_challenge_progress` fallback'i sadece operasyon kimliği olmayan eski çağrılar için güvenli kabul edilmeli.

## 2026-09-12 — Rota hafta snapshot sınav tipi scope'u

- `route_weeks` hem okuma hem yazma tarafında sınav tipine göre ayrılmalı. `exam_type` kolonu olup conflict target hâlâ `(user_id, week_start)` kalırsa aynı haftadaki YKS/LGS rotaları birbirini ezebilir.
- Rota revizyonları, durakları ve hafta özetleri aynı scope kuralıyla ilerlemeli; sınav tipi değişimi yalnız pause/resume değil persisted haftalar için de veri bütünlüğü meselesi.

## 2026-09-12 — XP fallback toplamları

- Sunucu RPC yokken kullanılan XP fallback'i “geçici” olsa bile satır limitiyle toplam üretmemeli. Kullanıcı çok aktifse 5000 kayıt üstü toplamlar eksik görünür.
- Fallback kodlarında yorum ile gerçek kontrol koşulu birlikte denetlenmeli; “sayfaladık” deyip döngüyü üst sınırla kesmek sessiz veri eksiltir.
- Haftalık toplam da tek select olmamalı; PostgREST row limit haftalık XP'yi de kesebilir.
- Offset pagination kullanılan export okumasında stabil `order(...)` yoksa aynı export içinde sayfa atlama/tekrar riski doğar.

## 2026-09-12 — Rota pause/resume sınav tipi scope'u

- `route_state` tek `user_id` satırı olarak kalırsa bir sınav tipindeki pause/resume işlemi başka sınav tipinin durumunu ezebilir. Yeni yazımlar `(user_id, exam_type)` scope'uyla yapılmalı.
- Legacy `exam_type IS NULL` state okunabilir kalmalı; aksi halde eski canlı kullanıcıların dondurulmuş/geri dönüş bilgisi bir anda görünmez olur.
- `(user_id, exam_type)` unique index yazım scope'u için yeterli olsa da tablo PK'siz bırakılmamalı; PostgREST/tooling/replication gibi yüzeyler için ayrı surrogate `id` primary key daha güvenli.

## 2026-09-12 — Eski rota haftası temizliği

- Sınav tipi değişiminde `neq("exam_type", current)` tek başına `NULL` exam_type'lı legacy haftaları yakalamaz; Postgres'te `NULL != value` true değildir. Temizlik current exam'i korurken `exam_type IS NULL` kayıtları da kapsamalı.

## 2026-09-12 — Rota durak lifecycle carryover scope'u

- `route_stops` exam_type'ı doğrudan taşımıyor; kapsam `route_revisions` üzerinden geliyor. Terminal durumlar yeni revizyona taşınırken `logical_key` tek başına yeterli görülmemeli, aynı sınav tipindeki revision'lardan taşınmalı.

## 2026-09-12 — Offline çalışma kaydı ve rota durağı

- Çalışma kaydı offline kuyruğa alınırken ona bağlı rota durağı lifecycle RPC'si de kuyruklanmalı. Aksi halde log daha sonra sync olsa bile rota durağı açık kalır ve günlük rota/borç sinyali kullanıcıyı yanlış yönlendirir.
- Route transition kuyruğu yalnızca tekrar denenebilir hatalar için kullanılmalı; version conflict, invalid transition ve stop not found gibi kalıcı domain hataları kuyruğa girerse sonradan sync edilemeyecek gürültü üretir.
- Plan/home/topic-debt gibi doğrudan route stop transition yapan UI yolları da aynı offline-safe helper'ı kullanmalı; yalnızca study-save yolunu korumak tutarsızlık bırakır.

## 2026-09-13 — Runtime route stop kolon uyumu

- `route_stops` runtime select listesi migration'da gerçekten var olan kolonlarla aynı kalmalı. Lock/freeze/effective durumları tablo kolonu değil, lifecycle + route state/access overlay'inden türetilen sunum bilgisidir.
- `select("*")` yerine açık kolon listesi kullanırken schema dışı bir kolon eklemek de wildcard kadar riskli: canlı Supabase `column does not exist` ile tüm rota okumasını düşürür.
- `route_state` için de aynı kural geçerli: pause/resume okuması yalnız migration'daki kalıcı kolonları seçmeli. Sunum nedeni/overlay gibi alanlar tabloya eklenmeden select listesine girmemeli.

## 2026-09-13 — Route lifecycle sonrası yerel görünüm

- `transition_route_stop` yalnızca dokunulan durağı değil, bazı geçişlerde sıradaki durağı da otomatik `active` yapar. Client yalnız dönen eski durağı patch'lerse ekrandaki aktif durak bayatlar.
- Başarılı route stop geçişinden sonra latest stops yeniden çekilmeli; queued/offline durumda ise yerel optimistic patch yapılmamalı, sync sonrası sunucu otoritesi kazanmalı.

## 2026-09-13 — KVKK analytics export erişimi

- Export kataloğuna tablo eklemek tek başına yetmez; RLS/GRANT o tablonun kullanıcıya kendi satırlarını okuma hakkı verip vermediğiyle birlikte kontrol edilmeli.
- `analytics_events` normal uygulama kullanımında insert-only kalabilir, ama “verilerimi indir” akışı için dar `SELECT own rows` policy'si gerekir. Aksi halde export eksik/incomplete döner.

## 2026-09-13 — KVKK export sayfalama sırası

- Offset/range pagination kullanılan export sorgularında stabil `order` zorunlu. Sırasız sayfalama büyük kullanıcı datasında aynı export içinde satır atlayabilir veya tekrar edebilir.
- Generic export helper'ı her tabloya kör `id` sırası vermemeli; `topic_notes` ve `group_members` gibi composite-key tablolarda tabloya özel sıralama kullanılmalı.

## 2026-09-13 — Paywall baskısı ve sınav hassasiyeti

- Paywall gösterme kararı tek domain kapısından geçmeli; otomatik tetikleyici ile manuel `showPaywall` farklı davranırsa kullanıcı yanlış anda satış baskısı görebilir.
- İlk hafta, sınav arifesi, sınav günü ve sınav sonrası kısa dönem “satış yok” kuralı retention için de önemli. Bu dönemlerde güven kazanmak, kısa vadeli premium denemesinden daha değerli.
- Bastırılan paywall olayları analytics/retention tarafına `PAYWALL_SUPPRESSED` olarak yazılmalı; böylece ileride dönüşüm hunisi incelenirken “gösterilmedi” ile “gösterildi ama almadı” karışmaz.

## 2026-09-13 — Retention karar anahtarı

- Retention hook'u yalnız `userId` ile “işlendi” sayılmamalı; local/cache veri geldikten sonra Supabase’ten taze `lastActive` veya `loginRewardedDate` gelirse karar tekrar değerlendirilmelidir.
- Aksi durumda comeback gösterimi veya günlük giriş ödülü sessizce kaçabilir. Kullanıcıyı geri kazanma mantığında stale veriyle tek sefer karar vermek risklidir.
- Günlük giriş ödülünde sunucuya “ödüllendi” işareti, yerel ödül verildikten sonra atılmalı. Tersi sırada app kapanması veya taze profil yüklenmesi kullanıcıya ödül düşmeden günü kapatabilir.
- Comeback gösterimi ve günlük giriş ödülü aynı `processed` anahtarına bağlanmamalı. Profil snapshot'ı değişince karar tekrar çalışabilir; comeback event'i kullanıcı/gün/son aktif tarih bazında ayrıca tekilleştirilmelidir.

## 2026-09-13 — Retention event dayanıklılığı

- Comeback, nudge ve paywall retention olayları yalnız canlı Supabase insert'e bağlı kalmamalı. Bağlantı hatasında event düşerse kullanıcı kazanma/premium hunisi eksik ölçülür.
- Retention olayları küçük, kullanıcı scope'lu local buffer'a alınmalı ve sonraki event geldiğinde önce buffer flush edilmelidir.
- `client_event_id` duplicate hatası replay başarısı gibi ele alınmalı; aksi halde belirsiz ağ denemesinde Supabase'e yazılmış event buffer'da takılı kalır ve arkadaki event'leri geciktirir.
- Aynı duplicate kuralı canlı insert için de geçerli: istemci aynı `client_event_id` ile tekrar denerse buffer'a almak yerine “zaten yazılmış” kabul edilmeli.

## 2026-09-13 — Offline deneme ve challenge replay

- Deneme sonucu offline kuyruğa alındıysa challenge progress anında ayrıca tetiklenmemeli; offlineQueue replay sırasında aynı `clientOperationId` ile server-resolved sync yapar.
- Queued durumda hem anlık sync hem replay denenirse idempotency çoğu hasarı önler ama gereksiz ağ/Promise hatası ve ölçüm gürültüsü üretir. Anlık sync yalnız canlı kayıt başarıyla kaydedildiğinde çalışmalı.

## 2026-09-13 — Manuel çalışma kaydı persist hatası

- `saveStudyLogOffline` artık kuyruk yazımı başarısızsa hata fırlatıyor; tüm çalışma kaydı ekranları bunu yakalamalı. Aksi halde kullanıcı formda loading state'te kalabilir ve çalışmanın saklanıp saklanmadığını anlayamaz.
- Challenge sync gibi arka plan yan etkileri kayıt akışını düşürmemeli; canlı kayıt başarılıysa denenmeli ama Promise hatası yakalanmalıdır. Offline queued kayıtlar replay sırasında yan etkilerini tekrar üretir.

## 2026-09-13 — Route transition operation id şekli

- `transition_route_stop` RPC tarafında `client_operation_id` UUID bekliyor. Route stop transition için fallback operation id de `Crypto.randomUUID()` üretmeli; string prefix'li offline id'ler RPC'ye ulaşınca `22P02` ile düşer.
- Çalışma/rota UI çağrıları şu an kendi UUID'sini geçse bile helper fallback'i schema ile uyumlu kalmalı. İleride yeni bir çağrı `clientOperationId` vermeyi unutursa offline replay sessizce bozulmamalı.

## 2026-09-13 — Retention buffer flush zamanı

- Retention event buffer yalnız yeni event kaydedilirken boşaltılmamalı. Kullanıcı app'i yeniden açtığında veya ağ geri geldiğinde data sync hattı da buffer'ı Supabase'e göndermeli.
- Premium/retention hunisinde gecikmiş event veri kaybı kadar tehlikeli olabilir: kullanıcı davranışı ölçümü bayat kalırsa paywall/nudge kararları yanlış optimize edilir.

## 2026-09-13 — Study log aralık okuma sayfalaması

- Tarih aralığıyla okunan çalışma kayıtları PostgREST row limit'ine bırakılmamalı. Year activity, wrapped ve haftalık rapor gibi istatistikler yoğun kullanıcıda 1000+ satırı eksik okuyabilir.
- Limitsiz geçmiş liste ekranı ayrı tutulmalı; mobil performans için son 500 kayıt davranışı korunabilir, ama tarih-scope'lu analitik/rapor okumaları sayfalanmalıdır.

## 2026-09-13 — Challenge ücretsiz slot hesabı

- Ücretsiz challenge kotası yalnız `active` kayıtları değil, kullanıcının gönderdiği `pending` davetleri de saymalı. Aksi halde kullanıcı çok sayıda bekleyen davet açarak premium sınırını aşabilir.
- Challenge oluşturma sonrası local kullanım snapshot'ı hemen artmalı; server refresh beklenirse aynı oturumda ikinci oluşturma butonu yanlışlıkla açık kalabilir.
- Nihai adım daha sonra `cdx_create_challenge_rpc` ile kapandı: challenge oluşturma server-authoritative RPC'ye taşındı ve doğrudan `challenges` INSERT yetkisi kaldırıldı.

## 2026-09-13 — Offline temp görev silme

- `temp_` id'li user task henüz Supabase satırı değildir; silinirken server delete çağırmak yerine offline queue'daki `usertask_<tempId>` insert kaydı çıkarılmalı.
- Aksi halde UUID olmayan temp id Supabase delete yolunda hata üretir, UI rollback yapar ve kullanıcı çevrimdışı eklediği görevi silemez.

## 2026-09-13 — Offline takvim görevi queue kimliği

- Takvim görevi offline oluşturulunca local task, offline queue operation id'sini taşımalı; Supabase remote id dönene kadar bu id tek kaynak olur.
- Kullanıcı sync öncesi görevi tamamlarsa queued insert payload'ı güncellenmeli. Aksi halde bağlantı gelince görev eski `completed` değeriyle oluşur.
- Kullanıcı sync öncesi görevi silerse queued insert kuyruktan kaldırılmalı. Aksi halde kullanıcı sildiğini sanarken bağlantı gelince takvim görevi geri doğar.
- Queue replay sonrası takvim refresh'i `client_operation_id` ile pending local satırı remote satıra yükseltmeli; yalnız `remoteId` eşleşmesi aranırsa aynı görev ikinci kez listelenir.
- Calendar task cache'i kullanıcıya göre ayrışmalı ve kullanıcı değişince sync guard resetlenmeli. Global AsyncStorage anahtarı, A kullanıcısının takvim notunu B kullanıcısına gösterebilir.

## 2026-09-13 — Gamification cache kullanıcı izolasyonu

- `USER_SCOPED_KEYS` listesine bir anahtar eklemek tek başına yeterli değil; okuma/yazma tarafı da `userScopedKey` kullanmalı.
- XP, haftalık XP, istatistikler ve streak milestone claim listesi global cache'te kalırsa çıkış-giriş sonrası kullanıcılar arası ilerleme/ödül izi karışabilir.
- Streak milestone ödülleri premium gün verebildiği için local claim izi kullanıcıya bağlı kalmalı; aksi halde bir kullanıcının claim durumu diğerinin premium ödül akışını bastırabilir.

## 2026-09-13 — Goals cache kullanıcı izolasyonu

- Günlük soru hedefi rota kapasitesinin girdisi olduğu için local fallback global kalmamalı. Kullanıcı değişiminde eski kullanıcının hedefi yeni kullanıcının günlük planını/rota temposunu bozabilir.
- `ReduxHydrator`, onboarding, hedef düzenleme, senaryo uygulama ve `useDataSync` fallback yolu aynı user-scoped storage anahtarını kullanmalı; aksi halde sunucu geç gelince ekranda yanlış hedefle kısa süreli karar üretilebilir.

## 2026-09-13 — Exam config kullanıcı izolasyonu

- Sınav tipi, alan, sınav tarihi, hedef net ve baseline net rota motorunun ana girdileridir; local fallback global kalırsa farklı kullanıcının sınav rotası/kapasitesi yeni kullanıcıya sızabilir.
- DB load guard boolean değil kullanıcı kimliği bazlı olmalı. A kullanıcısı yüklendikten sonra B oturumu gelirse boolean guard B profilini tamamen atlayabilir.
- Bekleyen hedef/baseline net sync bayrakları da user-scoped config içinde kalmalı; aksi halde bir kullanıcının offline hedef değişikliği başka kullanıcı profilini backfill etmeye çalışabilir.

## 2026-09-13 — Bildirim tercihi ve çalışma saati izolasyonu

- Notification prefs, notification context ve çalışma saati histogramı aktif kullanıcıya göre saklanmalı. A'nın bildirim kapatma kararı veya çalışma saati B'nin retention bildirimlerini etkilememeli.
- `applyNotifPrefs` bağlam verilmediğinde son context'i okuyor; bu context global kalırsa B kullanıcısına A'nın streak/studiedToday durumuyla bildirim kurulabilir.
- Optimal saat kişiselleştirmesi kullanıcı bazlı olmalı. Retention bildirimi doğru kişiye yanlış saatte giderse bildirim kapatma ve churn riski artar.
- `NOTIF_CONTEXT` de logout/delete temizliğine dahil olmalı; yeni kullanıcı okumasa bile eski kullanıcının streak/studiedToday bağlamı cihazda gereksiz kalmamalı.

## 2026-09-13 — Pending deep link tüketimi

- Davet/friend/group deep link'i login öncesi global bekler; tüketim guard'ı uygulama ömrüne değil aktif kullanıcı kimliğine bağlı olmalı.
- `useDeepLink` içinde tek boolean kullanılırsa aynı app oturumunda çıkış-yeni giriş sonrası pending kod tüketilmez. Bu, referral büyüme döngüsünü ve grup/arkadaş kabul akışını sessizce kaçırır.
- Referral kodu navigasyon sırasında silinmemeli; ReferralScreen başarılı uygulama sonrası temizlemeli. Aksi halde ekran açılmadan kod kaybolabilir.

## 2026-09-13 — Challenge premium kapısı fail-closed

- Ücretsiz challenge hakkı, aktif challenge sayısı okunamadığında açık sayılmamalı. JS'te `null < limit` true döndüğü için count hatası premium limit bypass'ına dönüşebilir.
- Kullanıcı değişiminde premium usage snapshot'ı temizlenmeli; eski kullanıcının aktif challenge sayısı yeni kullanıcının monetization kararını etkilememeli.
- Sunucu yine nihai otorite olmalı, ama istemci kapısı da ağ/snapshot belirsizliğinde güvenli tarafa düşmeli.

## 2026-09-13 — Paywall access snapshot bekleme

- `showPaywall` premium access snapshot hazır olmadan açılmamalı. Aksi halde cold-start'ta gerçek premium kullanıcı `isPremium=false` varsayımıyla paywall görebilir.
- Feature check fail-closed kaldığında manuel paywall da aynı prensibi izlemeli: access `loading/error` iken yanlış satış ekranı göstermek yerine bastırılmalı ve suppression event'i yazılmalı.
- Monetization güveni için “fazla paywall” da bypass kadar riskli; premium kullanıcıya yanlış kapı göstermek iptal/churn tetikleyebilir.

## 2026-09-14 — Challenge oluşturma premium gate tazeliği

- Challenge oluşturma callback'i `checkFeature`, `showPaywall` ve `bumpUsage` bağımlılıklarını taşımalı. Premium snapshot loading→ready geçince eski closure ücretsiz/premium kararını bayat bırakabilir.
- Bu maddede işaretlenen nihai açık `cdx_create_challenge_rpc` ile kapandı: `create_challenge` RPC arkadaşlık ve free active+pending quota kontrolünü server tarafına aldı, direct `public.challenges` INSERT yetkisi kaldırıldı.

## 2026-09-14 — Challenge reddetme status uyumu

- `respond_to_challenge(false)` tablo constraint'inde olmayan `declined` değerini yazmamalı. `challenges.status` izinli değerleri `pending/active/completed/cancelled`; aksi halde reddetme butonu Supabase CHECK constraint hatasıyla düşer.
- Friendship tablosundaki `declined` ayrı bir model; challenge UI ve geçmiş filtreleri `cancelled` durumuyla zaten uyumlu.

## 2026-09-14 — Challenge auth geçişi dayanıklılığı

- Sosyal/challenge ekranlarında auth state kısa süre boş olabilir; dependency array'de `user.id` kullanmak render anında crash üretir.
- İptal ve yanıt callback'leri `user?.id` ile guard'lanmalı. Bu, logout/token refresh gibi geçişlerde kullanıcıyı sosyal ekranda beyaz ekrana düşürmez.

## 2026-09-14 — Challenge arkadaşlık guard'ı

- Challenge oluşturma viral/retention döngüsünü güçlendirebilir, ama accepted arkadaşlık şartı olmadan keyfi UUID'ye challenge atmak spam/taciz yüzeyi açar.
- Client artık insert öncesi iki yönlü friendship satırını okuyup yalnız `accepted` durumunda devam eder; `blocked`, `pending`, `declined` veya satır yoksa challenge oluşturmaz.
- Bu ara katman sonrasında server-authoritative `create_challenge` RPC ile kalıcı hale getirildi; doğrudan `challenges` INSERT yetkisi artık yok.

## 2026-09-14 — Sosyal ekran auth geçişleri

- Arkadaşlık ve challenge ekranları büyüme/retention yüzeyi olduğu için logout/token refresh sırasında beyaz ekrana düşmemeli.
- `PENDING_STREAK` ve `ANALYTICS_BUFFER` UI cache değil, dayanıklı retry/tampon verisi gibi davranmalı.
- `onAuthError -> logout -> clearUserScopedStorage` zinciri bu anahtarları silerse çevrimdışı seri dokunuşu ve push/paywall/login funnel olayları kalıcı kaybolur.
- Bu tamponlar içeride `userId` taşıdığı ve okuma sırasında aktif kullanıcıya filtrelendiği için offline queue ile aynı sınıfta korunmalı; kullanıcıya görünen cache'ler ayrı temizlenmeli.
- Callback dependency array'lerinde `user.id` kullanımı render anında patlar; auth geçişine dayanıklı yerlerde `user?.id` + erken dönüş guard'ı kullanılmalı.
- Yanlış defteri tekrar ekranları da retention yüzeyi: kullanıcı hızlı pratikteyken token refresh/logout arası kısa boşluk, tekrar algoritmasını değil ekranı düşürmemeli.

## 2026-09-13 — Challenge create server otoritesi

- Remote Supabase doğrulamasında `public.challenges` üzerinde `authenticated` role için `INSERT` ve `DELETE` grant'i canlıda açıktı; insert policy yalnız `creator_id = auth.uid()` kontrol ediyordu.
- Bu, normal client kapısı iyi olsa bile kötü niyetli istemcinin accepted friendship ve ücretsiz kota kontrolünü bypass etmesine izin verirdi.
- `public.create_challenge` RPC canlıya uygulandı ve client bu RPC'ye taşındı; accepted friendship, pending+active quota ve premium/grace kontrolü artık server tarafında.
- Migration sonrası canlı grant doğrulamasında `public.challenges` için `authenticated` yalnız `SELECT` kaldı.

## 2026-09-14 — Challenge RPC search_path kilidi

- `create_challenge` gibi `SECURITY DEFINER` RPC'ler schema-qualified yazılmalı ve `search_path = ''` ile kilitlenmeli; aksi halde ileride aynı isimli obje/function shadowing riskleri doğar.
- Challenge create RPC repo migration'ı boş search_path hedefiyle hizalandı ve canlıya `ALTER FUNCTION ... SET search_path = ''` patch'i uygulandı.

## 2026-09-14 — Canlı Supabase migration drift kapatma

- Canlı `schema_migrations` listesi repo ile birebir değil; baseline işi hâlâ gerekli. Ancak read-only canlı sorgular gerçek eksikleri ayırdı.
- Gerçek eksikler kapatıldı: idempotent challenge progress RPC/tablosu, route week exam scope yazımı, route state exam scope + primary key, analytics export policy ve CDX RPC search_path kilitleri.
- Bundan sonra rota/challenge/retention tarafında “local test geçiyor” tek başına yeterli değil; canlı registry + canlı schema kontrolü birlikte yapılmalı.

## 2026-09-14 — Çalışma kaydı edit/delete ve topic_progress

- Çalışma kaydı artık kullanıcı tarafından düzenlenip silinebiliyor; `topic_progress` yalnız INSERT ile artarsa rota/konu ustalığı/retention sinyali eski katkıları taşımaya devam eder.
- `study_logs` trigger'ı INSERT/UPDATE/DELETE için delta-safe kalmalı: UPDATE eski katkıyı düşüp yeni katkıyı eklemeli, DELETE eski katkıyı düşmeli.
- Eski katkı düşerken sayaçlar negatife inmemeli ve `last_studied_at` kalan çalışma kayıtlarına göre yeniden hesaplanmalı. Aksi halde “uzun süredir çalışılmadı” sinyali ve rota önceliği bayatlar.

## 2026-09-14 — Premium kilitleri merkezi paywall gate

- Yeni kilitli premium yüzeyler doğrudan `navigation.navigate(SCREENS.PAYWALL)` çağırmamalı; `usePremium().showPaywall(source)` üzerinden geçmeli.
- İlk hafta, sınav arifesi/günü/sonrası ve access snapshot belirsizliği gibi suppression kuralları tek merkezde uygulanmalı. Direkt navigate hem kullanıcı güvenini bozar hem `PAYWALL_SUPPRESSED` ölçümünü kaçırır.
- Aylık Özet kilidi `monthly_report` source'u ile merkezi gate'e bağlandı; benzer kilitler aynı paterni izlemeli.
- Oturum eşiği gibi otomatik paywall tetikleyicileri de aynı merkezi gate'i kullanmalı. `PAYWALL_SHOWN_SESSION` yalnız gate gerçekten paywall açarsa yazılmalı; bastırılmış denemeyi “gösterildi” saymak ileride doğru zamanda açılmasını engeller.
- Pro Önizleme gibi ara satış ekranları da ödeme ekranına doğrudan replace/navigate yapmamalı; CTA sadece merkezi gate'e source ile talep bırakmalı.

## 2026-09-14 — 114/170 akış read-only kontrol notu

- Otomatik kapılar temiz geçti: test, TypeScript, runtime/undefined/design drift ve diff whitespace kontrolü yeşil. Bu kapılar “anlık bariz kırık yok” der; cihaz üstü tüm akış kalitesini kanıtlamaz.
- 114/170 akış listesi şu an dışarıdan gelen metin gibi duruyor. Repo içinde her akışın route/screen/test/manual QA karşılığını takip eden makine-okunur bir kapsam matrisi yoksa ileride “ekran var ama state yok” veya “tasarım var ama deeplink yok” gibi drift sessiz kalabilir.
- Screen/route tarafında `SCREENS` sabitleri kullanılıyor; string route araması temiz. Sınav günü planı artık route, registry ve notification deeplink tarafında kayıtlı görünüyor.
- Paywall girişleri merkezi gate'e toparlandı; yeni premium yüzeyler bu kuralı bozarsa sınav hassasiyeti, ilk hafta suppression ve analytics ölçümü dağılır.
- Supabase baseline/migration drift hâlâ ürünleşme riski. Canlı kritik parçalar ayrı doğrulansa bile temiz staging/reset güveni için proje sahibi erişimiyle baseline işi kapatılmalı.
- Unit/domain test kapsamı güçlendi ama onboarding, offline kayıt, bildirim deeplink, comeback/completion modal sırası, RevenueCat/paywall ve sınav günü gibi uçtan uca akışlar için cihaz/simülatör walkthrough şart.
- Mobil audit script'inin ham sonucu bundle/cache dosyalarından gürültü üretti; yine de küçük ikon/checkbox/mini aksiyonlarda gerçek dokunma alanı manuel QA ile kontrol edilmeli. Eski proje kaynaklı 150 satır dosya sınırı bu turda öncelik kabul edilmedi.

## 2026-09-14 — Bildirim deep link fail-closed kuralı

- `appUrl` paylaşım linkleri için toleranslı kalabilir, ama scheduled notification URL'leri bilinmeyen veya deep-link kapalı ekranda sessizce Home'a düşmemeli.
- Bildirimler `notificationUrl` gibi fail-closed bir kapıdan geçmeli; yeni bildirim ekranı eklenirse önce `ROUTE_CONFIGS` içinde deep link olarak kayıtlı olduğu testle görünmeli.
- Özellikle sınav arifesi, deneme provası, haftalık özet ve görev hatırlatmaları retention yüzeyi olduğu için yanlış deeplink kullanıcı güvenini ve geri dönüş oranını doğrudan bozar.

## 2026-09-14 — Sosyal paylaşım link parametreleri

- Grup ve arkadaş davet linklerinde `appUrl` param adı, route path içindeki param adıyla birebir aynı olmalı. `group/:groupCode?` yoluna `{ code }` verilirse link içinde `:groupCode?` kalır ve davet/referral akışı sessizce kırılır.
- Referral/growth yüzeylerinde link metninde kod yazıyor olsa bile deep link bozuksa kullanıcı ekleme/katılma adımı manuel koda düşer; bu da paylaşım dönüşümünü azaltır.
- Referral hunisi üç olayla okunmalı: link paylaşıldı, link açıldı/pending yakalandı, kod başarıyla uygulandı. Paylaşım event'i eksik kalırsa viral döngüde sorun link üretiminde mi, açılışta mı, uygulamada mı ayrıştırılamaz.
- Kod başarıyla uygulanınca da conversion event'i atılmalı. Sadece pending deeplink yakalandığında event yazmak, gerçek ödül/premium kazanımıyla karışır.

## 2026-09-14 — Paywall purchase funnel source tutarlılığı

- Paywall görüntüleme, dismissal, trial start, purchase ve restore olayları aynı `source` değerini taşımalı. Aksi halde dönüşüm oranı hangi kilitten geldiğini kaybeder.
- Başarılı restore conversion gibi kapanmalı; `convertedRef` set edilmezse ekran kapanırken `PREMIUM_DISMISSED` de yazılır ve restore eden kullanıcı hem dönüştü hem terk etti gibi görünür.
