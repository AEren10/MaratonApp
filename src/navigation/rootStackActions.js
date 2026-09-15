import { CommonActions } from "@react-navigation/native";

import { ROOT_STACK } from "./routes";

export function resetToTabStackScreen(navigation, tab, screen, params) {
  const tabRoute = screen
    ? { name: tab, state: { routes: [{ name: screen, params }], index: 0 } }
    : { name: tab };

  navigation.dispatch(
    CommonActions.reset({
      index: 0,
      routes: [{
        name: ROOT_STACK.MAIN_TABS,
        state: {
          routes: [tabRoute],
          index: 0,
        },
      }],
    }),
  );
}
