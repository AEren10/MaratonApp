import { GestureDetector, Gesture } from "react-native-gesture-handler";
import { runOnJS } from "react-native-reanimated";
import { useNavigation } from "@react-navigation/native";
import { Dimensions } from "react-native";
import { SCREENS } from "../../constants/screens";

const { width: SCREEN_W } = Dimensions.get("window");
// Sol kenardan başlasın — scroll içeren ekranlarda yan dürtme bile tetiklemesin.
const EDGE_ZONE = 60;
// Yatay aktivasyon eşiği makul + dikey fail eşiği düşük → vertical scroll'u
// bozmaz, sade soldan-sağa flick'te çalışır. Ne çok hassas ne de ölü.
const ACTIVE_X = 24;
const FAIL_Y = 18;
const MIN_TRANSLATION = 90;
const MIN_VELOCITY = 250;

// Tab ekranlarında (Analiz/Profil) sağa kaydırınca Ana Sayfa'ya dön.
// Sıkı eşikler — aşağı scroll'a yanlışlıkla tetiklenmesin.
export function SwipeToHome({ children }) {
  const navigation = useNavigation();
  const goHome = () => navigation.navigate(SCREENS.HOME);

  const pan = Gesture.Pan()
    .activeOffsetX(ACTIVE_X)
    .failOffsetY([-FAIL_Y, FAIL_Y])
    .onBegin((e) => {
      // Sol kenar dışında başlarsa gesture state'i kendisi reddedecek (manual flag).
      // RNGH'de onBegin'den fail tetikleyemiyoruz; onEnd'te kontrol ediyoruz.
    })
    .onEnd((e) => {
      const startX = e.absoluteX - e.translationX;
      if (startX > EDGE_ZONE) return; // sol kenardan başlamadı
      if (e.translationX < MIN_TRANSLATION) return;
      if (e.velocityX < MIN_VELOCITY) return;
      // Yatay > dikey: açıyı sınırla, eğri kaydırmaları reddet.
      if (Math.abs(e.translationY) > Math.abs(e.translationX) * 0.4) return;
      runOnJS(goHome)();
    });

  return <GestureDetector gesture={pan}>{children}</GestureDetector>;
}
