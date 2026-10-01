# Maraton ürün analitiği: verilere nereden bakılır?

Maraton'ın ürün analitiği kendi Supabase projesinde tutulur. Bu aşamada mobil uygulamaya yönetici ekranı eklenmemiştir; kullanıcılar yalnız kendi ham olaylarını görebilir, kullanıcılar arası toplu raporları ise yalnız proje sahibi SQL Editor'dan çalıştırır.

## Açılacak yer

1. [Supabase Dashboard](https://supabase.com/dashboard) adresine yönetici hesabınla gir.
2. `zrycqfehhyjrsujmajpf` kimlikli Maraton projesini seç.
3. Sol menüden **SQL Editor** bölümünü aç.
4. **New query** seçeneğine bas.
5. `supabase/reports/product_analytics.sql` dosyasından istediğin numaralı sorguyu yapıştırıp **Run** düğmesine bas.
6. Sık kullandığın sorguyu anlamlı bir adla kaydet. Örneğin `Maraton — ekran kullanımı — 30 gün`.

SQL dosyasının tamamını tek seferde çalıştırmak mümkündür; ancak sonuç ekranında yalnız son sorgunun sonucu öne çıkacağından günlük kullanımda bir numaralı bölümü tek başına çalıştırmak daha pratiktir.

## Hangi sorgu neyi gösterir?

| No | Rapor | Cevapladığı soru |
|---:|---|---|
| 01 | Pipeline health | Olay geliyor mu, son olay ne zaman geldi, eski formatta kaç kayıt var? |
| 02 | Günlük hacim | Günlük kaç olay/kullanıcı var, yeni formatta tekrar kayıt oluşmuş mu? |
| 03 | Ekran kullanımı | En çok ve en az hangi ekranlara giriliyor? |
| 04 | Süre ve bounce | Ekranda ortanca kalış süresi ve çok kısa ziyaret oranı nedir? |
| 05 | Ekran yolları | Kullanıcılar bir ekrandan sonra en çok nereye gidiyor? |
| 06 | DAU/WAU/MAU | Son 1, 7 ve 30 günde kaç farklı kullanıcı aktifti? |
| 07 | Aktivasyon hunisi | Kayıt → onboarding → rota → çalışma zincirinde kayıp nerede? |
| 08 | D1/D7/D30 | İlk anlamlı çalışmadan 1, 7 ve 30 gün sonra kaç kişi geri geldi? |
| 09 | Aktif çalışma günleri | Aktif öğrenci bir haftada ortalama kaç farklı gün çalışıyor? |
| 10 | Bildirim dönüşümü | Bildirimi açan kişi 24 saat içinde anlamlı çalışma yaptı mı? |
| 11 | Seri trendi | Devam eden ve bozulan seri olayları zaman içinde nasıl değişiyor? |

## Güvenlik sınırı

- `analytics_events` ve `retention_events` tablolarında RLS açıktır.
- Mobil `authenticated` rolü yalnız kendi satırlarını okuyabilir ve ekleyebilir; güncelleme/silme yetkisi yoktur.
- Toplu sorgular başka kullanıcıların davranışlarını bir araya getirdiği için uygulamaya, public view'a veya sıradan authenticated RPC'ye taşınmamalıdır.
- Daha sonra görsel yönetici paneli yapılırsa, yönetici e-postasını mobil kodda kontrol etmek yeterli değildir. Yetki sunucu tarafında doğrulanan bir admin claim/rol ve yalnız toplu sonuç döndüren özel backend katmanıyla kurulmalıdır.
- Rapor sonucunda görülen kullanıcı UUID'lerini dışarı aktarma; ürün kararı için toplu sayıları kullan.

## Yayın öncesi doğrulama

Migration canlıya uygulandıktan ve test uygulamasında birkaç ekran gezildikten sonra:

1. Önce 01 numaralı sorguda `last_event_at` değerinin güncel olduğunu kontrol et.
2. 02 numaralı sorguda `duplicate_new_format_events` değerinin `0` olduğunu doğrula.
3. 03 ve 04 numaralı sorgularda ekranların ve sürelerin görünmesini bekle.
4. Olay adları henüz uygulama sürümünde bağlı değilse ilgili huni satırı doğal olarak boş kalabilir; boş sonucu veri uydurarak doldurma.

Bu dosyalar veri tabanına kendiliğinden sorgu çalıştırmaz. Migration'ın canlıya uygulanması ve raporların SQL Editor'da sahibi tarafından çalıştırılması gerekir.
