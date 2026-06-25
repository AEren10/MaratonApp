import { useCallback } from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";

if (Text.defaultProps == null) Text.defaultProps = {};
Text.defaultProps.maxFontSizeMultiplier = 1.3;
if (TextInput.defaultProps == null) TextInput.defaultProps = {};
TextInput.defaultProps.maxFontSizeMultiplier = 1.3;
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { StatusBar } from "expo-status-bar";
import { Provider } from "react-redux";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";

import { store } from "./src/store/store";
import { AuthProvider } from "./src/contexts/AuthContext";
import { ThemeProvider } from "./src/contexts/ThemeContext";
import { ExamProvider } from "./src/contexts/ExamContext";
import AppNavigator from "./src/navigation/AppNavigator";
import { ScreenErrorBoundary } from "./src/components/common/ScreenErrorBoundary";
import { AlertProvider } from "./src/contexts/AlertContext";
import { NetworkProvider } from "./src/contexts/NetworkContext";
import { ReduxHydrator } from "./src/store/hydrate";
import { COLORS } from "./src/themes/tokens";
import { initErrorReporting } from "./src/lib/errorReporting";
import { useTheme } from "./src/contexts/ThemeContext";
import { applyNotifPrefs, getNotifPrefs } from "./src/lib/notifications";
import OfflineBanner from "./src/components/common/OfflineBanner";
import { loadHapticPref } from "./src/lib/haptics";

initErrorReporting();
loadHapticPref();

SplashScreen.preventAutoHideAsync();

async function initNotifications() {
  try {
    const prefs = await getNotifPrefs();
    await applyNotifPrefs(prefs);
  } catch (_) {}
}
initNotifications();

export default function App() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular: require("./assets/fonts/Inter_400Regular.ttf"),
    Inter_500Medium: require("./assets/fonts/Inter_500Medium.ttf"),
    Inter_600SemiBold: require("./assets/fonts/Inter_600SemiBold.ttf"),
    SpaceGrotesk_600SemiBold: require("./assets/fonts/SpaceGrotesk_600SemiBold.ttf"),
    SpaceGrotesk_700Bold: require("./assets/fonts/SpaceGrotesk_700Bold.ttf"),
  });

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <GestureHandlerRootView style={styles.root} onLayout={onLayoutRootView}>
      <Provider store={store}>
        <ReduxHydrator />
        <SafeAreaProvider>
          <NetworkProvider>
          <AuthProvider>
            <ExamProvider>
              <ThemeProvider>
                <ThemedRoot />
              </ThemeProvider>
            </ExamProvider>
          </AuthProvider>
          </NetworkProvider>
        </SafeAreaProvider>
      </Provider>
    </GestureHandlerRootView>
  );
}

function ThemedRoot() {
  const { scheme, colors } = useTheme();
  return (
    <AlertProvider>
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <OfflineBanner />
        <StatusBar style={scheme === "light" ? "dark" : "light"} />
        <ScreenErrorBoundary>
          <AppNavigator />
        </ScreenErrorBoundary>
      </View>
    </AlertProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.light.background,
  },
});
