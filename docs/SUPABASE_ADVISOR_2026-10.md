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

## Advisor çıktı tablosu

Canlı advisor çıktısı alınınca her satır buraya eklenecek. SQL önerileri uygulanmamış taslak olarak kalmalıdır; canlıya uygulanacaksa ayrıca review + backup gerekir.

| Ciddiyet | Kaynak | Ne | Etki | Önerilen düzeltme SQL'i | Uygulandı mı? |
|---|---|---|---|---|---|
| _Bekliyor_ | Security Advisor | Canlı çıktı gerekli | Bilinmiyor | _Canlı advisor çıktısı olmadan uydurulmadı_ | Hayır |
| _Bekliyor_ | Performance Advisor | Canlı çıktı gerekli | Bilinmiyor | _Canlı advisor çıktısı olmadan uydurulmadı_ | Hayır |

## Notlar

- Bu dosya “çıktı yoksa uyarı yoktur” anlamına gelmez.
- Advisor uyarıları canlı şema, indeks istatistikleri ve extension durumuna bağlıdır; repo dosyalarından güvenilir şekilde uydurulamaz.
- Özellikle RLS, SECURITY DEFINER search_path, eksik indeks, duplicate index ve unused index uyarıları canlı metriklerle tekrar kontrol edilmelidir.
