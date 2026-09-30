# Supabase advisor notu — Ekim 2026

Durum tarihi: 2026-10-01

Bu dosya Security Advisor ve Performance Advisor çıktısını takip etmek için oluşturuldu. Bu çalışma sırasında canlı Supabase projesine advisor sorgusu atılamadı; yerel ortamda global Supabase CLI yoktu ve `npx supabase` şu hatayla durdu:

```text
AccessTokenRequiredError: Access token not provided.
```

Canlı veritabanına DDL uygulanmadı.

## Çalıştırılacak okuma komutları

Token olan ortamda:

```bash
SUPABASE_ACCESS_TOKEN=... npx supabase db lint --project-ref zrycqfehhyjrsujmajpf --level warning
SUPABASE_ACCESS_TOKEN=... npx supabase db lint --project-ref zrycqfehhyjrsujmajpf --level warning --linked
```

Dashboard yolu:

- Supabase Dashboard → Project `zrycqfehhyjrsujmajpf`
- Database → Advisors
- Security Advisor ve Performance Advisor sonuçlarını dışa aktar / kopyala

## Bilinen karar

| Ciddiyet | Ne | Durum | Önerilen düzeltme SQL'i |
|---|---|---|---|
| Warning | Leaked password protection kapalı | Bilinen ürün/operasyon kararı olarak geçildi. Yayın öncesi tekrar değerlendirilmeli. | SQL yok; Supabase Auth ayarıdır. Dashboard → Authentication → Security üzerinden açılır. |

## Advisor çıktı tablosu (canlı, Supabase MCP get_advisors, 1 Ekim 2026 — Claude)

**Sonuç: çıkışı engelleyen uyarı yok.** ERROR seviyesinde bulgu yok.

| Ciddiyet | Kaynak | Ne | Karar |
|---|---|---|---|
| WARN x6 | Security | `authenticated` rolünün çağırabildiği SECURITY DEFINER: `create_trial`, `increment_study_session`, `persist_route_revision`, `sync_challenge_progress`, `transfer_group_admin`, `transition_route_stop` | Bilerek. Altısı da canlıda `auth.uid()` ile çağıranı kontrol ediyor; search_path kilitli (`""` ya da `public, pg_temp`). Uygulamanın kendi RPC'leri. |
| INFO x2 | Security | `feature_usage_events`, `user_entitlements`: RLS açık, politika yok | Bilerek: istemci doğrudan okumuyor, dar RPC üzerinden. |
| WARN | Security | Leaked password protection kapalı | Bilinen karar (Pro plan özelliği). |
| INFO x37 | Performance | Kullanılmayan indeks | Düşük trafik; kullanıcı gelmeden kullanım istatistiği anlamsız. Silinmez, yayından ~1 ay sonra tekrar bakılır. |

Hesap silme FK engelleri 1 Ekim'de düzeltildi (`20260930125121_clde_account_delete_fk_cascade`); sonrasında `auth.users` / `profiles` / `wrong_questions`'a NO ACTION FK kalmadı.
