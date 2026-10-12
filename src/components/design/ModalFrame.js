import { useCallback, useState } from "react";
import { StyleSheet, useWindowDimensions, View } from "react-native";

// <Modal>'in tek cocugu. Modal kokunun boyu bazen kisa geliyor (iOS'ta Ana
// Sayfa'dan acilan paneller, Android'de geri donus penceresi): flex:1 kok
// icerigi kadar kaliyor ve pencere ekranin TEPESINE yapisiyor. Kok olculur;
// ekranin %60'indan kisaysa acikca ekran boyuna sabitlenir. Saglikli
// acilista hicbir sey degismez.
export function ModalFrame({ children }) {
  const win = useWindowDimensions();
  const [fixed, setFixed] = useState(false);
  const onLayout = useCallback((e) => {
    if (e.nativeEvent.layout.height < win.height * 0.6) setFixed(true);
  }, [win.height]);
  return (
    <View
      pointerEvents="box-none"
      onLayout={fixed ? undefined : onLayout}
      style={[s.fill, fixed ? { width: win.width, height: win.height } : null]}
    >
      {children}
    </View>
  );
}

const s = StyleSheet.create({ fill: { flex: 1 } });
