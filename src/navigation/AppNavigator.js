import React, { useCallback, useEffect, useMemo, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { navigationRef, markNavigationReady } from "./navigationRef";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { ActivityIndicator, AppState, Easing, View } from "react-native";
import { ANIMATION } from "../themes/tokens";
import { DepthLayout } from "./DepthLayout";

import { useAuth } from "../contexts/AuthContext";
import { useC } from "../contexts/ThemeContext";
import { useExam } from "../contexts/ExamContext";
import { DataSyncProvider } from "../contexts/DataSyncContext";
import { PremiumProvider } from "../contexts/PremiumContext";
import { flushAnalytics, startAnalyticsSession, track } from "../lib/analytics";

import { TabBar } from "./TabBar";
import { createNavigationTracker } from "./analytics/navigationTracker";
import { linkingConfig } from "./linking";
import { SCREENS } from "../constants/screens";
import { ROOT_STACK } from "./routes";
import { ROOT_ONLY, TAB_KEYS, TAB_STACKS } from "./tabAssignment";
import { screenOptions } from "./screenOptions";
import {
  screensByName,
  AUTH_STACK_SCREENS,
  RECOVERY_STACK_SCREENS,
  SETUP_STACK_SCREENS,
  SLIDES_STACK_SCREENS,
  TAB_SCREENS,
} from "./screenRegistry";
import { useDeepLink } from "../hooks/useDeepLink";
import { usePostSetupLanding } from "../hooks/usePostSetupLanding";
import { usePendingPreviewSetup } from "../hooks/usePendingPreviewSetup";
import { consumeAuthIntent } from "../lib/authIntent";
import { ROOT_GATE, resolveRootGate } from "./rootGate";

const Stack = createNativeStackNavigator();

// Kokte kalanlar: tabbar'in BILEREK gizlendigi tam ekran ortuler.
const ROOT_SCREENS = screensByName(ROOT_ONLY);
const SETUP_SCREEN_NAMES = new Set(SETUP_STACK_SCREENS.map((route) => route.name));
const SETUP_ROOT_SCREENS = ROOT_SCREENS.filter((route) => !SETUP_SCREEN_NAMES.has(route.name));
const Tab = createBottomTabNavigator();

function AddStub() {
  return null;
}

function renderStackScreen(route) {
  return (
    <Stack.Screen
      key={route.name}
      name={route.name}
      component={route.component}
      options={route.options}
    />
  );
}

function renderTabScreen(route) {
  return <Tab.Screen key={route.name} name={route.name} component={route.component} />;
}

// Her sekme kendi stack'i — tasarimin "Tabbar bozulmaz" kurali.
// Bilesenler modul seviyesinde BIR KEZ uretiliyor; render icinde uretilse
// her render'da yeni tip olusur ve sekme her dokunusta state'ini kaybederdi.
const TAB_STACK_COMPONENTS = new Map(
  TAB_SCREENS.map((root) => {
    const inner = screensByName(TAB_STACKS[root.name] || []);
    const rootScreenName = {
      [SCREENS.HOME]: SCREENS.HOME_ROOT,
      [SCREENS.CURRICULUM_MAP]: SCREENS.CURRICULUM_MAP_ROOT,
      [SCREENS.ANALYSIS]: SCREENS.ANALYSIS_ROOT,
      [SCREENS.PROFILE]: SCREENS.PROFILE_ROOT,
    }[root.name] || root.name;

    function TabStack() {
      return (
        <Stack.Navigator screenOptions={screenOptions} screenLayout={DepthLayout}>
          <Stack.Screen name={rootScreenName} component={root.component} options={root.options} />
          {inner.map(renderStackScreen)}
        </Stack.Navigator>
      );
    }
    TabStack.displayName = `TabStack(${root.name})`;
    return [root.name, TabStack];
  }),
);

function renderTabStack(root) {
  return (
    <Tab.Screen
      key={root.name}
      name={root.name}
      component={TAB_STACK_COMPONENTS.get(root.name)}
    />
  );
}

// Tabbar'in kendi sirasi: ROTA · PROGRAM · [+] · ANALIZ · PROFIL
const TABS_BEFORE_FAB = [TAB_KEYS.ROTA, TAB_KEYS.PROGRAM];
const BEFORE_FAB_SCREENS = TAB_SCREENS.filter((route) => TABS_BEFORE_FAB.includes(route.name));
const AFTER_FAB_SCREENS = TAB_SCREENS.filter((route) => !TABS_BEFORE_FAB.includes(route.name));

const TAB_NAV_OPTIONS = {
  headerShown: false,
  lazy: true,
  // Sekme gecisi tek karede degil, kisa bir solmayla (kullanici, 4 Ekim:
  // "+ harika aciliyor, sekmeler smooth degil"). Yerel surucude, JS beklemez.
  animation: "fade",
  transitionSpec: { animation: "timing", config: { duration: ANIMATION.duration.fast, easing: Easing.bezier(...ANIMATION.easing.easeOut) } },
  freezeOnBlur: true,
  detachInactiveScreens: true,
};

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={TAB_NAV_OPTIONS}
      tabBar={(props) => <TabBar {...props} />}
    >
      {BEFORE_FAB_SCREENS.map(renderTabStack)}
      <Tab.Screen name={ROOT_STACK.CENTER_ACTION} component={AddStub} />
      {AFTER_FAB_SCREENS.map(renderTabStack)}
    </Tab.Navigator>
  );
}

function AuthStack() {
  // Karsilama'daki "Rotami kur" -> once hesapsiz rota onizlemesi, sonra
  // Kayit; "Hesabim var" -> Giris. Niyet yoksa varsayilan Giris (donen kullanici).
  const intent = consumeAuthIntent();
  return (
    <Stack.Navigator
      screenOptions={screenOptions}
      screenLayout={DepthLayout}
      initialRouteName={intent === "register" ? SCREENS.ROUTE_PREVIEW : SCREENS.LOGIN}
    >
      {AUTH_STACK_SCREENS.map(renderStackScreen)}
    </Stack.Navigator>
  );
}

// ŞİFRE SIFIRLAMA YIĞINI
//
// Sıfırlama linki bir oturum kurduğu için, aşağıdaki seçim yalnızca session'a
// baksaydı AuthStack anında AppStack ile değişir ve şifre formu kullanıcı
// yazamadan unmount olurdu. Kurtarma akışı bitene kadar bu yığın gösteriliyor.
function RecoveryStack() {
  return (
    <Stack.Navigator screenOptions={screenOptions} screenLayout={DepthLayout}>
      {RECOVERY_STACK_SCREENS.map(renderStackScreen)}
    </Stack.Navigator>
  );
}

function SlidesStack() {
  return (
    <Stack.Navigator screenOptions={screenOptions} screenLayout={DepthLayout}>
      {SLIDES_STACK_SCREENS.map(renderStackScreen)}
    </Stack.Navigator>
  );
}

function SetupStack() {
  // "Kurulum Yarim" YALNIZCA yarim kalmis kuruluma donen kullaniciya gosterilir.
  // Yeni kaydolan kullanicinin ilk gordugu ekran Hedef Sec olmali; tasarimin
  // Kurulum Yarim metni ("Sinavini secmissin ama hedefini belirlememissin")
  // zaten ilerleme oldugunu varsayiyor.
  // Kayit oncesi rota onizlemesinden gelen yeni kullanici sinavi zaten secti:
  // kurulum dogrudan Hedef'ten baslar (usePendingPreviewSetup sinavi yazar).
  const { examType } = useExam();
  const fromPreview = usePendingPreviewSetup();
  const resuming = !!examType;
  const initial = fromPreview ? SCREENS.GOAL_SETUP : resuming ? SCREENS.SETUP_INCOMPLETE : SCREENS.EXAM_SETUP;
  return (
    <Stack.Navigator
      screenOptions={screenOptions}
      screenLayout={DepthLayout}
      initialRouteName={initial}
    >
      {SETUP_STACK_SCREENS.map(renderStackScreen)}
      <Stack.Screen name={ROOT_STACK.MAIN_TABS} component={MainTabs} />
      {SETUP_ROOT_SCREENS.map(renderStackScreen)}
    </Stack.Navigator>
  );
}

function AppStackInner() {
  useDeepLink();
  usePostSetupLanding();

  return (
    <Stack.Navigator screenOptions={screenOptions} screenLayout={DepthLayout}>
      <Stack.Screen name={ROOT_STACK.MAIN_TABS} component={MainTabs} />
      {ROOT_SCREENS.map(renderStackScreen)}
    </Stack.Navigator>
  );
}

function SessionProviders({ children }) {
  return (
    <DataSyncProvider>
      <PremiumProvider>
        {children}
      </PremiumProvider>
    </DataSyncProvider>
  );
}

import { AppLaunchLoading } from "../components/common/AppLaunchLoading";

function Loading() {
  return <AppLaunchLoading />;
}

export default function AppNavigator() {
  const { session, loading, recoveryMode } = useAuth();
  const { onboardingDone, hasSeenSlides, profileSettling, loading: examLoading } = useExam();
  const navigationTracker = useMemo(
    () => createNavigationTracker(track, { startSession: startAnalyticsSession }),
    [],
  );

  useEffect(() => {
    let appState = AppState.currentState;
    const subscription = AppState.addEventListener("change", (nextState) => {
      const route = navigationRef.getCurrentRoute();
      const wasActive = appState === "active";
      const isActive = nextState === "active";

      if (wasActive && !isActive) {
        navigationTracker.pause(route, nextState === "background" ? "background" : "inactive");
        flushAnalytics().catch(() => {});
      } else if (!wasActive && isActive) {
        navigationTracker.resume(route);
      }

      appState = nextState;
    });

    return () => subscription.remove();
  }, [navigationRef, navigationTracker]);

  // Acilis animasyonu bitmeden sayfa atlamasin: veri hazir olsa bile
  // animasyon sonuna kadar oynar (introDone), sonra gecilir.
  const [introDone, setIntroDone] = useState(false);
  const finishIntro = useCallback(() => setIntroDone(true), []);
  if (loading || examLoading || !introDone) return <AppLaunchLoading onDone={finishIntro} />;

  let content;
  // Kurtarma modu HER ŞEYDEN ÖNCE gelir: oturum kurulmuş olsa bile kullanıcı
  // önce yeni şifresini belirlemeli. Sira: navigation/rootGate.
  const gate = resolveRootGate({
    recoveryMode, hasSeenSlides, hasSession: !!session, onboardingDone, profileSettling,
  });
  if (gate === ROOT_GATE.RECOVERY) {
    content = <RecoveryStack />;
  } else if (gate === ROOT_GATE.SLIDES) {
    content = <SlidesStack />;
  } else if (gate === ROOT_GATE.AUTH) {
    content = <AuthStack />;
  } else if (gate === ROOT_GATE.PROFILE_LOADING) {
    content = <Loading />;
  } else if (gate === ROOT_GATE.SETUP) {
    content = (
      <SessionProviders>
        <SetupStack />
      </SessionProviders>
    );
  } else {
    content = (
      <SessionProviders>
        <AppStackInner />
      </SessionProviders>
    );
  }

  return (
    <NavigationContainer
      ref={navigationRef}
      linking={linkingConfig}
      onReady={() => {
        markNavigationReady();
        navigationTracker.ready(navigationRef.getCurrentRoute());
      }}
      onStateChange={() => navigationTracker.change(navigationRef.getCurrentRoute())}
    >
      {content}
    </NavigationContainer>
  );
}
