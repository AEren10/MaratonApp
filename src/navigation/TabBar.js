import { useEffect, useState } from "react";
import { Keyboard, Platform, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useC } from "../contexts/ThemeContext";
import { SHADOW } from "../themes/tokens";
import { TabItem } from "./tabBar/TabItem";
import { CenterFab } from "./tabBar/CenterFab";
import { TabIndicator } from "./tabBar/TabIndicator";
import QuickAddSheet from "../screens/trial/QuickAddSheet";
import { SCREENS } from "../constants/screens";
import { TAB_ROOT_MAP } from "./tabJump";

const TABS = [
  { key: SCREENS.HOME, label: "Rota", icon: "home", hint: "Rota ana sayfasına gider" },
  { key: SCREENS.CURRICULUM_MAP, label: "Program", icon: "book", hint: "Program ekranını gösterir" },
  { key: "Add", label: "Kaydet", icon: "plus", center: true },
  { key: SCREENS.ANALYSIS, label: "Analiz", icon: "chart", hint: "Analiz ekranına gider" },
  { key: SCREENS.PROFILE, label: "Profil", icon: "user", hint: "Profil sayfanı açar" },
];

// Yuzen kapsul tabbar: kenarlardan iceride, yuzey tonu + 1px kenarlik
// (derinlik golgeyle degil). Aktif sekmenin arkasinda kayan hap.
export function TabBar({ state, navigation }) {
  const insets = useSafeAreaInsets();
  const C = useC();
  const isDark = C.scheme !== "light";
  const currentKey = state.routes[state.index].name;
  const [sheetOpen, setSheetOpen] = useState(false);
  const [width, setWidth] = useState(0);
  const keyboard = useAndroidKeyboard();
  // Iyimser secim: hap basildigi an hedefe kayar; yeni ekranin acilmasini
  // (agir ekranda yuzlerce ms) beklemez. Gercek sekme gelince sifirlanir.
  const [pendingKey, setPendingKey] = useState(null);
  useEffect(() => { setPendingKey(null); }, [currentKey]);
  const shownKey = pendingKey || currentKey;
  const activeIndex = Math.max(0, TABS.findIndex((t) => t.key === shownKey));

  // Klavye acikken Android tabbar'i klavyenin ustune tasiyordu (form
  // alaninin ustunu kapatarak). iOS'ta klavye zaten ustunu ortuyor.
  if (keyboard) return null;

  const press = (tab) => {
    const route = state.routes.find((r) => r.name === tab.key);
    const active = currentKey === tab.key;
    // Standart tabPress: ic yigin odaktaysa koke doner, kokteyse ekran
    // useScrollToTop ile en uste kayar. Eskiden olay yayilmiyordu.
    const event = route
      ? navigation.emit({ type: "tabPress", target: route.key, canPreventDefault: true })
      : { defaultPrevented: false };
    if (event.defaultPrevented) return;
    if (!active) setPendingKey(tab.key);
    if (active) {
      navigation.navigate(tab.key, { screen: TAB_ROOT_MAP[tab.key] || tab.key });
      return;
    }
    navigation.navigate(tab.key);
  };

  return (
    <>
      {/* Tasarim: "Tabbar'in ortasindaki + her kok ekrandan acilir." */}
      <QuickAddSheet
        visible={sheetOpen}
        onClose={() => setSheetOpen(false)}
        onAction={(screen, params) => navigation.navigate(screen, params)}
      />
      <View style={[s.dock, { backgroundColor: C.bg, paddingBottom: insets.bottom > 0 ? insets.bottom - 4 : 12 }]}>
        {/* Icerik kapsule sert cizgiyle degil yumusak kararmayla girer. */}
        <LinearGradient
          colors={["transparent", C.alpha(C.bg, 70), C.bg]}
          locations={[0, 0.6, 1]}
          style={s.fade}
          pointerEvents="none"
        />
        <View
          onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
          style={[s.capsule, { backgroundColor: C.surface, borderColor: C.edgeStrong }, !isDark && SHADOW.cardLight]}
        >
          {currentKey !== "Add" ? <TabIndicator index={activeIndex} slotWidth={width / TABS.length} C={C} /> : null}
          {TABS.map((tab) => (tab.center ? (
            <CenterFab key={tab.key} open={sheetOpen} onPress={() => setSheetOpen((v) => !v)} C={C} />
          ) : (
            <TabItem key={tab.key} tab={tab} active={shownKey === tab.key} onPress={() => press(tab)} C={C} />
          )))}
        </View>
      </View>
    </>
  );
}

function useAndroidKeyboard() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (Platform.OS !== "android") return undefined;
    const show = Keyboard.addListener("keyboardDidShow", () => setOpen(true));
    const hide = Keyboard.addListener("keyboardDidHide", () => setOpen(false));
    return () => { show.remove(); hide.remove(); };
  }, []);
  return open;
}

const s = StyleSheet.create({
  dock: { paddingHorizontal: 14, paddingTop: 6 },
  fade: { position: "absolute", top: -36, left: 0, right: 0, height: 36 },
  capsule: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 64,
    borderRadius: 30,
    borderWidth: 1,
    paddingHorizontal: 0,
  },
});
