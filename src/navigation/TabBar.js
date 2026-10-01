import { useState } from "react";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useC } from "../contexts/ThemeContext";
import { TabItem } from "./tabBar/TabItem";
import { CenterFab } from "./tabBar/CenterFab";
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

export function TabBar({ state, navigation }) {
  const insets = useSafeAreaInsets();
  const C = useC();
  const currentKey = state.routes[state.index].name;
  const [sheetOpen, setSheetOpen] = useState(false);

  return (
    <>
      {/* Tasarim: "Tabbar'in ortasindaki + her kok ekrandan acilir." */}
      <QuickAddSheet
        visible={sheetOpen}
        onClose={() => setSheetOpen(false)}
        onAction={(screen, params) => navigation.navigate(screen, params)}
      />
      {/* Icerik tabbar'a sert cizgiyle degil yumusak kararmayla girer: 20 -> 52px. */}
      <LinearGradient
        colors={["transparent", C.surface + "59", C.surface + "D9", C.surface]}
        locations={[0, 0.45, 0.85, 1]}
        style={{ position: "absolute", top: -52, left: 0, right: 0, height: 52 }}
        pointerEvents="none"
      />
      <View style={{
        flexDirection: "row",
        backgroundColor: C.surface,
        paddingTop: 8,
        paddingBottom: insets.bottom > 0 ? insets.bottom : 12,
        paddingHorizontal: 8,
      }}>
        {TABS.map((tab) => {
          if (tab.center) {
            return <CenterFab key={tab.key} open={sheetOpen} onPress={() => setSheetOpen((v) => !v)} C={C} />;
          }
          const active = currentKey === tab.key;
          return (
            <TabItem
              key={tab.key}
              tab={tab}
              active={active}
              onPress={() => {
                // ZATEN BU SEKMEDEYSEK yigini kokune don.
                //
                // Duz navigate(tab.key) odaklanmis sekmede HICBIR SEY yapmiyor:
                // ic yigin oldugu yerde kaliyor. Home'a bagli bir ekrandayken
                // Home'a basan kullanici ekranda sikisip kaliyordu -- ozellikle
                // geri tusu olmayan ekranlarda tek cikis yolu buydu.
                //
                // Kok ekranin adina navigate etmek yigini oraya kadar acar.
                if (active) {
                  navigation.navigate(tab.key, { screen: TAB_ROOT_MAP[tab.key] || tab.key });
                  return;
                }
                navigation.navigate(tab.key);
              }}
              C={C}
            />
          );
        })}
      </View>
    </>
  );
}
