export function getMotivMessage({ totalQuestions, streak, totalTrials, xp }) {
  const messages = [];

  if (totalQuestions >= 1000) messages.push(`${totalQuestions} soru çözdün, müthiş tempo!`);
  else if (totalQuestions >= 500) messages.push(`${totalQuestions} soru bitti, 1000'e az kaldı!`);
  else if (totalQuestions >= 100) messages.push(`${totalQuestions} soru çözdün, harika gidiyorsun!`);
  else if (totalQuestions > 0) messages.push(`${totalQuestions} soru çözdün, devam et!`);

  if (streak >= 30) messages.push(`${streak} günlük seri! Sen bir maratoncu.`);
  else if (streak >= 14) messages.push(`${streak} günlük seri, süpersin!`);
  else if (streak >= 7) messages.push(`${streak} günlük seri, bırakmak yok!`);
  else if (streak >= 3) messages.push(`${streak} gün üst üste çalıştın, harika!`);

  if (totalTrials >= 10) messages.push(`${totalTrials} deneme girdin, veriler güçlü!`);
  else if (totalTrials >= 3) messages.push(`${totalTrials} deneme, analiz için harika!`);

  if (xp >= 5000) messages.push("Elmas lig seviyesine ulaştın!");
  else if (xp >= 2000) messages.push("Altın lig, gurur duy!");

  if (messages.length === 0) return "İlk sorunu çöz ve maratona başla!";

  return messages[Math.floor(Date.now() / 86400000) % messages.length];
}
