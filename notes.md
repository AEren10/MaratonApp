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
