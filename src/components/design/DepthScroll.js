import { createContext, useContext } from "react";
import Animated, { useAnimatedScrollHandler } from "react-native-reanimated";

// Ekranin kaydirma konumu -> ust isik (ScreenDepth). DepthLayout her ekrana
// bir paylasilan deger verir; ekran ScrollView yerine DepthScrollView
// kullanirsa isik icerik yukari kaydikca soner (metnin ustunde renkli isik
// kalmasin). Hesap tamamen UI is parcaciginda; React yeniden cizmez.
export const DepthScrollContext = createContext(null);

export function DepthScrollView(props) {
  const scrollY = useContext(DepthScrollContext);
  const onScroll = useAnimatedScrollHandler({
    onScroll: (e) => { if (scrollY) scrollY.set(e.contentOffset.y); },
  }, [scrollY]);
  return <Animated.ScrollView scrollEventThrottle={16} {...props} onScroll={onScroll} />;
}
