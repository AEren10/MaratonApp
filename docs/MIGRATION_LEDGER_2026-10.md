# Migration defteri eşleme notu — Ekim 2026

Amaç: `supabase db push` komutunun canlıda zaten uygulanmış migration'ları tekrar çalıştırmaya kalkmaması için yerel migration dosya adlarını canlı ledger sürümleriyle hizalamak.

Bu dosya canlı veritabanına DDL uygulamaz. Canlıya uygulanması gereken işler ayrıca listelenir.

## Kaynaklar

- `docs/CIKMADAN_ONCE_V1.md` B1 tablosu.
- Kullanıcı notu: Claude'un 1 Ekim'de canlıya uyguladığı iki migration:
  - `20261001090000_clde_topic_progress_graded_questions`
  - `20260929233704_suspend_legacy_community_ugc_v1`
- Bu çalışma sırasında canlı Supabase ledger doğrudan okunamadı; `SUPABASE_ACCESS_TOKEN` ortam değişkeni yoktu. Supabase CLI `AccessTokenRequiredError` verdi. Bu yüzden aşağıdaki eşleme, repo içi B1 kaydı ve kullanıcı tarafından bildirilen canlı migration sürümlerine dayanır.

## Yerel dosya adı canlı ledger ile eşleşenler

| Migration | Canlı sürüm | Yerel dosya |
|---|---:|---|
| `clde_my_groups_user_rank` | `20260920010941` | `supabase/migrations/20260920010941_clde_my_groups_user_rank.sql` |
| `clde_grant_net_column_writes` | `20260921161331` | `supabase/migrations/20260921161331_clde_grant_net_column_writes.sql` |
| `clde_private_export_and_fk_indexes` | `20260922214738` | `supabase/migrations/20260922214738_clde_private_export_and_fk_indexes.sql` |
| `clde_plan_tasks_unique_per_plan` | `20260923005505` | `supabase/migrations/20260923005505_clde_plan_tasks_unique_per_plan.sql` |
| `clde_drop_stale_create_group_overload` | `20260924005001` | `supabase/migrations/20260924005001_clde_drop_stale_create_group_overload.sql` |
| `suspend_legacy_community_ugc_v1` | `20260929233704` | `supabase/migrations/20260929233704_suspend_legacy_community_ugc_v1.sql` |
| `clde_topic_progress_graded_questions` | `20261001090000` | `supabase/migrations/20261001090000_clde_topic_progress_graded_questions.sql` |

## Yerelde olup canlıda uygulanmadığı not edilenler

| Yerel dosya | Durum | Not |
|---|---|---|
| `supabase/migrations/20260924011618_clde_group_code_builtin_random.sql` | Uygulanmadı olarak takip edilmeli | B1 notunda `20260920050000_fix_generate_group_code_builtin_random` ledger'da yok deniyordu. Dosya main'de canlı ledger adıyla değil, son yerel adla duruyor. Canlı ledger token ile tekrar kontrol edilmeden uygulanmamalı. |
| `supabase/migrations_archived_not_in_live_ledger/20260911142337_cdx_data_integrity_fixes.sql` | Arşiv / canlıya uygulanmadı | B1 notuna göre içindeki rota bloğu bilerek yorum satırına alındı; canlıdaki sürüm daha yeni. `supabase/migrations/` klasörüne geri taşınmamalı. |

## Canlı ledger tekrar doğrulama komutu

Token olan ortamda sadece okuma/doğrulama için:

```bash
SUPABASE_ACCESS_TOKEN=... npx supabase migration list --project-ref zrycqfehhyjrsujmajpf
```

Beklenti:

- Yukarıdaki eşleşen sürümler `Remote` tarafında görünür.
- `supabase db push --dry-run` veya `supabase migration list` çıktısı, canlıda uygulanmış migration'ları yeniden çalıştırılacak gibi göstermemelidir.
- Bu çalışma canlı DDL uygulamadı.
