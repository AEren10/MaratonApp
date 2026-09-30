# Migration defteri eşleme notu — Ekim 2026

Amaç: `supabase db push` canlıda zaten uygulanmış migration'ları tekrar çalıştırmaya kalkmasın.

**Kaynak:** Canlı defter, Supabase MCP `list_migrations` ile 1 Ekim 2026'da okundu (Claude). Codex'in ilk taslağı token olmadığı için repo notlarına dayanıyordu; bu sürüm onun yerine geçer.

## Durum: HİZALI
`supabase/migrations/` altındaki her dosyanın numarası canlı defterdeki sürümle birebir aynı. Canlıda olup yerelde dosyası olmayan migration yok.

## 1 Ekim'de yapılan düzeltmeler (commit 9389cae)
MCP `apply_migration` ile uygulanan migration'lar canlıya **uygulama anının** zaman damgasıyla kaydolur, dosya adındaki numarayla değil. Yedi dosya canlı numarasına yeniden adlandırıldı:

| Migration | Eski yerel ad | Canlı sürüm |
|---|---|---|
| `clde_premium_suspended_open_feature_access` | 20260928120000 | `20260928003640` |
| `clde_route_feel_and_habits` | 20260930120000 | `20260929214410` |
| `clde_route_prefs_stop_moves` | 20260930140000 | `20260929223644` |
| `clde_route_prefs_known_topics` | 20260930160000 | `20260929233625` |
| `clde_topic_progress_graded_questions` | 20261001090000 | `20260930113652` |
| `suspend_legacy_community_ugc_v1` | 20260929233704 | `20260930115421` |
| `clde_account_delete_fk_cascade` | 20261001120000 | `20260930125121` |

## Canlıda olmayan, arşive alınan
- `20260926100000_clde_open_route_feature_access.sql` canlıda yok. Aynı işi (premium askıdayken rota erişimi açık) canlıdaki `clde_premium_suspended_open_feature_access` yapıyor. `supabase/migrations_archived_not_in_live_ledger/` altına taşındı.
- `20260911142337_cdx_data_integrity_fixes.sql` zaten arşivde; geri taşınmamalı.

## Düzeltilen yanlış bilgi
İlk taslakta `clde_group_code_builtin_random` "uygulanmadı" deniyordu. Yanlış: canlıda `20260924011618` olarak var ve dosya adı da aynı.

## Kural (bundan sonra)
MCP ile canlıya migration uygulayan, hemen ardından `list_migrations` ile canlı sürümü okuyup yerel dosyayı o numarayla adlandırır.
