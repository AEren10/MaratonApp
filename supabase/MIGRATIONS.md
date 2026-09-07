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
