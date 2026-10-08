# Onboarding Migration Canli Uygulama Kaydi

Tarih: 2026-10-08

Proje: Maraton production Supabase (`zrycqfehhyjrsujmajpf`)

Migration:

- Surum: `20261006120000`
- Dosya: `supabase/migrations/20261006120000_cdx_onboarding_completion_authority.sql`
- Ad: `cdx_onboarding_completion_authority`

## Uygulama

Migration, Supabase SQL Editor uzerinden tek transaction icinde uygulandi.
Herhangi bir adim hata verseydi transaction tamamen geri alinacakti.

Canlida eski parametresiz `complete_onboarding()` fonksiyonunun bulunmadigi
uygulama oncesinde dogrulandi. Migration surumu
`supabase_migrations.schema_migrations` defterine kaydedildi; sonraki
`supabase db push` bu surumu yeniden calistirmaya kalkmamalidir.

## Dogrulama Sonuclari

- `profiles.onboarding_completed_at` kolonu: mevcut
- `public.complete_onboarding(uuid)` RPC: mevcut
- `anon` calistirma yetkisi: kapali
- `authenticated` calistirma yetkisi: acik
- Migration defteri `20261006120000` kaydi: mevcut
- Toplam profil: 16
- Geriye donuk tamamlandi olarak isaretlenen profil: 11
- Backfill kosulunu saglayip bos kalan profil: 0

Kalan 5 profil, migration backfill kosullarindan hicbirini saglamadigi icin
tamamlanmamis olarak birakildi. Bu kullanicilar yeni sunucu-otoriteli kurulum
akisindan devam edecektir.

## Guvenlik Notu

RPC, yalnizca oturumdaki `auth.uid()` ile `p_user` ayni oldugunda calisir.
Fonksiyon `SECURITY DEFINER` kullanir ve `search_path` bos olarak sabitlenmistir.
Anonim rol fonksiyonu calistiramaz.
