# App Store Connect — yapıştırılacak son metinler (11 Ekim 2026)

Dayanak: `store/aso-2026-10.md` (8 Ekim rakip ve kelime çalışması) + 11 Ekim kontrolü.
O dosyadan farklar: uygulama LGS'yi destekliyor (kodda `lgs_*` dersleri var), bu yüzden
"lgs" ada girdi; destek adresi `destekmaraton@gmail.com` oldu.
Karakter sayıları node ile doğrulandı.

## Türkçe (tr) — birincil

| Alan | Metin | Sayım |
|---|---|---|
| Ad | `Maraton: YKS LGS Deneme Takibi` | 30 / 30 |
| Alt başlık | `TYT AYT ders çalışma programı` | 29 / 30 |
| Anahtar kelimeler | `net,hesaplama,sıralama,puan,sayaç,pomodoro,yanlış,defteri,konu,sınav,soru,analiz,2027,plan` | 95 / 100 bayt |
| Promosyon metni | `Her sabah rotan hazır. YKS ve LGS için günlük çalışma planı, deneme takibi, net grafiği ve yanlış defteri tek yerde.` | 116 / 170 |

Neden bu ad: Apple'da arama yalnız ad + alt başlık + anahtar kelime alanına bakar, açıklamaya bakmaz.
"deneme takip" bu kategorinin en net arama niyeti; "yks" ve "lgs" iki ayrı kitleyi getirir.
Ad + alt başlık + kelimeler birleşince şu aramalar oluşur: yks deneme takip · lgs deneme takip ·
tyt net hesaplama · ayt net hesaplama · yks sıralama hesaplama · yks çalışma planı · ders çalışma
programı · yanlış defteri · yks sayaç · yks pomodoro · konu takip · yks 2027.

Play'deki ad (`Maraton: YKS LGS Çalışma Planı`) farklı kalabilir: Play açıklamayı da indeksliyor,
"deneme takip" orada açıklamada geçiyor.

## English (U.K.) — Türkiye mağazasında ikinci 100 baytlık alan

| Alan | Metin | Sayım |
|---|---|---|
| Ad | `Maraton: YKS LGS Hazırlık` | 25 / 30 |
| Alt başlık | `Müfredat takibi ve geri sayım` | 29 / 30 |
| Anahtar kelimeler | `tyt,ayt,net,widget,kronometre,odak,tekrar,hedef,lise,grafik,siralama,sayac,yanlis,defteri,plan` | 94 / 100 bayt |

Açıklama ve promosyon metni için `store/aso-2026-10.md` bölüm 4'teki İngilizce metin kullanılır
(destek adresi `destekmaraton@gmail.com` olarak değiştirilecek).

## Açıklama (tr)

`store/aso-2026-10.md` bölüm 3'teki açıklama, şu üç değişiklikle:
1. İlk cümle: `YKS ve LGS hazırlığı uzun bir yol.`
2. "KONU TAKİBİ" altı: `• TYT, AYT ve LGS müfredatını konu konu işaretle.`
3. Son satırlar: `Soru ve öneriler: destekmaraton@gmail.com`

## Diğer alanlar

- Kategori: Eğitim (birincil), Verimlilik (ikincil).
- Destek URL: https://maratonapp.com/support · Gizlilik: https://maratonapp.com/privacy
- Telif: `2026 Ahmet Eren Şiranlı`
- Yaş derecelendirmesi: kullanıcı içeriği (ad, avatar, grup adı) var → anket "kullanıcı tarafından
  oluşturulan içerik: evet" işaretlenir.
- İnceleme notu: `store/appreview.md` bölüm 9; demo hesap `demo@gmail.com` (şifre notlara elle yazılır).
  Göndermeden hemen önce `scripts/seed-review-account.sql` çalıştırılır.

## Görseller

- Ekran görüntüleri: `store/visuals/frames/out/ios63/` (1206×2622). App Store Connect'in varsayılan yuvası artık 6.1"/6.3"; 1320×2868 orada reddediliyor. Yüklenen sıra: 01, 02, 03, 04, 07, 05, 06.
- Önizleme videosu: `store/visuals/video/out/maraton-tanitim-886x1920.mp4`
  (`node store/visuals/video/build.mjs` ile yeniden üretilir). Ses izi yok.
  Apple önizlemede uygulama içi görüntü ister; bu video demo ekranların canlandırması.
  Önizleme reddedilirse uygulama incelemesi videosuz devam eder; istenirse aynı kurgu
  gerçek ekran kaydıyla yeniden yapılır.

## Sonraki tur için görsel önerisi (elde ekran görüntüsü yok)

Kelime çalışmasına göre en boş alan "yanlış defteri", en merak edilen "tahmini sıralama".
İkisi de şu an karelerde yok. Bu iki ekranın gerçek görüntüsü gelince 7. ve 8. kare olarak eklenir;
sıralama karesi 3. sıraya alınır (arama sonucunda ilk üç kare görünür).

## App Store Connect durumu (11 Ekim 2026)

"…Deneme Takip" adı Apple'da kullanımda çıktı; "…Deneme Takibi" kabul edildi.

Girildi ve kaydedildi: ana dil Türkçe, ad, alt başlık, kategori (Eğitim + Verimlilik), promosyon metni,
açıklama, anahtar kelimeler, destek/pazarlama URL'si, telif, 7 ekran görüntüsü, yaş derecelendirmesi (13+),
fiyat (ücretsiz), kullanılabilirlik (yalnız Türkiye), gizlilik politikası URL'si, 10 gizlilik etiketi,
inceleme notu (İngilizce), demo kullanıcı adı, build 14, "elle yayınla".

Kaldı (hesap sahibinin yapması gerekenler):
1. App Privacy → **Publish** (doğruluk beyanı).
2. App Information → **Content Rights** (üçüncü taraf içerik beyanı).
3. Sürüm sayfası → demo hesabın **şifresi** ve iletişim bilgisi (ad, telefon, e-posta).
4. İnceleme notunda "Deleting the account also revokes the Sign in with Apple token" cümlesi var:
   `APPLE_TEAM_ID` / `APPLE_KEY_ID` / `APPLE_PRIVATE_KEY` sırları girilmeden gönderilirse bu cümle silinmeli.
5. `scripts/seed-review-account.sql` çalıştırılacak.
6. **Add for Review**.

İsteğe bağlı: English (U.K.) yerelleştirmesi (ikinci anahtar kelime alanı), önizleme videosu.
