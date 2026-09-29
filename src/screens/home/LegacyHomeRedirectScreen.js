import { useLayoutEffect } from "react";
import { useNavigation } from "@react-navigation/native";

import { TAB_KEYS } from "../../navigation/tabAssignment";
import { resetToTabStackScreen } from "../../navigation/rootStackActions";

// Eski premium/odeme linkleri kayitli navigation state'lerinde kalabilir.
// V1'de ekran gostermeden guvenli ana akisa donerler.
export default function LegacyHomeRedirectScreen() {
  const navigation = useNavigation();

  useLayoutEffect(() => {
    resetToTabStackScreen(navigation, TAB_KEYS.ROTA);
  }, [navigation]);

  return null;
}
