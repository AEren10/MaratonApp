import { View } from "react-native";

import { ScreenDepth } from "../components/design/ScreenDepth";
import { SCREENS } from "../constants/screens";

// Sekme ekranlarina ortak derinlik katmani (ScreenDepth), navigator'in
// screenLayout'u olarak. Lig kendi kirmizi isimasini tasiyor; ustune notr
// isik binmesin.
const NO_DEPTH = new Set([SCREENS.LEAGUE]);
const fill = { flex: 1 };

export function DepthLayout({ children, route }) {
  if (NO_DEPTH.has(route?.name)) return children;
  return (
    <View style={fill}>
      {children}
      <ScreenDepth subjectKey={route?.params?.subjectKey || null} />
    </View>
  );
}
