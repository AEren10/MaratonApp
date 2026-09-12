// Seviye ekraninin metin bicimlendirmesi. Sayi/ek uretimi is mantigidir,
// ekran dosyasinda durmaz.

// Turkce binlik ayirici (nokta). Intl'e guvenilmiyor: Hermes'te ICU
// yapilandirmasi platforma gore degisiyor, cikti sessizce "2,200" olabiliyor.
export function formatXP(n) {
  const v = Math.max(0, Math.round(Number(n) || 0));
  return String(v).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

const BACK_VOWELS = "aıouâ";
const FRONT_VOWELS = "eiöü";
const VOWELS = BACK_VOWELS + FRONT_VOWELS;

// Iyelik ekiyle biten unvanlar duzenli yonelme ekini almaz
// ("Maraton Efsanesi" -> "...Efsanesi'ne", "...Efsanesi'ye" DEGIL).
const IRREGULAR_DATIVE = { "Maraton Efsanesi": "Maraton Efsanesi'ne" };

// Unvana yonelme eki ekler: "Hırslı" -> "Hırslı'ya", "Uzman" -> "Uzman'a".
export function dativeTitle(title) {
  if (!title) return "";
  if (IRREGULAR_DATIVE[title]) return IRREGULAR_DATIVE[title];

  const lower = title.toLocaleLowerCase("tr");
  let lastVowel = "";
  for (let i = lower.length - 1; i >= 0; i--) {
    if (VOWELS.includes(lower[i])) { lastVowel = lower[i]; break; }
  }
  const back = lastVowel === "" || BACK_VOWELS.includes(lastVowel);
  const endsWithVowel = VOWELS.includes(lower[lower.length - 1]);
  const suffix = endsWithVowel ? (back ? "ya" : "ye") : back ? "a" : "e";
  return `${title}'${suffix}`;
}
