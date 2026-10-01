// Bildirim METINLERI -- saf. Dil: sicak, kisa, somut; suclamaz, emoji ve
// XP yok. Her metin tek bir sey ister ve gidecegi yeri soyler.

const MONTHS = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];

function duration(m) {
  const h = Math.floor(m / 60);
  return h ? `${h} sa${m % 60 ? ` ${m % 60} dk` : ""}` : `${m} dk`;
}

// Plani bilinmeyen gun (yarin): gune gore donen yumusak bir cumle.
export function dailyGeneric(dayIndex, daysLeft) {
  const lines = [
    { title: "Rotan hazır", body: "Bugün küçük bir durakla başlamaya ne dersin?" },
    daysLeft > 0
      ? { title: `Sınava ${daysLeft} gün`, body: "Her gün bir durak, yolu sessizce kısaltır." }
      : { title: "Bir durak, bir adım", body: "Bugünün ilk durağı kısa. Gerisi kendiliğinden gelir." },
    { title: "Kaldığın yer duruyor", body: "Sıradaki durak seni bekliyor, 15 dakika yeter." },
  ];
  return lines[Math.abs(dayIndex) % lines.length];
}

// Geri donus merdiveni: 3., 7. ve 14. gun. Sonrasi sessizlik.
export function comebackCopy(step, { daysLeft = 0, next = null } = {}) {
  if (step === 3) {
    return {
      title: "Rotan seni bekliyor",
      body: next
        ? `Birkaç gün ara verdin, sorun değil. Tek durakla dön: ${next}.`
        : "Birkaç gün ara verdin, sorun değil. Kaldığın yerden tek durakla dönebilirsin.",
    };
  }
  if (step === 7) {
    return { title: "Bir hafta oldu", body: "Rota bu haftayı yeniden dağıttı. İlk durak kısa; yeniden başlamak için iyi bir gün." };
  }
  return {
    title: "Kapı açık",
    body: daysLeft > 0
      ? `Sınava ${daysLeft} gün var. Döndüğünde rota seni bulunduğun yerden alır.`
      : "Döndüğünde rota seni bulunduğun yerden alır.",
  };
}

export function streakCopy(streak, next) {
  return {
    title: `${streak} günlük serin bu akşam bitmesin`,
    body: next ? `Tek durak yeter: ${next}.` : "Kısa bir durak seriyi yaşatır.",
  };
}

// Aksam: gun bitmedi. Suclamaz; ne kaldigini soyler.
export function unfinishedCopy(open, next, studiedToday) {
  const left = open === 1 ? "1 durak" : `${open} durak`;
  return studiedToday
    ? { title: `Güzel gidiyordun, ${left} kaldı`, body: next ? `Gün bitmeden: ${next}.` : "Gün bitmeden bir tane daha kapatabilirsin." }
    : { title: `Bugün ${left} seni bekliyor`, body: next ? `Gün bitmeden gel: ${next}. Kısa bir başlangıç yeter.` : "Gün bitmeden kısa bir başlangıç yeter." };
}

export function weeklyCopy({ questions = 0, minutes = 0 } = {}) {
  const q = Number(questions) || 0;
  const m = Number(minutes) || 0;
  if (!q && !m) return { title: "Haftanın karnesi hazır", body: "Haftana bir bak; gelecek hafta seni bekliyor." };
  const parts = [q ? `${q} soru` : null, m ? duration(m) : null].filter(Boolean).join(", ");
  return { title: "Haftanın karnesi hazır", body: `Bu hafta ${parts}. Nerede büyüdüğüne bir bak.` };
}

export function monthlyCopy(monthIndex) {
  const name = MONTHS[((monthIndex % 12) + 12) % 12];
  return {
    title: `${name} bitti`,
    body: "Bu ayın denemelerini bir öncekiyle yan yana koy: nerede büyüdüğünü gör.",
  };
}

export function trialCopy(daysSince) {
  return {
    title: "Bir deneme zamanı",
    body: `Son denemen ${daysSince} gün önceydi. Bir tane daha, hem rotayı hem tahminini günceller.`,
  };
}

// Sinav takvimindeki donum noktalari. ayt: sinav AYT de iceriyor mu.
export function milestoneCopy(days, ayt) {
  switch (days) {
    case 150:
      return { title: "Sınava 150 gün", body: "Rota bundan sonra AYT'ye daha çok yer açıyor. Yeni dengeye bir bak." };
    case 100:
      return { title: "100 gün kaldı", body: "Her gün bir durak, 100 durak eder. Bugünkü ilki seni bekliyor." };
    case 60:
      return ayt
        ? { title: "Son 60 gün", body: "Rota artık ağırlıkla AYT. Deneme sıklığını artırmanın tam zamanı." }
        : { title: "Son 60 gün", body: "Deneme sıklığını artırmanın tam zamanı." };
    case 30:
      return { title: "30 gün", body: "Bundan sonrası tekrar ve deneme. Yeni konu yükü azalıyor." };
    default:
      return { title: "Son hafta", body: "Yeni konu yok; sakin tekrar ve iyi uyku. Hazırsın." };
  }
}
