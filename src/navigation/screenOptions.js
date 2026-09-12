import React, { Suspense } from "react";
import { ActivityIndicator, Platform, View } from "react-native";

import { ScreenErrorBoundary } from "../components/common/ScreenErrorBoundary";
import { C } from "../themes/tokens";

const isWeb = Platform.OS === "web";

export const screenOptions = {
  headerShown: false,
  contentStyle: { backgroundColor: C.bg },
  animation: isWeb ? "none" : "slide_from_right",
  animationDuration: 240,
  gestureEnabled: true,
  fullScreenGestureEnabled: true,
};

export const modalOptions = {
  animation: isWeb ? "none" : "slide_from_bottom",
  presentation: "modal",
  animationDuration: 280,
};

export const celebrationOptions = {
  animation: isWeb ? "none" : "fade_from_bottom",
  animationDuration: 320,
  gestureEnabled: false,
};

// Icerigi ORTEN degil, uzerine OTURAN yari saydam katman (Pro Onizleme).
// Altindaki ekran gorunur kalir; tasarimin "kilitli alan bulanik" dili.
export const overlayOptions = {
  animation: isWeb ? "none" : "fade",
  presentation: "transparentModal",
  animationDuration: 240,
  contentStyle: { backgroundColor: "transparent" },
};

export const detailOptions = {
  animation: isWeb ? "none" : "fade",
  animationDuration: 280,
};

function LazyFallback() {
  return (
    <View style={{ flex: 1, backgroundColor: C.bg, alignItems: "center", justifyContent: "center" }}>
      <ActivityIndicator color={C.accent} size="large" />
    </View>
  );
}

export function withScreenBoundary(Comp) {
  const Wrapped = (props) => (
    <ScreenErrorBoundary navigation={props.navigation}>
      <Suspense fallback={<LazyFallback />}>
        <Comp {...props} />
      </Suspense>
    </ScreenErrorBoundary>
  );
  Wrapped.displayName = `EB(${Comp.displayName || Comp.name || "Screen"})`;
  return Wrapped;
}
