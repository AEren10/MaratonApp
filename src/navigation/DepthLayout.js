import { View } from "react-native";

import { ScreenDepth } from "../components/design/ScreenDepth";
import { SCREENS } from "../constants/screens";
import { ROOT_STACK } from "./routes";

// Butun ekranlara ortak derinlik katmani (ScreenDepth), navigator'in
// screenLayout'u olarak. Lig kendi kirmizi isimasini tasiyor; ustune notr
// isik binmesin.
// MAIN_TABS: sekmelerin kendisi; icindeki yiginlar zaten katmanli, burada
// sarilirsa isik iki kez biner ve tabbar da aydinlanir.
const NO_DEPTH = new Set([SCREENS.LEAGUE, ROOT_STACK.MAIN_TABS]);
const fill = { flex: 1 };

// Saydam ortu (Pro Onizleme vb.) alttaki ekranin ustune oturur; isik iki kez
// binip alttakini de aydinlatmasin.
export function DepthLayout({ children, route, options }) {
  if (NO_DEPTH.has(route?.name) || options?.presentation === "transparentModal") return children;
  return (
    <View style={fill}>
      {children}
      <ScreenDepth subjectKey={route?.params?.tint || route?.params?.subjectKey || null} home={route?.name === SCREENS.HOME_ROOT} />
    </View>
  );
}
