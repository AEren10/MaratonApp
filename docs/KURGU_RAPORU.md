# Kurgu raporu — akışlar, öne çıkarma, yer değiştirmeler

Kaynak: Antigravity, 2026-09-22. Claude 2026-09-23'te maddeleri kodda
doğruladı; her maddenin altında **Doğrulama** satırı var. Rapor sohbette
kalmıştı, üç ajanın da görmesi için buraya alındı.

---

## Güçlü yönler (Antigravity)

- **Tasarım dili.** `tokens.js` + OKLab türetimi (`colorMix.js`) sayesinde
  sahte gölgeye kaçmayan, 1px kenarlık ve yüzey kademeleriyle derinlik kuran
  sakin bir karanlık mod.
- **Çevrimdışı dayanıklılık.** Ağ koptuğunda çalışmanın, yanlışın ve durakların
  kaybolmaması.
- **Pedagojik otorite.** Konu Borcu, Aralıklı Tekrar, Deneme Net Tahmini.

---

## Kurgusal zafiyetler

### 1. PROGRAM sekmesi yanlış ekranı açıyor
Etiket "PROGRAM", açtığı ekran Yol Haritası (müfredat ağacı). Günün planı
stack'e ayrı ekran olarak fırlatılıyor.

**Doğrulama: DOĞRU.** `TabBar.js:19` → `SCREENS.CURRICULUM_MAP`.
`DAILY_PLAN` yolu `program/dersler`, `deepLink: false`.

**Durum:** Yarısı yapıldı (`1216369`) — Programım ekranına ters yönlü segment
eklendi, geçiş artık çift yönlü. Sekmenin Programım'a inmesi YAPILMADI:
`tabAssignment`, `TabBar`, `AppNavigator`, `tabJump`, `routes` ve yeni bir
`_ROOT` ekranı gerektiriyor. Navigasyon bu hafta üç kez kırılıp tamir edildi;
cihazda test edebilen bir oturuma bırakıldı.

**Not:** Sekme adını "MÜFREDAT" yapmak denendi, tasarım testi engelledi —
artboard'lar bu dört sekmeyi adlandırmış. Yani ad değil, ekran değişmeli.

### 2. Yanlış Defteri gömülü
Kendi sekmesi yok, Analiz yığınının içinde kayboluyor.

**Doğrulama: DOĞRU.** `WRONG_NOTEBOOK`, `ANALYSIS_NOTEBOOK` akışında.

**Durum:** Yarısı yapıldı (`1c4a43f`) — tekrarı gelen yanlışlar ana sayfada
görünür oldu. Analiz'e `[DENEMELER | YANLIŞ DEFTERİ]` segmenti BEKLİYOR.

### 3. Eylem / istatistik dengesizliği
Ekranın üstünü sayılar kaplıyor, "şimdi ne yapmalıyım" aşağıda.

**Doğrulama: SORUN DOĞRU, TEŞHİS EKSİK.** CTA "en altta" değil, grafiğin
hemen altında. Asıl sorun tekrar: 96px "0", yanındaki "/110" ve altındaki
"hedefe 110 kaldı" aynı bilgiyi üç kez söylüyor. Küçültülmesi gereken
grafik değil, kahraman sayı.

### 4. Analiz'de çift FAB
**Doğrulama: DOĞRU.** **Durum: YAPILDI** (`5ee0e3c`).

---

## Öne çıkarılacaklar

1. **Sıradaki durak** ana sayfada göz hizasında birincil kart olsun.
2. **Tekrarı gelen yanlışlar** — YAPILDI (`1c4a43f`), durakların altında çıkıyor,
   dokununca doğrudan tekrar oturumu.
3. **Hedefe kalan net** son deneme sonrası Analiz tepesinde ve ana sayfa
   özetinde görünsün.

---

## Yer değiştirmeler

| Bileşen | Öneri | Doğrulama |
|---|---|---|
| Tab 2 "PROGRAM" | Programım'a insin, Müfredat segment olsun | Doğru, yarısı yapıldı |
| Yanlış Defteri | Analiz tepesinde segment | Doğru, bekliyor |
| Çalışma geçmişi | Profil üstü | Kısmen. Çubuğa dokunmak ÖNERİLMEZ: o alanda zaten yatay kaydırma + tek dokunuş var, üçüncü jest ikisini bozar |
| Bölüm seçimi | Onboarding'den çıksın | **YANLIŞ PREMİS.** `data/programs.js` yalnızca `RankSimulatorScreen` ve `useThresholdView`'da. Onboarding'de bölüm listesi YOK. Onboarding uzun (6 ekran) ama gerekçe başka |
| "Sırada Ne Var" ekranı | Günlük döngüden çıksın | **DOĞRULANAMADI.** O metin kodda yalnızca `ForecastAccuracyScreen`'de geçiyor. Hangi ekran kastediliyor, netleşmeli |
| Analiz sticky FAB | Kaldırılsın | Doğru, YAPILDI |

---

## Raporda olmayan, Claude'un eklediği

- **Boş durum.** Rapor tamamen dolu bir hesabı anlatıyor. Uygulamayı ilk açan
  öğrencide bu verilerin hiçbiri yok; ilk gün ekranı ve boş durumlar sekme
  sırasından daha çok terk üretir.
- **Onboarding → ilk oturum boşluğu.** "Rota Hazır" deniyor, sonra ana sayfa.
  İlk çalışma oturumuna kadarki adım hiç tasarlanmamış.

---

## Sıra

1. ~~Analiz'deki çift FAB~~ ✔
2. ~~Program ↔ Müfredat çift yönlü geçiş~~ ✔ (sekme kökü bekliyor)
3. ~~Tekrar bekleyen çipi~~ ✔
4. Analiz'e Yanlış Defteri segmenti
5. Kahraman alandaki üç kat tekrarı tekile indir
6. Onboarding ve ilk gün
