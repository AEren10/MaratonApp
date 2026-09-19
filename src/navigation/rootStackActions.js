import { CommonActions } from "@react-navigation/native";

import { ROOT_STACK } from "./routes";

// `then` verilirse sekme yiginin ustune bir kok ekran binir (ornegin
// kurulum bitince dogrudan calisma zamanlayicisi). Tek dispatch: once
// reset sonra navigate yapmak yarisa aciktir.
export function resetToTabStackScreen(navigation, tab, screen, params, then) {
  const tabRoute = screen
    ? { name: tab, state: { routes: [{ name: screen, params }], index: 0 } }
    : { name: tab };

  navigation.dispatch(
    CommonActions.reset({
      index: then ? 1 : 0,
      routes: [
        {
          name: ROOT_STACK.MAIN_TABS,
          state: { routes: [tabRoute], index: 0 },
        },
        ...(then ? [{ name: then.screen, params: then.params }] : []),
      ],
    }),
  );
}
