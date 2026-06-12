import { useCallback } from "react";
import { View, StyleSheet } from "react-native";
import { StatusBar } from "expo-status-bar";
import { Provider } from "react-redux";
import { SafeAreaProvider } from "react-native-safe-area-context";
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
} from "@expo-google-fonts/inter";
import {
  SpaceGrotesk_600SemiBold,
  SpaceGrotesk_700Bold,
} from "@expo-google-fonts/space-grotesk";
import * as SplashScreen from "expo-splash-screen";

import { store } from "./src/store/store";
import { AuthProvider } from "./src/contexts/AuthContext";
import { ThemeProvider } from "./src/contexts/ThemeContext";
import { ExamProvider } from "./src/contexts/ExamContext";
import AppNavigator from "./src/navigation/AppNavigator";
import { ScreenErrorBoundary } from "./src/components/common/ScreenErrorBoundary";
import { ReduxHydrator } from "./src/store/hydrate";
import { COLORS } from "./src/themes/tokens";
import { initErrorReporting } from "./src/lib/errorReporting";
import { useTheme } from "./src/contexts/ThemeContext";

initErrorReporting();

SplashScreen.preventAutoHideAsync();

export default function App() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    SpaceGrotesk_600SemiBold,
    SpaceGrotesk_700Bold,
  });

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <View style={styles.root} onLayout={onLayoutRootView}>
      <Provider store={store}>
        <ReduxHydrator />
        <SafeAreaProvider>
          <AuthProvider>
            <ExamProvider>
              <ThemeProvider>
                <ThemedRoot />
              </ThemeProvider>
            </ExamProvider>
          </AuthProvider>
        </SafeAreaProvider>
      </Provider>
    </View>
  );
}

function ThemedRoot() {
  const { scheme, colors } = useTheme();
  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar style={scheme === "light" ? "dark" : "light"} />
      <ScreenErrorBoundary>
        <AppNavigator />
      </ScreenErrorBoundary>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.dark.background,
  },
});
