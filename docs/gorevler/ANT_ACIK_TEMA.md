# Görev (Antigravity): Açık tema — "çok beyaz" sorunu, derinlik

**Önce:** Kendi worktree'nde, yeni bir dalda çalış (`git worktree add ../Maraton-light -b feat/light-depth origin/main`). main'e doğrudan push YOK; bitince dalı haber ver, Claude inceleyip birleştirecek.

## Sorun
Açık tema "beyaz üstüne beyaz" duruyor: zemin `#F5F2EE`, kartlar (`elev`) `#FFFFFF`. Katmanlar ayrışmıyor, derinlik yok. Koyu tema iyi; açık tema aynı sanat yönüne (sıcak, ciddi, Ders analizi sadeliği) gelmeli.

## Kurallar (AGENTS.md)
- Renkler YALNIZ `src/themes/palette.js` + `tokens.js` üzerinden. Bileşende hex yok.
- Koyu temaya DOKUNMA. Değişiklik `LIGHT_SURFACES` / açık tohumlar / gerekiyorsa yalnız açık temaya özel gölge tokenı.
- Kontrast: gövde metni ≥ 4.5 (text, text2, text3 her yüzeyde). `node` ile `contrastRatio` (src/themes/colorMix.js) ölçüp yorum satırına yaz (palette.js'teki "AA:" yorumları gibi).
- Derinlik koyu temada yüzey tonu + 1px kenarlıkla kurulur; açıkta **yumuşak gölge** kullanılabilir ama yalnız kart/panel seviyesinde, tek token (ör. `SHADOW.cardLight`), `scheme === "light"` iken.
- Kızıl sadece ana buton ve rota çizgisinde (seçili durumlar `selBorder/selFill/selText`), seri turuncu (`flame`). Bunları bozma.

## Önerilen yön (dene, ekran görüntüsüyle karşılaştır)
1. Zemin bir ton koyulaşsın ve ısınsın (kağıt hissi): ör. `bg` ≈ `#EDE7DF`, `void` (girinti) bir ton daha koyu.
2. Kartlar beyaz kalsın ama zeminden **ayrışsın**: ince sıcak kenarlık (`line` ≈ `#DCD2C5`) + çok hafif gölge (y=1-2, blur 6-10, opacity 0.06-0.08, sıcak kahve tonlu).
3. Alt sekme çubuğu ve üst bantlar zeminle aynı kalmasın: tab bar `elev` + üst kenarlık.
4. Sand `surface` (`#E6D6C1`) bazı yerlerde çamurlu duruyor; ya `bg` ile `elev` arasına çek ya da yalnız vurgu yüzeylerinde kullan.

## Teslim
- Ana sayfa, Program (Hafta/Ay), Analiz, Defter, Profil, + paneli: önce/sonra ekran görüntüleri.
- `npm test`, `npm run check`, `npx expo export --platform ios` geçmeli.
- Tek commit ya da ekran başına commit; mesajda ne değişti.
