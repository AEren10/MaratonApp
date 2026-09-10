> **ARSIV — ESKI TASARIM DONEMI. TALIMAT OLARAK OKUNMAZ.**
> Bu belge tasarimciya gonderilmis tarihsel bir brief. Icindeki renk, font ve
> bilesen kurallari (mor #8b5cf6, Inter, Space Grotesk, glassmorphism) ARTIK
> GECERSIZ. Guncel tasarim sistemi: `AGENTS.md` > Styling Rules ve
> `design/extracted2/tokens.md`.

# Maraton — Uygulamanın Tamamı: Tasarım Brief'i

## BU BELGE NEDİR

Rota yönü onaylandı. Ana Sayfa, Rota Detay, Analiz, Profil, Seviye ve boş durum tasarlandı ve kabul edildi. **Bu belge, aynı tasarım dilini uygulamanın kalan tüm ekranlarına yayma işidir.**

Uygulamada toplam **59 ekran**, **5 sekme** ve **14 akış grubu** var. Onaylanan tasarım sistemi (Rota, renk, tipografi, buton, boşluk, hareket) **değişmeyecek** — her yeni ekran bu sisteme uyacak.

> **Teslim notu:** 59 ekranı tek seferde çizme. Aşağıdaki grup sırasına göre parça parça ilerle; her grup bittiğinde dur. Sıra: **1) Onboarding & Auth → 2) Dersler & Konu → 3) Çalışma akışı → 4) Deneme akışı → 5) Yanlış defteri → 6) Analiz derinliği → 7) Sosyal & oyunlaştırma → 8) Planlama → 9) Premium → 10) Ayarlar.**

---

# BÖLÜM 0 — TASARIM ZİHNİYETİ

Aşağıdakiler her ekranda, istisnasız geçerli. Bir ekran güzel ama bu maddelerden birini ihlal ediyorsa, o ekran yanlıştır.

## 0.1 Sadelik — az öğe, büyük öğe

Uygulamanın en büyük riski kalabalıklaşmak. Her özellik ekrana bir şey eklemek ister; hepsine izin verilirse ürün bir gösterge paneline döner.

- **Her ekranda tek kahraman** — bir sayı, bir grafik ya da bir aksiyon. Gerisi ona hizmet eder.
- Kök ekranların ilk görünen kısmında **en fazla 4 blok**.
- Bir blokta **en fazla 2 seviye** bilgi (başlık + içerik). Üçüncü seviye başlıyorsa blok bölünür.
- **Aynı bilgi iki yerde gösterilmez.**
- **Anlamını söyleyemediğin sayı ekranda durmaz.** Çıplak sayı yerine "71 net · hedefin 1 net altında".
- Derinleşen içerik ekrana sıkıştırılmaz, **alt ekrana taşınır**.
- Bir şeyi eklemeden önce sor: *bunu çıkarırsam kullanıcı ne kaybeder?* Cevap netse ekle, değilse ekleme.

## 0.2 Tipografi

Hiyerarşi öncelikle tipografiyle kurulur — renkle değil, çerçeveyle değil.

- **En fazla 5 boyut.** Biri gerçekten dev (kahraman sayı), biri gerçekten küçük (bölüm etiketi). Ara boyutlar az olsun — 14 ile 15 arasındaki fark hiçbir şey anlatmaz, sadece tutarsızlık üretir.
- **Ölçek farkları cesur olsun.** Kahraman ile gövde metni arasındaki fark bakışta anlaşılmalı.
- İki aile: **sayı ve başlıklar için karakterli bir yüz**, gövde metni için nötr ve okunaklı bir sans.
- Bölüm etiketleri küçük, harf aralığı açık, sessiz renkte — dev sayılarla kontrastı bu üretiyor.
- **Satır yüksekliği ve paragraf aralığı ihmal edilmez.** Uzun metin ekranları (Gizlilik, Şartlar, Hakkında) da uygulamanın parçası.
- **Türkçe metin kırpılmaz.** Kelimeler uzundur; düzen buna göre kurulur, üç nokta ile kesilmez. En uzun gerçek adlarla test et: "Katı Cisimler (Prizma, Silindir, Koni, Küre)" · "Nükleik Asitler ve Protein Sentezi" · "Coşku ve Heyecana Bağlı Metinler (Şiir)".
- **Sayı formatı Türkçe:** ondalık virgül (58,25), binlik nokta (1.240), yüzde önde (%83).

## 0.3 Boşluk — öğeler arası nefes

Premium hissin en büyük kaynağı boşluktur. Ucuz tasarım ekranı doldurur; iyi tasarım boşluğu israf etmeye cesaret eder.

- **Tek boşluk merdiveni** (örn. 4 / 8 / 16 / 24 / 32). Ara değer icat edilmez.
- **Bloklar arası boşluk, blok içi boşluktan belirgin şekilde büyük.** Gruplar gözle ayrılmalı — çizgiye ihtiyaç duymadan.
- İlişkili şeyler yakın, ilişkisiz şeyler uzak. Yakınlık ilişkiyi anlatır.
- Ekran kenar boşluğu her ekranda **aynı**. Bir ekranda 16, diğerinde 20 olmaz.
- Dikey ritim tekdüze olmasın — her blok aynı yükseklikte olursa göz uyur; ama boşluk ölçeği dışına çıkılmaz.
- Boşluk "boş yer" değildir. **Doldurulacak alan değil, tasarımın kendisidir.**

## 0.4 Erişilebilirlik

Kullanıcı yorgun, gözü yorulmuş, çoğu zaman karanlıkta ve tek elle kullanıyor. Erişilebilirlik burada bir uyum maddesi değil, temel kullanılabilirlik.

- **Dokunma hedefi en az 44 × 44 px.** İki dokunma hedefi arasında en az 8 px.
- **Kontrast:** gövde metni en az 4.5:1, büyük metin en az 3:1. Koyu zeminde soluk gri metinden kaçın — "estetik" görünen düşük kontrast, yorgun gözde okunmaz.
- **Renk tek başına bilgi taşımaz.** Artış/azalış yalnızca yeşil/nötr renkle değil, **ok ve işaretle** de anlatılır. Ders ayrımı yalnızca renkle değil, **adla** da yapılır. Renk körü kullanıcı hiçbir bilgiyi kaybetmemeli.
- **Metin boyutu büyütüldüğünde düzen bozulmamalı.** Sistem yazı tipi büyütmesi kullanan öğrenciler var; düzen esnemeli, kırpılmamalı.
- **Ekran okuyucu için her öğenin anlamlı bir adı olmalı** — "buton" değil, "Çalışmaya başla".
- **Hareketi azalt tercihi desteklenmeli.** Kullanıcı cihazında hareketi kapattıysa animasyonlar sönümlenmeli; bilgi animasyona bağımlı olmamalı.
- Metin görsel üzerine yazılmaz; okunabilirlik dekorasyona feda edilmez.

## 0.5 Kullanım kolaylığı

- **Tek elle kullanım esas.** Birincil aksiyon parmağın rahat ulaştığı **alt bölgede** olsun. Ekranın üst kısmı bilgi içindir, aksiyon değil.
- **En sık yapılan işe en az dokunuşla ulaşılsın:** çalışma kaydetmek, durak tamamlamak, deneme girmek.
- **Klavye son çare.** Sayı girişlerinde artır/azalt, hızlı seçim, kaydırıcı tercih edilir — özellikle Deneme Gir ekranında (12-18 sayı girişi var).
- **Kullanıcı nerede olduğunu her an bilmeli.** Başlık, geri oku, ilerleme göstergesi net olsun.
- **Her ekranda bir tane birincil aksiyon.** İki eşit ağırlıkta buton, sıfır buton kadar felç edicidir.
- **Boş durumlar ceza gibi görünmesin.** "Senin hiçbir şeyin yok" değil, "buradan başlıyorsun". Her boş durumda tek net çağrı.
- **Geri dönülebilirlik:** silme, tamamlama gibi işlemler geri alınabilir olsun ya da onay istesin.
- **Bekleme hâlleri tasarlanmış olsun** — yükleniyor, bağlantı yok, hata. Bunlar da ekran; boş beyaz alan değil.
- 30 saniyelik oturumlarda kullanıcı **tek bir şey öğrenip çıkabilmeli.**

## 0.6 Canlılık

Sadelik ölülük değildir. Ekran sakin olacak ama cansız olmayacak.

- **Hareket bilgi taşısın.** Sayı sayarak artar, bar dolarak gelir, rota çizilerek belirir — hareket "ne olduğunu" anlatır, süs değildir.
- **Ekranda tek sürekli hareket** olsun (şimdi düğümünün nabzı, zamanlayıcı sayacı). İkincisi eklenirse ikisi de gürültü olur.
- **Dokunma anında karşılık versin** — gecikme hissi ucuzluk hissidir.
- **Geçişler yumuşak ve kısa** (200-350 ms). Uzun animasyon, hızlı kullanıcıyı yorar.
- **Renk enerjisi:** marka rengi canlı ve doygun; ders renkleri kendi bağlamlarında serbestçe görünür. Soluk, çekingen, tek tonlu bir dünya istemiyoruz.
- **Ölçek kontrastı canlılığın yarısıdır** — gerçekten dev bir sayı, ekranı statik bir tablodan bir ifadeye çevirir.
- **Kutlama var ama bağırmıyor.** İlerleme rotanın uzamasıyla, düğümün dolmasıyla anlatılır; konfetiyle değil.

---

# BÖLÜM 1 — DEĞİŞMEYEN TASARIM SİSTEMİ

Aşağıdakiler onaylandı. Yeni ekranlarda aynen uygulanacak, yeniden yorumlanmayacak.

## 1.1 Rota — imza bileşeni

Uygulamanın kimliği. Anatomisi:
- **Hat** — geçmiş kısmı dolu ve parlak, gelecek kısmı kesikli ve soluk
- **Düğümler** — geçmiş olaylar (denemeler, tamamlanan duraklar, geçilen seviyeler)
- **Şimdi düğümü** — vurgulu, nefes alan nabızla canlı
- **Hedef** — hattın bittiği yer (sınav günü, sonraki seviye, hedef net)

**Kural: Rota veri gibi görünüyorsa veriyi doğru söylemek zorunda.** Dekoratif eğri çizilmez.

**Türevleri:**
- **Rota (tam)** — Ana Sayfa ve Rota Detay
- **Mini rota** — satır içi kullanım (ders ivmesi, ders satırları, konu ilerlemesi)
- **Dikey rota** — sıralı adımlar için (seviye yolu, konu sırası, plan adımları)
- **Yılın rotası** — uzun dönem yoğunluk gösterimi

**Yeni ekranlarda Rota'yı zorlama.** Zaman içinde ilerleme, sıralı adım veya hedefe yaklaşma varsa kullan; yoksa kullanma. Her ekrana rota koymak dili ucuzlatır.

## 1.2 Renk

- **Marka: parlak mercan-kırmızı.** Aksiyon, rota, aktif durum, vurgu. Sadece bu.
- **Yeşil = artış.** **Nötr-soğuk ton = düşüş.** Kırmızı hiçbir yerde "kaybettin" demez.
- **Ders renkleri yalnızca ders bağlamında:** Türkçe `#60a5fa` · Matematik `#fb923c` · Fizik `#22d3ee` · Kimya `#f472b6` · Biyoloji `#34d399` · Tarih `#fbbf24` · Coğrafya `#2dd4bf` · Felsefe `#c084fc` · Din Kültürü `#84cc16`
- **Derinlik merdiveni:** `bg` → `surface` → `surfaceElevated` → `border`. Saf siyah yok.
- Koyu tema esas; açık tema aynı rollerden türetilecek, marka rengi hue'su değişmez.

## 1.3 Tipografi ve ölçek

- En fazla 5 boyut; biri gerçekten dev.
- Her ekranda **bir kahraman sayı/başlık**, diğerleri belirgin şekilde daha sessiz.
- Küçük mono/harf aralıklı etiketler (BÖLÜM BAŞLIKLARI) ile dev rakamların kontrastı korunacak.
- **Türkçe sayı formatı:** ondalık virgül (58,25), binlik nokta (1.240), yüzde önde (%83).
- **Türkçe metin kırpılmaz.** Konu adları tam görünür.

## 1.4 Bileşen envanteri (sabit)

- **Buton: 3 tip** — birincil (dolgulu), ikincil (çerçeveli), metin. Tek yükseklik, tek yarıçap.
- **Panel: en fazla 2 tip.**
- **Köşe yarıçapı: en fazla 3 değer.**
- **Boşluk: tek merdiven.** Bloklar arası boşluk, blok içi boşluktan belirgin büyük.
- **Filtre kontrolü: tek tip**, tüm ekranlarda aynı.
- **Ekran başlığı: 2 kalıp** — kök ekran (büyük sol başlık) ve alt ekran (geri oku + başlık).
- **Liste satırı: tek kalıp** — tüm listelerde aynı yükseklik, aynı hizalama mantığı.
- **Boş durum: tek kalıp** — kısa başlık + tek cümle açıklama + **tek** çağrı.

## 1.5 Yoğunluk kuralları

- Kök ekranların ilk görünen kısmında **en fazla 4 blok**.
- Bir blokta en fazla **2 seviye** bilgi.
- **Aynı bilgi iki yerde gösterilmez.**
- Derinleşen içerik alt ekrana taşınır.
- **Anlamını söyleyemediğin sayı ekranda durmaz.**

## 1.6 Hareket dili

- Rota açılışta çizilerek gelir (~600-800 ms); düğümler sırayla belirir.
- Şimdi düğümü nefes alan nabızla canlı — **ekrandaki tek sürekli hareket**.
- Dev sayılar sayarak artar; barlar soldan dolar.
- Bloklar açılışta 60-80 ms aralıklarla sırayla gelir.
- Dokunma geri bildirimi anında (hafif küçülme).
- Geçişler 200-350 ms, yumuşak yavaşlama.
- **Ekranı kaplayan konfeti/patlama yok.** Kutlama, rotanın ilerlemesiyle anlatılır.

## 1.7 Yasaklar

Mor `#8b5cf6` ve türevleri · mor-pembe/mor-mavi degradeler · glassmorphism · arka plan glow/blob/aurora · bento grid · gereksiz emoji · her aksiyona farklı renk · ham veritabanı anahtarı (`tyt_turkce`, `tyt_ayt`) · eşit ağırlıkta kart dizisi.

---

# BÖLÜM 2 — NAVİGASYON HARİTASI

## 2.1 Alt sekmeler (5)

| Sekme | Ekran | İşi |
|---|---|---|
| **Rota** | Ana Sayfa | Bugün ne yapmalıyım + nerede duruyorum |
| **Dersler** | Ders listesi | Müfredatta nerede duruyorum, ne çalışacağım |
| **Kaydet** (orta, yuvarlak) | — | Hızlı aksiyon sayfası açar (ekran değil) |
| **Analiz** | Analiz | Denemelerimde yükseliyor muyum, nerede kanıyorum |
| **Profil** | Profil | Şu ana kadar ne biriktirdim |

**Kaydet sayfası** dört aksiyon sunar: Çalışma Kaydet · Deneme Gir · Yanlış Ekle · Yanlış Defteri.

## 2.2 Akış mantığı

- Sekmeler **kök ekran**, geri oku yok, büyük sol başlık.
- Diğer her şey **alt ekran**, geri oku + başlık.
- **Kutlama ekranları** (Deneme Özeti, Çalışma Özeti, Haftalık Özet) alttan yükselerek gelir.
- **Modal ekranlar** (Görev Ekle, Profili Düzenle, Şifre Değiştir, E-posta Değiştir, Paywall) yarım/tam sayfa modal.

---

# BÖLÜM 3 — EKRANLAR

Her ekran için: **işi** (tek cümle), **içeriği**, **aksiyonları**, **nereden gelinir / nereye gider**.
Düzen ve hiyerarşi senin kararın. Veriler gerçek, uydurma kullanma.

---

## GRUP 1 — ONBOARDING & GİRİŞ (6 ekran)

**Bu grubun stratejik önemi:** Kullanıcının uygulamayı ilk gördüğü yer. Rota metaforu burada tanıtılmalı — "senin yolun burada başlıyor" fikri ilk temasta kurulmalı.

### 1. Tanıtım (Onboarding)
**İşi:** Uygulamanın ne olduğunu 4 ekranda anlatmak ve kayda yönlendirmek.
**İçerik:** 4 slayt —
1. "Hedefe Odaklan" — kişisel çalışma planı
2. "Gelişimini Takip Et" — deneme sonuçları, ders analizi, trend
3. "Seri Oluştur" — günlük seri, rozet, lig
4. "Birlikte Çalış" — gruplar, arkadaşlarla yarış
**Aksiyon:** "Devam" → son slaytta "Başlayalım", ayrıca "Atla".
**Tasarım notu:** Rota'yı burada tanıt. Slaytlar arası geçişte hat ilerlesin — kullanıcı tanıtımı bitirdiğinde yolun başına gelmiş olsun.
**Gider:** Kayıt / Giriş

### 2. Kayıt (Register)
**İşi:** Yeni hesap açmak.
**İçerik:** Ad soyad, e-posta, şifre; sosyal giriş seçenekleri; kullanım şartları onayı.
**Gider:** Sınav Kurulumu

### 3. Giriş (Login)
**İşi:** Mevcut hesaba girmek.
**İçerik:** E-posta, şifre, sosyal giriş, "Şifremi unuttum", "Kayıt ol".
**Gider:** Ana Sayfa (veya kurulum tamamlanmamışsa Sınav Kurulumu)

### 4. Şifremi Unuttum (ForgotPassword)
**İşi:** Sıfırlama bağlantısı göndermek.
**İçerik:** E-posta alanı, gönderim sonrası bilgilendirme hâli.

### 5. Sınav Kurulumu (ExamSetup)
**İşi:** Hangi sınava, hangi alanda, hangi tarihte hazırlandığını belirlemek. **Rotanın hedefi burada belirlenir.**
**İçerik:**
- Adım 1 — Kategori: **LGS** ("Liselere Geçiş Sınavı · 8. Sınıf") · **YKS** ("Yükseköğretim Kurumları Sınavı")
- Adım 1b — YKS alanı: **Sadece TYT** ("Temel Yeterlilik Testi") · **TYT + AYT Sayısal** ("Mühendislik, Tıp, Fen") · **TYT + AYT Eşit Ağırlık** ("Hukuk, İşletme, Psikoloji") · **TYT + AYT Sözel** ("Edebiyat, Tarih, İlahiyat") · **YKS Dil** ("Yabancı Dil Testi")
- Adım 2 — Sınav tarihi: Haziran 2027 / Haziran 2028 / Haziran 2029
**Tasarım notu:** Seçim yapıldıkça rotanın hedefi belirginleşsin — kullanıcı hedefini seçerken yolun ucunun oluştuğunu görsün.
**Gider:** Hedef Kurulumu

### 6. Hedef Kurulumu (GoalSetup)
**İşi:** Günlük soru hedefini belirlemek. **Ana Sayfa'daki dev "63 / 100" sayısının paydası burada belirlenir.**
**İçerik:** Kaydırıcı (20–200 soru, adım 5, varsayılan 80) + tahmini süre bilgisi ("günde ~1,6 saat çalışma").
**Tasarım notu:** Kaydırıcı hareket ettikçe süre tahmini canlı güncellensin.
**Gider:** Ana Sayfa (ilk kez → boş durum)

---

## GRUP 2 — DERSLER & KONULAR (4 ekran)

**Bu grup güncellenmesi istenen alanlardan biri.** Şu anki hâli işlevsel ama jenerik: pastel ikon kutuları, yüzdeli barlar, uzun liste.

### 7. Dersler (sekme)
**İşi:** Müfredatta nerede durduğumu görmek ve çalışılacak dersi seçmek.
**İçerik:**
- Genel ilerleme: tamamlanan konu / toplam konu (örn. 34 / 108)
- Sınav tipi geçişi: TYT / AYT (kullanıcının alanına göre)
- Öne çıkan ders önerisi ("önce buna odaklan" mantığı — en düşük tamamlama veya en çok net kaybı)
- Ders listesi — her ders: ad, tamamlanan/toplam konu, ilerleme, doğruluk oranı
  TYT: Türkçe (40 soru) · Matematik (40) · Fizik (7) · Kimya (7) · Biyoloji (6) · Tarih (5) · Coğrafya (5) · Felsefe (5) · Din Kültürü (5)
  LGS: Türkçe (20) · Matematik (20) · Fen Bilimleri (20) · T.C. İnkılap Tarihi (10) · Din Kültürü (10) · İngilizce (10)
**Aksiyon:** Ders seç → Konu Çalışma
**Tasarım notu:** Ders ilerlemesi **mini rota** ile gösterilebilir — konu sayısı bir yol, tamamlananlar geçilmiş düğümler. Pastel ikon kutularını kaldır; ders kimliği renkle zaten kuruluyor.

### 8. Konu Çalışma (TopicStudy)
**İşi:** Bir dersin konularını görmek, hangisini bitirdiğimi işaretlemek, çalışmaya başlamak.
**İçerik:** Ders başlığı ve genel ilerlemesi; konu listesi — her konu: ad, ustalık durumu, çözülen soru, doğruluk. Gerçek konu adları:
"Paragraf (Ana Düşünce)" · "Sözcükte Anlam" · "Anlatım Bozuklukları" · "Problemler (İşçi-Havuz)" · "EBOB - EKOK" · "Permütasyon - Kombinasyon" · "Katı Cisimler (Prizma, Silindir, Koni, Küre)" · "Türev (Maks-Min Problemleri)" · "İntegral (Alan-Hacim)" · "Newton'un Hareket Yasaları" · "Çözünürlük Dengesi" · "Nükleik Asitler ve Protein Sentezi" · "Servetifünun Edebiyatı" · "Osmanlı Duraklama ve Gerileme"
**Aksiyon:** Konuyu tamamlandı işaretle · konuya çalış (zamanlayıcı) · konu kartlarını aç
**Tasarım notu:** Konu listesi **dikey rota** için ideal — müfredat bir yol, konular duraklar.

### 9. Konu Kartları (TopicCards)
**İşi:** Bir konunun özet kartlarını (formül, kural, tanım) hızlıca gözden geçirmek.
**İçerik:** Konu başlığı, kart destesi, ilerleme.
**Aksiyon:** Kart çevir / sonraki / kart detayına gir

### 10. Kart Detayı (CardDetail)
**İşi:** Tek bir kartın tam içeriğini okumak.
**İçerik:** Kart içeriği, ilgili konu, "anladım / tekrar et" işaretlemesi.

---

## GRUP 3 — ÇALIŞMA AKIŞI (6 ekran)

**Uygulamanın çekirdek döngüsü.** Kullanıcı en sık bu akışa girer; en akıcı, en az sürtünmeli akış olmalı.

### 11. Çalışma Ekle (AddStudy)
**İşi:** Yapılmış bir çalışmayı elle kaydetmek (zamanlayıcı kullanmadan).
**İçerik:** Ders seçimi, konu seçimi (veya serbest yazma), çözülen soru sayısı, doğru/yanlış/boş, süre, tarih.
**Aksiyon:** Kaydet → Çalışma Özeti
**Tasarım notu:** En sık kullanılan giriş ekranı. Sayısal girişler tek elle, klavye açılmadan yapılabilmeli (artır/azalt, hızlı seçim).

### 12. Çalışma Zamanlayıcı (StudyTimer)
**İşi:** Odaklanarak çalışmak ve süreyi otomatik ölçmek.
**İçerik:** Seçili ders/konu, geçen süre (dev sayı), duraklat/devam, bitir.
**Tasarım notu:** Ekranın tek işi var. **Tek kahraman: süre.** Ekran karanlık ve sakin olsun; çalışırken bakılan bir ekran, dikkat dağıtmamalı. Sürekli hareket burada süre sayacıdır.

### 13. Çalışma Kaydet (StudySave)
**İşi:** Zamanlayıcı bitince sonucu kaydetmek.
**İçerik:** Ölçülen süre, ders/konu, çözülen soru, doğru/yanlış/boş.
**Aksiyon:** Kaydet → Çalışma Özeti

### 14. Çalışma Özeti (StudySummary) — kutlama ekranı
**İşi:** Kaydedilen çalışmanın karşılığını göstermek ve devam motivasyonu vermek.
**İçerik:** Ne yapıldı (süre, soru, doğruluk), kazanılan XP, günlük hedefe etkisi, serinin durumu.
**Tasarım notu:** **Kutlama burada rotanın ilerlemesiyle anlatılır** — durak dolar, hat bir adım uzar. Konfeti yok. Alttan yükselerek gelir.
**Aksiyon:** "Devam et" → Ana Sayfa

### 15. Çalışma Geçmişi (StudyHistory)
**İşi:** Geçmiş çalışma kayıtlarını görmek.
**İçerik:** Tarihe göre gruplanmış kayıtlar — ders, konu, süre, soru, doğruluk.
**Aksiyon:** Kayda dokun → düzenle/sil

### 16. Çalışma Kayıtları (StudyLog)
**İşi:** Çalışma kayıtlarının liste görünümü ve filtrelenmesi.
**İçerik:** Filtre (ders/tarih), kayıt listesi, dönem toplamları.

---

## GRUP 4 — PLAN & DURAKLAR (2 ekran)

### 17. Plan Detayı (PlanDetail)
**İşi:** Bugünün ve yaklaşan günlerin tüm duraklarını görmek ve yönetmek.
**İçerik:** Gün seçimi, o günün durakları (ders · konu · soru · süre), tamamlanma durumu, plan önerisinin gerekçesi.
**Aksiyon:** Durak tamamla · durak ekle · durağı düzenle/sil · çalışmaya başla
**Tasarım notu:** Ana Sayfa'daki "Bugünün Durakları" bloğunun tam hâli. **Dikey rota** kullanımı için doğal yer.

### 18. Görev Ekle (AddTask) — modal
**İşi:** Plana yeni bir durak eklemek.
**İçerik:** Ders, konu, hedef soru sayısı, tahmini süre, gün.
**Aksiyon:** Ekle → plana döner

---

## GRUP 5 — DENEME AKIŞI (6 ekran)

**Uygulamanın en değerli verisi buradan geliyor — Rota'yı besleyen kaynak.**

### 19. Deneme Gir (TrialEntry)
**İşi:** Girilen deneme sınavının sonuçlarını kaydetmek.
**İçerik:**
- Deneme tipi seçimi: **TYT Denemesi** (120 soru · 4 ders) · **AYT Sayısal** (80 soru) · **AYT Eşit Ağırlık** (80) · **AYT Sözel** (80) · **LGS Denemesi** (90 soru · 6 ders) · **Branş Denemesi** (tek ders)
- Tarih, deneme adı
- Ders ders doğru / yanlış / boş girişi
- Zorluk algısı ve moral (İYİ / ORTA / ZOR)
**Aksiyon:** Kaydet → Deneme Özeti
**Tasarım notu:** En yoğun veri girişi ekranı. Ders başına 3 sayı × 4-6 ders = 12-18 giriş. **Sürtünmeyi en aza indir:** tek elle, klavye minimum, hangi derste olduğun her an belli, ilerleme görünsün. Net anlık hesaplansın.

### 20. Deneme Özeti (TrialSummary) — kutlama ekranı
**İşi:** Girilen denemenin sonucunu göstermek ve rotaya etkisini anlatmak.
**İçerik:** Toplam net (dev sayı), önceki denemeye göre değişim, ders kırılımı, kazanılan XP.
**Tasarım notu:** **Rotanın yeni düğümünün eklenişi burada gösterilmeli** — hat uzar, tahmin güncellenir. "Tahminin 71'den 73'e çıktı" gibi bir cümle bu ekranın en güçlü anı olur.
**Aksiyon:** "Detayları gör" → Deneme Detayı · "Paylaş" → Paylaşım Kartı · "Devam" → Ana Sayfa

### 21. Deneme Detayı (TrialDetail)
**İşi:** Tek bir denemenin tüm kırılımını incelemek.
**İçerik:** Tarih, tip, toplam net; ders ders doğru/yanlış/boş ve net; zayıf ve güçlü dersler; zorluk/moral notu.
**Aksiyon:** Yanlışları deftere ekle · başka denemeyle karşılaştır

### 22. Deneme Karşılaştır (TrialCompare)
**İşi:** İki denemeyi yan yana koyup neyin değiştiğini görmek.
**İçerik:** İki deneme seçimi, ders ders karşılaştırma, toplam fark, en çok artan/azalan ders.

### 23. Detaylı Analiz (TrialInsights)
**İşi:** Denemeler genelinde konu konu doğru/yanlış/boş dağılımını görmek.
**İçerik:** Filtre, net trendi, ders bazlı derinlik, konu bazlı zayıflıklar.
**Not:** Bu ekran Analiz sekmesindeki "Detaylı Analiz" girişinden açılır.

### 24. Haftalık Deneme Özeti (WeeklyTrialReview) — kutlama ekranı
**İşi:** Haftanın deneme performansını özetlemek.
**İçerik:** Deneme sayısı, ortalama net, en iyi net, doğruluk, geçen haftaya göre değişim.

---

## GRUP 6 — YANLIŞ DEFTERİ (5 ekran)

**Bu grup güncellenmesi istenen alanlardan biri.** Ürün olarak güçlü (aralıklı tekrar sistemi var) ama tasarım olarak geride.

### 25. Yanlış Defteri (WrongNotebook)
**İşi:** Yanlış yapılan soruları biriktirmek ve tekrar etmek.
**İçerik:** Ders/konu filtresi, yanlış listesi (ders, konu, tarih, tekrar durumu), tekrarı gelen soru sayısı ("128 soru · 14 tekrar bekliyor").
**Aksiyon:** Yanlış ekle · tekrar oturumu başlat · yanlış detayına gir
**Tasarım notu:** "Tekrar zamanı gelenler" en görünür şey olmalı — defterin değeri birikimde değil, tekrarda.

### 26. Yanlış Ekle (AddWrong)
**İşi:** Yeni bir yanlış soruyu deftere kaydetmek.
**İçerik:** Ders, konu, hata tipi (bilgi eksiği / dikkatsizlik / zaman), not, fotoğraf ekleme.
**Tasarım notu:** Hızlı olmalı — kullanıcı deneme çözerken araya giriyor.

### 27. Yanlış Detayı (WrongDetail)
**İşi:** Kaydedilmiş bir yanlışı incelemek.
**İçerik:** Soru görseli/notu, ders, konu, hata tipi, tekrar geçmişi, sonraki tekrar tarihi.
**Aksiyon:** Çözüldü işaretle · düzenle · sil

### 28. Tekrar Oturumu (ReviewSession)
**İşi:** Tekrarı gelen yanlışları sırayla çalışmak.
**İçerik:** Sıradaki soru, ilerleme (3/14), "biliyorum / bilmiyorum" değerlendirmesi.
**Tasarım notu:** **Dikey rota** ile oturum ilerlemesi gösterilebilir. Odaklanma ekranı — sade tut.

### 29. Kaydırmalı Tekrar (SwipeReview)
**İşi:** Yanlışları kart destesi hâlinde hızlı gözden geçirmek.
**İçerik:** Kart destesi, kaydırma ile "biliyorum / tekrar".
**Tasarım notu:** Zaten ayrışık bir etkileşim; sadece renk ve tipografiyi sisteme uydur.

---

## GRUP 7 — ANALİZ DERİNLİĞİ (6 ekran)

**İş bölümü kuralı:** **Rota = gelecek** (projeksiyon, tempo senaryoları, hedef). **Analiz = geçmiş** (ne oldu, nerede kanıyorum). Bu ayrım her ekranda korunmalı; ikisi aynı grafiği göstermemeli.

### 30. Rota Detay
**İşi:** Sınav gününe kadarki projeksiyonu ve tempo senaryolarını incelemek.
**İçerik:** Tam rota (hedef çizgisi, tahmin, güven aralığı), "bu tempoyla sınav günü X net", tempo senaryoları (%10 daha çok / aynı / %10 daha az), gelecekteki planlanmış duraklar.
**Not:** Tasarlandı ve onaylandı. Diğer ekranlar buna uyum sağlayacak.

### 31. Ders Listesi (SubjectList)
**İşi:** Tüm derslerin deneme performansını karşılaştırmalı görmek.
**İçerik:** Filtre, ders listesi — net, maksimum, doğruluk, trend.
**Aksiyon:** Derse dokun → Ders Detayı

### 32. Ders Detayı (SubjectDetail)
**İşi:** Tek bir dersin zaman içindeki gelişimini görmek.
**İçerik:** Ders adı ve rengi, net trendi (mini rota büyütülmüş hâli), konu bazlı doğruluk, zayıf konular.
**Aksiyon:** Zayıf konuya çalış · yanlışlarını gör

### 33. Zayıf Alanlar (WeakAreas)
**İşi:** En çok kan kaybedilen konuları tek listede görmek ve müdahale etmek.
**İçerik:** Konu listesi — ders, konu, doğruluk, gerekçe ("Bu konuya uzun süredir çalışmadın" / "Düşük başarı oranı, temel kavramlardan başla").
**Aksiyon:** "Git çalış" → Konu Çalışma
**Boş durum:** "Zayıf alan bulunamadı"

### 34. Net Tahmini (NetForecast)
**İşi:** Mevcut tempoyla sınavda çıkacak neti detaylı görmek.
**İçerik:** Tahmini net, güven aralığı, ders bazlı tahmin, hedefe uzaklık.
**Dikkat:** Bu ekran Rota Detay ile büyük ölçüde örtüşüyor. **İkisinin ilişkisini netleştir:** ya Net Tahmini ders bazlı derinliğe odaklansın (Rota genel resmi verir), ya da iki ekran birleştirilsin. Kararını gerekçelendir.

### 35. Dönem Analizi (Comparative)
**İşi:** Haftalık/aylık/3 aylık dönemleri karşılaştırmak.
**İçerik:** Dönem seçimi (Hafta / Ay / 3 Ay), dönem ortalaması ve önceki döneme göre değişim, trend yorumu ("Yükseliş trendi" / "Düşüş trendi" / "Stabil performans"), tutarlılık skoru (/100), ders bazlı gelişim ("28,0 → 31,5 · +3,5"), kişisel rekorlar.

---

## GRUP 8 — PRATİK & SİMÜLASYON (3 ekran)

### 36. 5dk Quiz (QuickPractice)
**İşi:** Kısa sürede son yanlışlardan hızlı tekrar yapmak.
**İçerik:** 10 soru, süre, ilerleme, sonuç.
**Tasarım notu:** Hızlı ve odaklı. Oturum ilerlemesi rota diliyle gösterilebilir.

### 37. Sınav Simülasyonu (ExamSimulator) — premium
**İşi:** Tam süreli gerçek sınav provası yapmak.
**İçerik:** Sınav tipi, süre, bölüm geçişleri, cevap girişi, bitiş ve sonuç.
**Not:** Premium özellik; erişimi olmayan kullanıcı Paywall'a yönlenir.

### 38. Sıralama Simülatörü (RankSimulator)
**İşi:** Belirli bir net ile hangi sıralamaya/bölüme gidilebileceğini görmek.
**İçerik:** Net girişi/kaydırıcı, tahmini sıralama, tahmini puan, örnek bölümler.
**Tasarım notu:** Motivasyon açısından güçlü bir ekran — "71 net = şu sıralama = şu bölüm" zinciri öğrenci için çok somut. Rota'nın hedefiyle bağlanabilir.

---

## GRUP 9 — SOSYAL & OYUNLAŞTIRMA (6 ekran)

**Ton uyarısı:** Bu grup "ucuz oyun" hissine en yatkın alan. Premium hissi korumak için kutlama ve rozetler ölçülü olmalı.

### 39. Seviye
**İşi:** XP'nin nereden geldiğini ve sıradaki seviyeyi görmek.
**İçerik:** Seviye ve rütbe, XP ilerlemesi, bu hafta kazanılanların dökümü, seviye yolu (dikey rota).
**Not:** Tasarlandı ve onaylandı.
**Rütbeler:** Başlangıç · Çaylak · Öğrenci · Azimli · Çalışkan · Kararlı · Odaklı · Hırslı · Disiplinli · Savaşçı · Uzman · Usta · Elit · Efsane · Maratoncu
**XP değerleri:** 15 dk çalışma 10 · soru 2 · deneme girişi 50 · yanlış çözüldü 15 · günlük giriş 20 · seri günü 5 · plan görevi 5 · kusursuz plan 100 · günlük hedef 40 · davet 50

### 40. Haftalık Lig (League)
**İşi:** Haftalık XP'ye göre diğer kullanıcılarla yarışmak.
**İçerik:** Mevcut rütbe (Bronz 0 · Gümüş 150 · Altın 400 · Elmas 800 · Obsidyen 1500), sıralama listesi, üst lige kalan XP, hafta bitimine kalan süre.

### 41. Arkadaşlar (Friends)
**İşi:** Arkadaş eklemek ve onların ilerlemesini görmek.
**İçerik:** Arkadaş listesi (isim, seri, haftalık XP), arkadaş ekleme, istekler.

### 42. Meydan Okuma (Challenge)
**İşi:** Arkadaşlarla hedef bazlı yarışmak.
**İçerik:** Aktif meydan okumalar, katılımcılar ve ilerlemeleri, kalan süre, yeni meydan okuma oluşturma.
**Tasarım notu:** Katılımcıların ilerlemesi **yan yana rotalar** olarak gösterilebilir — metaforun sosyal karşılığı.

### 43. Davet (Referral)
**İşi:** Arkadaş davet ederek XP kazanmak.
**İçerik:** Davet kodu/bağlantısı, davet edilenler, kazanılan ödül (davet başına 50 XP).

### 44. Paylaşım Kartı (ShareCard)
**İşi:** Başarıyı dışarıda paylaşılabilir bir görsele dönüştürmek.
**İçerik:** Paylaşılacak içerik (deneme sonucu, seri, haftalık özet), kart önizlemesi, paylaş.
**Tasarım notu:** **Uygulamanın en görünür pazarlama yüzeyi.** Uygulama dışında, sosyal medyada görünecek tek şey bu. Rota burada kahraman olmalı — kart tek bakışta "Maraton" dedirtmeli. Poster diline en uygun ekran budur; burada cesur ol.

---

## GRUP 10 — PLANLAMA & TAKVİM (3 ekran)

### 45. Takvim (Calendar)
**İşi:** Hangi gün ne yapıldığını ve neyin planlandığını görmek.
**İçerik:** Ay görünümü, günlerin yoğunluğu, gün seçimi ve o günün detayı (çalışmalar, denemeler, duraklar).
**Tasarım notu:** Profil'deki "Yılın Rotası" ile ilişkisini netleştir — ikisi de zaman içindeki aktiviteyi gösteriyor, tekrar olmasın.

### 46. Hedefler (Goals)
**İşi:** Günlük/haftalık hedefleri görmek ve değiştirmek.
**İçerik:** Günlük soru hedefi, haftalık hedefler, hedefe ulaşma geçmişi.

### 47. Yol Haritası (Roadmap)
**İşi:** Sınava kadar olan uzun vadeli çalışma planını görmek.
**İçerik:** Dönemler, hangi dersin ne zaman biteceği, ilerleme.
**Tasarım notu:** **Rota metaforunun en doğal ikinci evi.** Sınav gününe kadar uzanan uzun bir yol, üzerinde konu/ders kilometre taşları. Bu ekran rotanın "makro" hâli olabilir.

### 48. Haftalık Özet (WeeklyReview) — kutlama ekranı
**İşi:** Haftanın çalışma performansını özetlemek.
**İçerik:** Soru, süre, aktif gün, deneme sayısı; geçen haftaya göre değişim; "Bu hafta 5 durak geçtin, 2'si Matematik" tarzı durak raporu.

---

## GRUP 11 — PREMIUM (1 ekran)

### 49. Paywall
**İşi:** Ücretli sürüme geçirmek.
**İçerik:** Premium ile açılan özellikler, planlar ve fiyatlar, süre seçimi, satın alma, geri yükleme, şartlar.
**Tasarım notu:** Uygulamanın en yüksek getirili ekranı. Değer önce, fiyat sonra. **Rota burada da kullanılabilir:** premium'un rotayı nasıl hızlandırdığını göstermek soyut vaatlerden daha güçlüdür.
**Not:** Şu an tek premium kapısı Sınav Simülasyonu. Başka giriş noktaları da tasarlanabilir.

---

## GRUP 12 — AYARLAR (9 ekran)

**Ortak kural:** Hepsi aynı liste satırı kalıbını, aynı başlık kalıbını, aynı form kalıbını kullanacak. Şu an her biri kendi stilini tanımlıyor — bu bitecek. Bu grubun tasarımı hızlı olmalı; yaratıcılık değil **tutarlılık** aranıyor.

### 50. Ayarlar (Settings)
**İşi:** Tüm ayarlara giriş noktası.
**İçerik:** Gruplanmış liste — Hesap (Profili Düzenle, E-posta, Şifre) · Uygulama (Görünüm, Bildirimler, Hedefler) · Hakkında (Gizlilik, Şartlar, Hakkında) · Çıkış / Hesabı sil.

### 51. Görünüm (Appearance) — tema seçimi (Koyu / Açık / Sistem)
### 52. Profili Düzenle (EditProfile) — modal; ad, avatar, sınav bilgisi
### 53. Şifre Değiştir (ChangePassword) — modal
### 54. E-posta Değiştir (EditEmail) — modal
### 55. Bildirim Ayarları (NotificationsSettings) — hatırlatma türleri ve saatleri
### 56. Gizlilik (Privacy) — metin ekranı
### 57. Şartlar (Terms) — metin ekranı
### 58. Hakkında (About) — sürüm, iletişim, lisanslar

**Metin ekranları için:** Uzun metin okunabilirliği — satır uzunluğu, paragraf aralığı, başlık hiyerarşisi. Bunlar da uygulamanın parçası, özensiz bırakılmayacak.

---

# BÖLÜM 4 — TEKRAR EDEN MODÜLLER

Bunları bir kez tasarla, her ekranda aynısı kullanılsın. Sistem panosunda hepsini göster.

| Modül | Nerede kullanılır |
|---|---|
| **Rota (tam)** | Ana Sayfa, Rota Detay, Yol Haritası |
| **Mini rota** | Ders ivmesi, ders satırları, konu ilerlemesi, arkadaş karşılaştırma |
| **Dikey rota** | Seviye yolu, konu listesi, plan durakları, tekrar oturumu |
| **Durak satırı** | Bugünün durakları, plan detayı |
| **Ders satırı** (renk noktası + ad + değer + bar) | Analiz, Dersler, Güç Haritası, Ders Listesi |
| **Deneme kaydı satırı** (tip rozeti + tarih + net + değişim + zorluk) | Analiz, Deneme geçmişi |
| **İstatistik satırı** (etiket + değer + birim) | Profil Yol Künyesi, özet ekranları |
| **Filtre kontrolü** | Analiz, Dersler, Yanlış Defteri, Ders Listesi |
| **Boş durum** | Her liste ekranı |
| **Kutlama ekranı kalıbı** | Çalışma Özeti, Deneme Özeti, Haftalık Özet |
| **Form alanı** | Tüm giriş ve ayar ekranları |
| **Sayı girişi** (artır/azalt) | Çalışma Ekle, Deneme Gir |
| **Liste satırı + chevron** | Ayarlar, alt ekran girişleri |
| **Rozet / etiket** (İYİ, ZOR, GÜMÜŞ, TYT) | Deneme kayıtları, lig, profil |

---

# BÖLÜM 5 — ANİMASYON KATALOĞU

Her animasyonu bir kez tanımla, nerede kullanılacağını yaz.

| Animasyon | Nerede |
|---|---|
| Rota çizilme (~600-800 ms) | Ana Sayfa, Rota Detay, Yol Haritası açılışı |
| Düğüm sırayla belirme | Rota olan her yer |
| Şimdi düğümü nabzı (sürekli) | Ana Sayfa, Rota Detay |
| Durak dolma + hat uzama | Durak tamamlandığında, Çalışma Özeti |
| Sayı sayarak artma | Tüm dev sayılar |
| Bar soldan dolma | Ders barları, ilerleme çubukları |
| Blokların sıralı gelişi (60-80 ms) | Tüm ekran açılışları |
| Dokunma küçülmesi | Tüm basılabilir öğeler |
| Ekran geçişi (200-350 ms) | Tüm navigasyon |
| Alttan yükselme | Kutlama ekranları, Kaydet sayfası |
| Modal açılışı | Görev Ekle, Paywall, ayar modalleri |
| Zamanlayıcı sayacı (sürekli) | Çalışma Zamanlayıcı |
| Kart kaydırma | Kaydırmalı Tekrar, Konu Kartları |
| Liste öğesi giriş/çıkışı | Durak tamamlama, yanlış silme |

---

# BÖLÜM 6 — ÇIKTI

Her grup için:

1. **Grubun tüm ekranları** — dolu veri hâliyle, mobil oran (≈390 × 844), koyu tema
2. **Kritik ekranların boş durumları** — liste içeren her ekran
3. **Grup notu** — bu grupta hangi modülleri kullandın, hangi yeni modül gerekti, neyi neden değiştirdin (3-5 cümle)

Tüm gruplar bittiğinde:

4. **Güncellenmiş sistem panosu** — tüm modüller, renk rolleri ve derinlik merdiveni, tipografi ölçeği, buton tipleri, yarıçap ve boşluk değerleri, animasyon kataloğu
5. **Navigasyon haritası görseli** — hangi ekran nereye gidiyor

---

**Son hatırlatma:** Onaylanan Ana Sayfa, Rota Detay, Analiz, Profil ve Seviye ekranları **referanstır**. Yeni ekranlar onlarla aynı ailedenmiş gibi görünmeli — aynı boşluk, aynı tipografi ölçeği, aynı buton, aynı sessizlik.

Her ekranı teslim etmeden önce Bölüm 0'a karşı kontrol et:
**az öğe mi · tipografi hiyerarşisi net mi · boşluk nefes aldırıyor mu · dokunma hedefleri ve kontrast yeterli mi · tek elle kolay mı · canlı mı.**
Altısından biri bile "hayır" ise ekran hazır değildir.
