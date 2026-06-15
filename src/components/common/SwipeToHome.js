import { GestureDetector, Gesture } from "react-native-gesture-handler";
import { runOnJS } from "react-native-reanimated";
import { useNavigation } from "@react-navigation/native";
import { SCREENS } from "../../constants/screens";

// Tab ekranlarında (Analiz/Profil) sağa kaydırınca Ana Sayfa'ya dön.
// activeOffsetX + failOffsetY → dikey scroll'u bozmaz, sadece net yatay sağ kaydırmada tetikler.
export function SwipeToHome({ children }) {
  const navigation = useNavigation();
  const goHome = () => navigation.navigate(SCREENS.HOME);

  const pan = Gesture.Pan()
    .activeOffsetX(24)
    .failOffsetY([-16, 16])
    .onEnd((e) => {
      if (e.translationX > 70 && e.velocityX > 100) runOnJS(goHome)();
    });

  return <GestureDetector gesture={pan}>{children}</GestureDetector>;
}
