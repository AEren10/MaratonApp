import { useCallback } from "react";
import { View, StyleSheet } from "react-native";
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
import { COLORS } from "./src/themes/tokens";

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
        <SafeAreaProvider>
          <AuthProvider>
            <ExamProvider>
              <ThemeProvider>
                <ScreenErrorBoundary>
                  <AppNavigator />
                </ScreenErrorBoundary>
              </ThemeProvider>
            </ExamProvider>
          </AuthProvider>
        </SafeAreaProvider>
      </Provider>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.dark.background,
  },
});
