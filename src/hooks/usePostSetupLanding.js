import { useEffect } from "react";

import { consumePostSetupLanding } from "../lib/postSetupLanding";
import { resetToTabStackScreen } from "../navigation/rootStackActions";

// AppStackInner kurulurken bekleyen kurulum-sonrasi hedefi uygular
// (bkz. lib/postSetupLanding). Navigator'in ilk durumu otursun diye bir tur
// bekleniyor; reset basarisiz olursa kullanici zaten Ana Sayfa'dadir.
export function usePostSetupLanding() {
  useEffect(() => {
    // Hedef zamanlayicinin ICINDE okunur: StrictMode'daki cift effect
    // ilk turda tuketip iptal edilirse hedef kaybolmasin.
    const timer = setTimeout(() => {
      const landing = consumePostSetupLanding();
      // Varsayilan hedef zaten Ana Sayfa; yalniz ekran/ust ekran varsa reset.
      if (!landing || (!landing.screen && !landing.then)) return;
      resetToTabStackScreen(null, landing.tab, landing.screen, undefined, landing.then);
    }, 0);
    return () => clearTimeout(timer);
  }, []);
}
