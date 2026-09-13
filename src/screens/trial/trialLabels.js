// Deneme turunun kisa etiketi (tasarim: "TYT", "AYT", "Branş").
const SHORT = { TYT: "TYT", AYT_SAY: "AYT", AYT_EA: "AYT", AYT_SOZ: "AYT", AYT: "AYT", LGS: "LGS", BRANCH: "Branş" };

export function trialShortLabel(code, fallback = "Deneme") {
  return SHORT[code] || fallback;
}
