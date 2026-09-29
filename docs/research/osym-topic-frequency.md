# ÖSYM konu sıklığı araştırması (TYT / AYT)

Tarih: 2026-09-30 · Veri: `osym-topic-frequency.json` (aynı klasör)

## Yöntem

- ÖSYM konu bazında resmî dağılım yayımlamaz. Bu yüzden veriler rehberlik ve yayınevi sitelerinin yıl yıl verdiği konu tablolarından alındı.
- Tablolar ham HTML ve PDF'ten script ile ayrıştırıldı. LLM özeti kullanılmadı, çünkü WebFetch özeti bir tabloda sütunları kaydırmıştı.
- Kapsam 2018-2026 (9 sınav). universitego'da 2026 yok, 2018-2025 var.
- Tablodaki `–` değeri `0` olarak yazıldı. `avg`, listelenen yılların düz ortalamasıdır.
- Bir kaynak satırı birden çok uygulama konusunu kapsıyorsa konu `null` bırakıldı ve satır `buckets` içine yazıldı. Hiçbir sayı uydurma yolla bölünmedi.
- İki kaynak satırı aynı uygulama konusuna düşüyorsa toplandı. Bu durum `note` alanında yazıyor.
- 2020 (pandemi) ve 2023 (deprem, [MEB kararı](https://www.meb.gov.tr/2023-lgsde-8-sinifin-yksde-12-sinifin-ikinci-donem-konulari-sinav-kapsamina-dahil-olmayacak/haber/29003/tr)) sınavlarında 12. sınıf 2. dönem konuları kapsam dışıydı. Limit, türev, integral, çemberin analitiği, modern fizik ve organik kimya bu yüzden o yıllarda 0 ya da düşük. Bu konular için `avgExcl2020_2023` alanı ayrıca verildi.
- Konu sınırları kaynaktan kaynağa değişiyor. Tekil yıllık değerlerde ±1 soru belirsizlik var.
- Konu adları, `src/data/curriculum.js` dosyasının şu anki hâliyle birebir eşleşiyor. İki fark var:
  - `Problemler (İşçi)`
  - `Diziler`
- AYT Matematik'te Konikler, Matrisler, Determinant ve Özel Tanımlı Fonksiyonlar dosyada artık yok. Bu başlıklar `notInCurriculum` altına yazıldı, veri yok.

## Kaynaklar

| Kısa ad | URL | Not |
|---|---|---|
| unirehberi (TYT) | https://www.unirehberi.com/tyt-konulari-ve-soru-dagilimi/ | 2011-2026. TYT'de birincil kaynak |
| unirehberi (TYT Mat) | https://www.unirehberi.com/tyt-matematik-konulari/ | |
| unirehberi (TYT Tür) | https://www.unirehberi.com/tyt-turkce-konulari/ | |
| unirehberi (AYT) | https://www.unirehberi.com/ayt-konulari-ve-soru-dagilimi/ | AYT'de birincil kaynak |
| unirehberi (AYT Mat) | https://www.unirehberi.com/ayt-matematik-konulari-yks/ | |
| Maçka AİHL (MEB) PDF | https://mackaihl.meb.k12.tr/.../28134012_YKS-2024-TYT-KONU-SORU-ISTATISTIKLERI.pdf | 2011-2023. unirehberi ile birebir aynı, yani aynı veri ailesinden |
| universitego | https://www.universitego.com/tyt-ayt-konu-soru-dagilimlari/ | 2018-2025. MEB kazanımlarına göre ayrı bir sınıflama. TYT Türkçe'de birincil kaynak |
| Ömer Nasuhi Bilmen AİHL PDF | omernasuhibilmenaihl.meb.k12.tr/... | universitego ile aynı, bağımsız kaynak değil |
| bilgenc (TYT/AYT Mat) | https://www.bilgenc.com/tyt-matematik-konulari/ · https://www.bilgenc.com/ayt-matematik-konulari/ | Bağımsız üçüncü sınıflama |
| dogrutercihler | https://dogrutercihler.com/2024-ayt-matematik-konulari-ve-soru-dagilimi/ | unirehberi ile aynı veri |
| krakademi | reddedildi | 2020 ve 2023 dahil her yıl sabit "4 türev / 3 integral" veriyor. Gerçek sınavla çelişiyor |

## Ders bazında kapsam ve güven

| Ders (key) | Veri olan konu | Güven | Açıklama |
|---|---|---|---|
| matematik (TYT) | 24/36 | **Yüksek**: aritmetik, cebir ve Problemler toplamı. **Orta**: küçük konular ve geometri kırılımı | Problemler her yıl 10-15 soru, ortalama 12.0. Üç kaynakta da 10-13 aralığında (2026'da 15). Problem alt türlerinin (yaş, hız, işçi…) yıllık kırılımı hiçbir kaynakta yok, 8 alt konu `null`. Açılar ve Üçgenler bucket'ı ortalama 3.67. Ondalık Sayılar `null`. Unmapped başlıklar: Mantık (2021'den beri 1-2), Polinomlar, Deltoid, Analitik Geometri |
| turkce (TYT) | 10/17 | **Orta-yüksek** | Paragrafta Anlam ortalama 20.5, Paragraf (Yapı) 4.4, Sözcükte Anlam 3.6, Cümlede Anlam 3.1, Yazım 2, Noktalama 2. Söz Yorumu, Deyim, Cümle Yorumu ve Ana/Yardımcı Düşünce ayrı sayılmıyor, bu yüzden bucket içinde. Dil bilgisi sınıflaması iki kaynak arasında tutarsız |
| ayt_matematik | 12/21 | **Yüksek**: ana başlıklar, 3 kaynak uyumlu. **Düşük**: alt kırılım | Trigonometri ortalama 4.3, Türev 2.7 (normal yıllarda 3.4), İntegral 3.0 (normal yıllarda 3.9), Logaritma 2.1, Fonksiyonlar 2.0. Türev ve integral alt türleri kaynaklarda yok. Unmapped: Permütasyon-Kombinasyon-Olasılık-Binom her yıl 2-3 soru ama uygulamanın AYT listesinde yok. Geometri kısmı da unmapped (Çember ve Daire ortalama 2) |
| fizik (TYT) | 10/10 | **Yüksek** | unirehberi, MEB PDF ve universitego tutarlı. Elektrik ve Manyetizma satırının tamamı Elektrik Akımı'na ait, Manyetizma 0 (universitego ile doğrulandı). Unmapped: Hareket ve Kuvvet (her yıl 1), İş-Güç-Enerji |
| kimya (TYT) | 6/7 | **Orta-yüksek** | Doğa ve Kimya `null`. "Kimyasal Tepkimeler" için Temel Kanunlar ve Hesaplamalar toplandı, yaklaşık bir eşleme. unirehberi'nin 2025 sütunu 6 soruya toplanıyor, yani 1 soru eksik. Unmapped: Asit-Baz-Tuz ve Karışımlar, ikisi de 2019'dan beri her yıl 1 |
| biyoloji (TYT) | 8/8 | **Orta-yüksek** | Mitoz ve Mayoz ayrımı universitego'dan (2018-2025). Toplamı diğer kaynakla birebir tutuyor. Unmapped: Canlıların Temel Bileşenleri |
| ayt_fizik | 12/14 | **Orta** | Tek ana kaynak. İndüksiyon ve Alternatif Akım bucket'ı ortalama 1.56. Unmapped: Dönme ve Açısal Momentum, Kütle Çekim ve Kepler, Basit Makineler |
| ayt_kimya | 9/13 | **Orta** | Organik Kimya bucket'ı ortalama 2.9. Elektrokimya 2.11. Mol Kavramı `null` (TYT konusu). Unmapped: Modern Atom Teorisi |
| ayt_biyoloji | 13/18 | **Orta** | Enzimler, Madde Geçişi ve Genetik Mühendisliği `null`. Fotosentez ve Kemosentez tek bucket |
| ayt_edebiyat | 8/15 | **Orta** | Divan ortalama 4.4, Cumhuriyet 3.0. Metin türleri sınıflaması kaynaklar arasında çok farklı, düşük güven. Unmapped: Anlam Bilgisi (çoğu yıl 6 soru), Edebi Sanatlar |
| tarih (TYT) | 8/9 | **Düşük-orta** | Kaynağın ünite adları uygulamanınkinden farklı, eşleme yaklaşık. universitego tamamen farklı sınıflıyor |
| cografya (TYT) | 5/10 | **Düşük-orta** | İklim her yıl 1. Doğal Afetler çoğu yıl 1 soru ama uygulamada TYT konusu olarak yok, unmapped |
| felsefe (TYT) | 5/5 | **Düşük** | Kaynaklar disipline göre ya da felsefe tarihine göre sınıflıyor. Sayılar bu tercihe çok duyarlı |
| din (TYT) | 5/6 | **Düşük-orta** | Yaşayan Dinler `null`. Kur'an ve Yorumu için 'Vahiy ve Akıl' kullanıldı, yaklaşık bir eşleme |

Takma adlar: `ayt_ea_matematik` ile `ayt_matematik` aynı testtir. `ayt_edebiyat_soz` ile `ayt_edebiyat` da aynı testtir. JSON'da bu bilgi `aliases` alanında.
