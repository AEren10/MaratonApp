// Mağaza ekran görüntüsü kareleri. Ham ekran görüntüsü: shots/<shot>
// Başlık ≤5 kelime, alt satır ≤8 kelime. V1 dışı özellik (lig, sosyal, premium, AI) yok.
window.SLIDES = [
  { id: '01', shot: '01-rota.png', a: 'Her sabah', b: 'rotan hazır.', sub: 'Hedefine ve netlerine göre günlük çalışma planı.', route: 'top' },
  { id: '02', shot: '02-deneme-grafik.png', a: 'Netin nereye', b: 'gidiyor, gör.', sub: 'TYT, AYT ve branş denemelerin tek grafikte.', route: 'mid' },
  { id: '03', shot: '03-siralama.png', a: 'Bugünkü netinle', b: 'neredesin?', sub: 'Tahmini sıralaman ve hedefine kalan net.', route: 'top' },
  { id: '04', shot: '04-yanlis-defteri.png', a: 'Yanlışın', b: 'unutulmasın.', sub: 'Fotoğrafla kaydet, zamanı gelince yeniden çöz.', route: 'mid' },
  { id: '05', shot: '05-ders-analiz.png', a: 'Ders ders,', b: 'net net.', sub: 'Doğru, yanlış, boş; nerede kaybettiğini gör.', route: 'top' },
  { id: '06', shot: '06-sayac.png', a: 'Süreyi say,', b: 'odakta kal.', sub: 'Pomodoro ya da serbest; her dakika kayıtta.', route: 'mid' },
  { id: '07', shot: '07-mufredat.png', a: 'Konu konu', b: 'ilerle.', sub: 'TYT ve AYT müfredatında nerede olduğunu gör.', route: 'top' },
  { id: '08', shot: '08-widget.png', shotAndroid: '08-haftalik.png', a: 'Her gün bir', b: 'adım daha.', sub: "Seri, haftalık rapor ve ana ekran widget'ları.", subAndroid: 'Seri, haftalık rapor ve ilerlemen tek yerde.', route: 'mid' },
];

// Mağaza çıktı boyutları
window.PLATFORMS = {
  ios: { w: 1320, h: 2868, device: 'ios' },      // iPhone 6.9" (App Store zorunlu boyut)
  android: { w: 1440, h: 2560, device: 'android' }, // Play telefon 9:16
};
