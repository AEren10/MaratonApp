import { GestureDetector, Gesture } from "react-native-gesture-handler";
import { runOnJS, useSharedValue } from "react-native-reanimated";
import { useNavigation } from "@react-navigation/native";
import { Dimensions } from "react-native";
import { SCREENS } from "../../constants/screens";
import { openInTab } from "../../navigation/tabJump";
import { TAB_KEYS } from "../../navigation/tabAssignment";

const { width: SCREEN_W } = Dimensions.get("window");
// Sol kenardan başlasın — scroll içeren ekranlarda yan dürtme bile tetiklemesin.
const EDGE_ZONE = 60;
// Yatay aktivasyon eşiği makul + dikey fail eşiği düşük → vertical scroll'u
// bozmaz, sade soldan-sağa flick'te çalışır. Ne çok hassas ne de ölü.
const ACTIVE_X = 24;
const FAIL_Y = 18;
const MIN_TRANSLATION = 120;
const MIN_VELOCITY = 450;

// Tab ekranlarında (Analiz/Profil) sağa kaydırınca Ana Sayfa'ya dön.
// Sıkı eşikler — aşağı scroll'a yanlışlıkla tetiklenmesin.
export function SwipeToHome({ children }) {
  const navigation = useNavigation();
  const edgeStart = useSharedValue(false);

  // SOL KENAR iOS'UN KENDI GERI HAREKETI.
  // Yigin icindeki bir ekranda (or. Profil -> Profili Duzenle) kenardan
  // kaydirmak hem sistemin geri hareketini hem bunu tetikliyordu: ekran bir
  // yandan pop edilirken bir yandan Ana Sayfa'ya gidiliyor, React Navigation
  // "bu eylem hicbir navigator tarafindan karsilanmadi" diye uyariyor ve
  // kullanici kendini Ana Sayfa'da buluyordu. Geri gidilebilen bir ekrandaysak
  // hareket devre disi: orada sistemin isi.
  const goHome = () => {
    if (navigation.canGoBack?.()) return;
    // Bare navigate(HOME) ic yiginda karsilanmayabiliyor; sekme kokune
    // gidildigi icin eylem her zaman bir navigator tarafindan ele aliniyor.
    openInTab(navigation, TAB_KEYS.ROTA, SCREENS.HOME);
  };

  const pan = Gesture.Pan()
    .manualActivation(true)
    .failOffsetY([-FAIL_Y, FAIL_Y])
    .onTouchesDown((e, manager) => {
      "worklet";
      const x = e.allTouches[0]?.x ?? SCREEN_W;
      edgeStart.value = x <= EDGE_ZONE;
      if (!edgeStart.value) manager.fail();
    })
    .onTouchesMove((_e, manager) => {
      "worklet";
      if (edgeStart.value) manager.activate();
    })
    .onEnd((e) => {
      "worklet";
      if (e.translationX < MIN_TRANSLATION) return;
      if (e.velocityX < MIN_VELOCITY) return;
      if (Math.abs(e.translationY) > Math.abs(e.translationX) * 0.4) return;
      runOnJS(goHome)();
    });

  return <GestureDetector gesture={pan}>{children}</GestureDetector>;
}
