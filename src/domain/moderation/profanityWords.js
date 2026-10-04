// Kufur listesi. Kelimeler NORMALLESTIRILMIS halde (kucuk harf, Turkce
// karakterler duzlestirilmis, tekrar eden harfler tek). Sunucudaki
// private.is_clean_text AYNI listeyi kullanir; tests/domain/profanity.test.mjs
// iki listenin esitligini kontrol eder -- birini degistirince digerini de.

// Kelimenin ICINDE geciyorsa uygunsuz (uzun ve ayirt edici kelimeler).
export const SUBSTRING_WORDS = [
  "orospu", "oruspu", "siktir", "sikeyim", "sikik", "sikis", "yarak", "amcik",
  "aminakoy", "pezevenk", "kaltak", "gavat", "fahise", "surtuk",
  "ibne", "pust", "gotveren", "gotunu", "anani", "ananin", "fuck", "shit",
  "bitch", "nigga", "nigger", "asshole", "pussy", "whore", "faggot",
  "porno",
];

// Yalniz TAM kelime olarak gectiginde uygunsuz (kisa, baska kelimelerin
// icinde gecebilen: "sikke", "basik", "gotik" gibi masum kelimeler korunur).
export const TOKEN_WORDS = [
  "amk", "aq", "sik", "sikim", "pic", "dick", "slut", "skm", "tasak", "tasaq",
  "bok", "cunt",
];
