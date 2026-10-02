# Mağaza metni ve cihaz kontrolü (2026-10-02)

Denetim raporunun kodla çözülmeyen maddeleri. Kod tarafı `report-fixes` dalında.

## 1. Mağaza konumlandırması

**Tek cümle (alt başlık):** Bugün ne çalışacağını bil. Yolun çalıştıkça şekillensin.

**Kapsam:** V1 mağazada yalnız **YKS** olarak anlatılır. LGS uygulamada çalışmaya devam eder (mevcut kullanıcı bozulmaz), ama listing'de geçmez; LGS ayrı konumlandırma ister (veli + 8. sınıf dili).

**Açıklama (ilk 3 satır görünür, en önemlisi orada):**

> Maraton, YKS'ye kadar olan yolu senin için günlere böler. Her sabah bugünün durağı hazır: hangi ders, hangi konu, kaç dakika.
> Çalıştıkça ve deneme girdikçe rotan yeniden çizilir; zayıf kaldığın ders öne gelir, yetiştiğin konu geri çekilir.
> Hesap açmadan önce rotanı gör: üç soru, ilk durakların ve nedenleri.

Devamı (kısa maddeler, eşit ağırlıkta özellik listesi YOK):
- Bugünün durakları ve tek dokunuşla sayaç
- Deneme sonucu → rota ve tahmin güncellenir
- Yanlış defteri, tekrar zamanı gelince geri getirir
- Bağlantı yokken de çalışır; girdiğin hiçbir şey kaybolmaz

**Anahtar kelimeler:** yks, tyt, ayt, çalışma programı, ders programı, deneme takibi, net hesaplama, yks rota, konu takibi

## 2. Ekran görüntüleri (gerçek cihaz, temiz hesap)

Konsept görseller kullanılamaz (İngilizce metinler, "3px", "Upcomact Durak" kalıntıları). Sıra hikâye anlatır:

1. Rota önizlemesi sonucu ("ROTAN HAZIR · 37 hafta" + ilk duraklar) — fark burada
2. Ana sayfa: Çalışmaya Başla + bugünün durakları
3. Sayaç (tek ders, sade)
4. Çalışma özeti: "Rotan bir durak ilerledi"
5. Deneme sonrası rota grafiği
6. Analiz: koç cümlesi ("Matematik son 3 denemede ... Bugüne 20 dk ekle")

Her görselin üstünde tek kısa Türkçe başlık; özellik adı değil fayda ("Ne çalışacağını düşünme").

## 3. Mağaza engeli

- **Uygulama ikonu hâlâ Expo yer tutucusu.** Logo gelmeden gönderilmez.

## 4. Cihazda yapılacak kontrol (10 dakika)

Buradan yapılamıyor; telefonda:

- [ ] **iOS Dynamic Type** (Ayarlar > Ekran > Metin Boyutu en büyük): ana sayfa, durak satırı, + paneli, sayaç. Kesilen/üst üste binen metin var mı?
- [ ] **Android %200 yazı**: aynı ekranlar.
- [ ] **VoiceOver / TalkBack**: ana sayfada "Çalışmaya Başla" → durak halkası ("tamamlandı olarak işaretle" / "tikini geri al") → kalem ("Kaydı düzenle") okunuyor mu?
- [ ] **375×667 (iPhone SE)**: rota önizlemesi sonucu ve "Rotamı kaydet" butonu kaydırmadan görünüyor mu?
- [ ] **Tek el**: alt sekme + merkez +, ana CTA başparmak bölgesinde mi?
- [ ] **Kötü ağ / uçak modu**: deneme kaydet (artık premium kontrolü beklemeden kaydetmeli), durak tikle, sonra bağlantıyı aç → "Yüklenmeyi bekleyenler" boşalıyor mu?
