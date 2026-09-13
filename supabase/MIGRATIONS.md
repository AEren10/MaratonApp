# Migration zincirinin durumu (2026-09-08)

## Sorun

Dosya adları iki farklı sistemde:

- `002_curriculum.sql` … `045_scale_indexes_and_xp_rpc.sql`
- `20260610_initial_schema.sql` … `20260908150000_*.sql`

Alfabetik sıralamada `002…045` serisi `20260610_initial_schema.sql`'den ÖNCE
geliyor. Temiz bir veritabanında:

    003_fix_wrong_questions_and_avatars.sql
      -> ALTER TABLE public.wrong_questions
      -> ama wrong_questions 46. sırada gelen initial_schema'da kuruluyor
      -> ERROR: relation "public.wrong_questions" does not exist

Yani `supabase db reset` ya da yeni bir staging ortamı ŞU AN KURULAMAZ.

## Daha ciddi olan

Canlı veritabanında `supabase_migrations.schema_migrations` yalnızca 5 kayıt
tutuyor ve bunların versiyonları repo'daki dosya adlarıyla eşleşmiyor bile:

    canlı:  20260901135835, 20260901140141, 20260901220342,
            20260901220937, 20260902000454
    repo:   20260901135730, 20260901135956, 20260901215950,
            20260901220745, 20260902000117

Migration dosyalarının çoğu Management API / SQL Editor üzerinden kayıt
dışı uygulanmış (bazı dosyaların kendi yorumları da tabloların elle
oluşturulduğunu söylüyor). Dolayısıyla zincir bir kayıt değil, belge.

Sonuç: dosyaları yeniden ADLANDIRMAK sıralamayı düzeltir ama kurulumun
çalıştığını KANITLAMAZ. Test edilmemiş bir güvence olur.

## Çözüm: canlıdan baseline

Tek doğru yol, canlı şemayı tek bir baseline'a dökmek ve geçmişi arşive almak.

Bunu proje sahibinin çalıştırması gerekiyor (veritabanı parolası gerekli,
sohbete girmemeli). Supabase Dashboard > Project Settings > Database >
Connection string (URI) alınıp:

    npx supabase db dump --db-url "<URI>" -f supabase/migrations/00000000000000_baseline.sql

Şema için bu yeterli. Ardından:

1. `002_*.sql` … `20260907100000_*.sql` dosyaları `_archive/` altına taşınır
   (silinmez — hangi kararın neden alındığı orada).
2. `00000000000000_baseline.sql` tek başlangıç noktası olur.
3. Bundan sonraki her değişiklik normal timestamp'li migration olarak yazılır
   VE `supabase db push` ile uygulanır ki schema_migrations gerçeği yansıtsın.
4. Doğrulama: Docker kurulu bir makinede `npx supabase db reset` temiz
   geçmeli. Bu adım yapılmadan "kurulum çalışıyor" DENMEMELİ.

## Bugün canlıya uygulanan ve arşive girMEYECEK olanlar

Bu dörtü baseline'dan sonra da migration olarak kalmalı, çünkü güvenlik
düzeltmeleri ve baseline alınırken zaten canlıda olacaklar:

- 20260908120000_profiles_column_level_select.sql
- 20260908130000_server_authoritative_streak.sql
- 20260908140000_harden_challenges_groups_xp.sql
- 20260908150000_fix_challenge_rpcs.sql

(Baseline bunları zaten içereceği için arşive alınabilirler; karar baseline
alındıktan sonra verilir.)

---

## Güncelleme (2026-09-09)

İki yeni migration'da iki sorun vardı ve düzeltildi:

1. `20260908120000` versiyonu iki dosyada birden kullanılıyordu
   (`profiles_column_level_select` ve `route_stop_lifecycle`). CLI versiyonu
   dosya adı önekinden okuduğu için ikisi tek migration sayılacaktı.
2. Yeni dosyalar canlıda uygulanmış olanlardan daha eski bir versiyona
   sahipti, dolayısıyla sıraya doğru yerden girmiyorlardı.

Yeni adlar:

    20260909100000_product_access_companionship.sql
    20260909110000_route_stop_lifecycle.sql

Her ikisi de canlıya uygulandı ve doğrulandı: 7 tablo, 17 fonksiyon girdisi,
`public.trials` üzerinde 6 yeni kolon.

`schema_migrations` artık 5 değil 12 kayıt tutuyor. Canlıda olduğu halde
kayıtsız duran 8 Eylül migration'ları da kayda geçirildi:

    20260908120000  profiles_column_level_select
    20260908130000  server_authoritative_streak
    20260908140000  harden_challenges_groups_xp
    20260908150000  fix_challenge_rpcs
    20260908160000  answer_count_trigger
    20260909100000  product_access_companionship
    20260909110000  route_stop_lifecycle
    20260913215823  cdx_create_challenge_rpc

Bu, kaydı gerçeğe yaklaştırır ama baseline ihtiyacını ORTADAN KALDIRMAZ:
`002_*` … `20260907100000_*` serisi hâlâ kayıtsız ve alfabetik sıralaması
bozuk. `supabase db reset` hâlâ çalışmaz. Yukarıdaki baseline adımı
proje sahibi tarafından yapılmalı.

### Açık kalan güvenlik maddesi

Auth advisor `auth_leaked_password_protection` uyarısı veriyor: Supabase
Auth'un HaveIBeenPwned kontrolü kapalı. Dashboard > Authentication >
Policies üzerinden açılabilir. Karar ürün sahibinin: açılırsa ihlal
listesindeki parolalarla kayıt/parola değişimi reddedilir.

### Güncelleme (2026-09-13)

`cdx_create_challenge_rpc` canlıya Supabase migration aracıyla uygulandı:

- `public.create_challenge` / `private.create_challenge` eklendi.
- Challenge oluşturma server tarafında accepted friendship, pending+active free quota ve premium/grace durumuna göre karar veriyor.
- `public.challenges` için authenticated `INSERT` ve `DELETE` grant'leri kaldırıldı.
- Eski `"Users create challenges"` insert policy'si düşürüldü.

### Güncelleme (2026-09-14)

Canlı registry ile repo dosyaları karşılaştırıldı. Bazı 10–12 Eylül dosyaları
canlı şemada uygulanmış olsa da `schema_migrations` içinde görünmüyordu; bu
baseline ihtiyacını devam ettiriyor. CDX'in canlıda gerçekten eksik çıkan
kritik parçaları Supabase migration aracıyla tamamlandı:

- `cdx_challenge_progress_idempotency`: `challenge_progress_events` tablosu ve
  `public.sync_challenge_progress` RPC eklendi; offline study/trial replay artık
  challenge progress'i idempotent sayabiliyor.
- `cdx_scope_route_weeks_and_carryover`: `persist_route_revision` canlıda
  yeniden hizalandı; `route_weeks` yazımı geri geldi, conflict target
  `(user_id, exam_type, week_start)` oldu ve route stop carryover aynı sınav
  tipine scope'landı.
- `cdx_scope_route_state_by_exam`: `route_state` için `(user_id, exam_type)`
  unique index ve surrogate primary key eklendi.
- `cdx_allow_analytics_export`: `analytics_events` için dar own-row SELECT
  policy'si eklendi; KVKK/GDPR export retention/paywall olaylarını okuyabilir.
- `cdx_lock_function_search_path`: CDX-owned kritik RPC'ler canlıda
  `search_path = ''` ile kilitlendi.

Doğrulandı: `challenge_progress_events`, `sync_challenge_progress`,
`route_weeks` exam index'i, route week yazan/scoped `persist_route_revision`,
`route_state` primary key + exam index ve `analytics select own` policy'si
canlıda mevcut. `create_challenge`, `sync_challenge_progress`,
`persist_route_revision`, `private.has_feature_access` ve
`private.get_product_access_snapshot` fonksiyonlarında `search_path=""`.
