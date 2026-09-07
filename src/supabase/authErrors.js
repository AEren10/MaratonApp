// Supabase auth hatalarını Türkçeleştirir.
//
// Sorun: LoginScreen/RegisterScreen doğrudan `err.message` gösteriyordu, yani
// kullanıcı ham İngilizce görüyordu:
//   "Invalid login credentials"
//   "User already registered"
//   "For security purposes, you can only request this after 51 seconds"
// Bu hem anlaşılmaz hem de uygulamanın yarım bittiği izlenimi veriyor.
//
// handleSupabaseError zaten var ama auth.js onu kullanmıyor (storage.js
// kullanıyor). Auth hataları ayrı bir dil istediği için burada ele alınıyor.

const RULES = [
  // Giriş
  { match: /invalid login credentials|invalid_credentials/i,
    message: "E-posta veya şifre hatalı." },
  { match: /email not confirmed|email_not_confirmed/i,
    message: "E-postanı doğrulaman gerekiyor. Gelen kutunu kontrol et." },
  { match: /user not found/i,
    message: "Bu e-postayla kayıtlı hesap bulunamadı." },

  // Kayıt
  { match: /user already registered|already been registered/i,
    message: "Bu e-posta zaten kayıtlı. Giriş yapmayı dene." },
  { match: /password should be at least (\d+)/i,
    message: (m) => `Şifre en az ${m[1]} karakter olmalı.` },
  { match: /weak.?password|password.*too weak/i,
    message: "Şifre çok zayıf. Daha uzun ve karışık bir şifre seç." },
  { match: /signup.*disabled|signups not allowed/i,
    message: "Kayıt şu an kapalı." },
  { match: /unable to validate email|invalid email/i,
    message: "Geçerli bir e-posta adresi gir." },

  // Hız sınırı
  { match: /for security purposes.*after (\d+) seconds?/i,
    message: (m) => `Çok sık denedin. ${m[1]} saniye sonra tekrar dene.` },
  { match: /rate limit|too many requests|over_email_send_rate_limit/i,
    message: "Çok fazla deneme yaptın. Biraz bekleyip tekrar dene." },

  // Oturum
  { match: /jwt expired|token has expired|refresh_token_not_found/i,
    message: "Oturumun sona erdi. Tekrar giriş yap." },
  { match: /same.*password|new password should be different/i,
    message: "Yeni şifre eskisiyle aynı olamaz." },
  { match: /reauthentication|requires recent login/i,
    message: "Güvenlik için tekrar giriş yapman gerekiyor." },

  // Ağ
  { match: /network request failed|fetch failed|network error/i,
    message: "Bağlantı kurulamadı. İnternetini kontrol et." },
  { match: /timeout|timed out/i,
    message: "İşlem zaman aşımına uğradı. Tekrar dene." },
];

const FALLBACK = "Bir sorun oluştu. Lütfen tekrar dene.";

/**
 * @param error Supabase'den gelen hata
 * @returns kullanıcıya gösterilebilir Türkçe mesaj
 */
export function authErrorMessage(error) {
  if (!error) return FALLBACK;
  const raw = error.message || error.error_description || String(error);

  for (const rule of RULES) {
    const m = raw.match(rule.match);
    if (m) {
      return typeof rule.message === "function" ? rule.message(m) : rule.message;
    }
  }

  // Eşleşmeyen hatayı olduğu gibi GÖSTERME — İngilizce teknik metin
  // kullanıcıya bir şey anlatmaz. Geliştirme sırasında konsola düşsün.
  if (__DEV__) console.warn("[auth] eşleşmeyen hata:", raw);
  return FALLBACK;
}
