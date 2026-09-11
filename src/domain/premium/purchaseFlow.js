// ÖDEME AKIŞI — durum makinesi.
//
// Tasarım AKIŞ 15: "Ödeme · Kart → Ödeme İşleniyor → Ödeme Başarılı /
// Ödeme Başarısız → Deneme Bitti".
//
// SAĞLAYICIDAN BAĞIMSIZ. RevenueCat anahtarları build env'den geldiğinde
// `purchases.js` bu makineye mağaza olaylarını besler; anahtar yoksa üretimde
// dev deneme fallback'i açılmaz. Ekranlar sağlayıcıya değil bu durumlara bakar.
//
// Neden durum makinesi: satın alma en kırılgan akış. Kullanıcı ödeme
// sayfasını kapatır, ağ kopar, mağaza "pending" döner (aile onayı), ya da
// iki kez basar. Bunları ekran içinde ad-hoc if'lerle yönetmek hataya açık.

export const PURCHASE_STATE = {
  IDLE: "idle",
  SELECTING: "selecting",     // plan seçimi
  PROCESSING: "processing",   // mağaza sayfası açık
  PENDING: "pending",         // mağaza onay bekliyor (ör. aile izni)
  SUCCESS: "success",
  FAILED: "failed",
  CANCELLED: "cancelled",     // kullanıcı vazgeçti — HATA DEĞİL
  RESTORED: "restored",       // önceki satın alma geri yüklendi
};

export const PURCHASE_EVENT = {
  SELECT_PLAN: "select_plan",
  START: "start",
  STORE_PENDING: "store_pending",
  STORE_SUCCESS: "store_success",
  STORE_FAILURE: "store_failure",
  USER_CANCEL: "user_cancel",
  RESTORE_SUCCESS: "restore_success",
  RESET: "reset",
};

// Geçerli geçişler. Tanımsız geçiş YOK SAYILIR — böylece çift dokunma ya da
// geç gelen mağaza cevabı durumu bozmaz.
const TRANSITIONS = {
  [PURCHASE_STATE.IDLE]: {
    [PURCHASE_EVENT.SELECT_PLAN]: PURCHASE_STATE.SELECTING,
    [PURCHASE_EVENT.RESTORE_SUCCESS]: PURCHASE_STATE.RESTORED,
  },
  [PURCHASE_STATE.SELECTING]: {
    [PURCHASE_EVENT.SELECT_PLAN]: PURCHASE_STATE.SELECTING,
    [PURCHASE_EVENT.START]: PURCHASE_STATE.PROCESSING,
    [PURCHASE_EVENT.RESTORE_SUCCESS]: PURCHASE_STATE.RESTORED,
    [PURCHASE_EVENT.RESET]: PURCHASE_STATE.IDLE,
  },
  [PURCHASE_STATE.PROCESSING]: {
    // START tekrar gelirse YOK SAYILIR — çift satın alma koruması.
    [PURCHASE_EVENT.STORE_SUCCESS]: PURCHASE_STATE.SUCCESS,
    [PURCHASE_EVENT.STORE_PENDING]: PURCHASE_STATE.PENDING,
    [PURCHASE_EVENT.STORE_FAILURE]: PURCHASE_STATE.FAILED,
    [PURCHASE_EVENT.USER_CANCEL]: PURCHASE_STATE.CANCELLED,
  },
  [PURCHASE_STATE.PENDING]: {
    [PURCHASE_EVENT.STORE_SUCCESS]: PURCHASE_STATE.SUCCESS,
    [PURCHASE_EVENT.STORE_FAILURE]: PURCHASE_STATE.FAILED,
    [PURCHASE_EVENT.RESET]: PURCHASE_STATE.IDLE,
  },
  [PURCHASE_STATE.FAILED]: {
    [PURCHASE_EVENT.START]: PURCHASE_STATE.PROCESSING,
    [PURCHASE_EVENT.SELECT_PLAN]: PURCHASE_STATE.SELECTING,
    [PURCHASE_EVENT.RESET]: PURCHASE_STATE.IDLE,
  },
  [PURCHASE_STATE.CANCELLED]: {
    [PURCHASE_EVENT.START]: PURCHASE_STATE.PROCESSING,
    [PURCHASE_EVENT.SELECT_PLAN]: PURCHASE_STATE.SELECTING,
    [PURCHASE_EVENT.RESET]: PURCHASE_STATE.IDLE,
  },
  [PURCHASE_STATE.SUCCESS]: {
    [PURCHASE_EVENT.RESET]: PURCHASE_STATE.IDLE,
  },
  [PURCHASE_STATE.RESTORED]: {
    [PURCHASE_EVENT.RESET]: PURCHASE_STATE.IDLE,
  },
};

/** Geçiş uygula. Geçersizse ESKİ durumu döndürür (yok sayar). */
export function transition(state, event) {
  const next = TRANSITIONS[state]?.[event];
  return next || state;
}

export function canTransition(state, event) {
  return !!TRANSITIONS[state]?.[event];
}

/** Terminal durum mu — ekran kapanabilir/yönlenebilir. */
export function isTerminal(state) {
  return state === PURCHASE_STATE.SUCCESS || state === PURCHASE_STATE.RESTORED;
}

/**
 * Mağaza hatasını kullanıcı diline çevirir.
 *
 * VAZGEÇME HATA DEĞİLDİR: kullanıcı ödeme sayfasını kapattığında "Ödeme
 * başarısız" göstermek onu suçlamaktır. Ayrı durum, ayrı dil.
 */
export function describeFailure(error) {
  if (!error) return { title: "Ödeme tamamlanamadı", message: "Tekrar deneyebilirsin.", retryable: true };

  if (error.userCancelled) {
    return { title: null, message: null, retryable: true, cancelled: true };
  }

  const code = error.code || error.readableErrorCode || "";
  const msg = (error.message || "").toLowerCase();

  if (code.includes("NETWORK") || msg.includes("network") || msg.includes("internet")) {
    return {
      title: "Bağlantı sorunu",
      message: "İnternetini kontrol edip tekrar dene. Ücret alınmadı.",
      retryable: true,
    };
  }
  if (code.includes("PAYMENT_PENDING") || msg.includes("pending")) {
    return {
      title: "Onay bekleniyor",
      message: "Mağaza satın almayı onaylayınca premium açılacak.",
      retryable: false,
    };
  }
  if (code.includes("PRODUCT_NOT_AVAILABLE") || msg.includes("not available")) {
    return {
      title: "Şu an satın alınamıyor",
      message: "Bu paket geçici olarak kullanılamıyor. Daha sonra tekrar dene.",
      retryable: false,
    };
  }
  if (code.includes("ALREADY_OWNED") || msg.includes("already")) {
    return {
      title: "Zaten sahipsin",
      message: "Bu abonelik hesabında mevcut. 'Satın alımları geri yükle' ile açabilirsin.",
      retryable: false,
      shouldRestore: true,
    };
  }

  return {
    title: "Ödeme tamamlanamadı",
    message: "Bir sorun oldu, ücret alınmadıysa tekrar deneyebilirsin.",
    retryable: true,
  };
}

/** "Deneme Bitti" durumu — deneme süresi dolmuş, premium yok. */
export function trialExpiredStatus({ trialEndsAt, isPremium, now = new Date() }) {
  if (isPremium || !trialEndsAt) return { expired: false, daysAgo: null };
  const end = new Date(trialEndsAt);
  if (Number.isNaN(end.getTime())) return { expired: false, daysAgo: null };
  if (end > now) return { expired: false, daysLeft: Math.ceil((end - now) / 86400000) };
  return { expired: true, daysAgo: Math.floor((now - end) / 86400000) };
}

export const PURCHASE_STATE_LABELS = {
  [PURCHASE_STATE.IDLE]: "",
  [PURCHASE_STATE.SELECTING]: "Plan seç",
  [PURCHASE_STATE.PROCESSING]: "Ödeme işleniyor…",
  [PURCHASE_STATE.PENDING]: "Onay bekleniyor",
  [PURCHASE_STATE.SUCCESS]: "Premium açıldı",
  [PURCHASE_STATE.FAILED]: "Ödeme tamamlanamadı",
  [PURCHASE_STATE.CANCELLED]: "Vazgeçildi",
  [PURCHASE_STATE.RESTORED]: "Aboneliğin geri yüklendi",
};
