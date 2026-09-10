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
import { C } from "./src/themes/tokens";
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
  const [fontsLoaded, fontError] = useFonts({
    Archivo_400: require("./assets/fonts/Archivo_400.ttf"),
    Archivo_500: require("./assets/fonts/Archivo_500.ttf"),
    Archivo_600: require("./assets/fonts/Archivo_600.ttf"),
    Archivo_700: require("./assets/fonts/Archivo_700.ttf"),
    Bricolage_400: require("./assets/fonts/Bricolage_400.ttf"),
  });

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded || fontError) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  // Font paketi bozulursa uygulamayı sonsuz açılış ekranında bırakma. React
  // Native sistem fontuna düşer; kullanıcı yine giriş yapıp verisine ulaşır.
  if (!fontsLoaded && !fontError) return null;

  return (
    <GestureHandlerRootView style={styles.root} onLayout={onLayoutRootView}>
      <Provider store={store}>
        <SafeAreaProvider>
          <NetworkProvider>
          <AuthProvider>
            {/* AuthProvider İÇİNDE olmalı: hidrasyon kullanıcı kimliğine bağlı,
                çıkış→giriş sonrası yeniden çalışması gerekiyor. */}
            <ReduxHydrator />
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
  // Yeni tema motoru `colors` yerine `palette` veriyor (bkz. themes/palette.js).
  const { scheme, palette } = useTheme();
  return (
    <AlertProvider>
      <View style={{ flex: 1, backgroundColor: palette.bg }}>
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
    backgroundColor: C.bg,
  },
});
