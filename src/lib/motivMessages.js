export function getMotivMessage({ totalQuestions, streak, totalTrials, xp }) {
  const messages = [];

  if (totalQuestions >= 1000) messages.push(`${totalQuestions} soru cozdun, muhtesem tempo!`);
  else if (totalQuestions >= 500) messages.push(`${totalQuestions} soru bitti, 1000'e az kaldi!`);
  else if (totalQuestions >= 100) messages.push(`${totalQuestions} soru cozdun, harika gidiyorsun!`);
  else if (totalQuestions > 0) messages.push(`${totalQuestions} soru cozdun, devam et!`);

  if (streak >= 30) messages.push(`${streak} gunluk seri! Sen bir maratoncu.`);
  else if (streak >= 14) messages.push(`${streak} gunluk seri, supersin!`);
  else if (streak >= 7) messages.push(`${streak} gunluk seri, birakmak yok!`);
  else if (streak >= 3) messages.push(`${streak} gun ust uste calistin, harika!`);

  if (totalTrials >= 10) messages.push(`${totalTrials} deneme girdin, veriler guclu!`);
  else if (totalTrials >= 3) messages.push(`${totalTrials} deneme, analiz icin harika!`);

  if (xp >= 5000) messages.push("Elmas lig seviyesine ulastin!");
  else if (xp >= 2000) messages.push("Altin lig, gurur duy!");

  if (messages.length === 0) return "Ilk sorunu coz ve maratona basla!";

  return messages[Math.floor(Date.now() / 86400000) % messages.length];
}
