import React, { useEffect, useMemo } from "react";
import { NavigationContainer, useNavigationContainerRef } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { ActivityIndicator, AppState, View } from "react-native";

import { useAuth } from "../contexts/AuthContext";
import { useC } from "../contexts/ThemeContext";
import { useExam } from "../contexts/ExamContext";
import { DataSyncProvider } from "../contexts/DataSyncContext";
import { PremiumProvider } from "../contexts/PremiumContext";
import { flushAnalytics, track } from "../lib/analytics";

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
import { consumeAuthIntent } from "../lib/authIntent";

const Stack = createNativeStackNavigator();

// Kokte kalanlar: tabbar'in BILEREK gizlendigi tam ekran ortuler.
const ROOT_SCREENS = screensByName(ROOT_ONLY);
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
    function TabStack() {
      return (
        <Stack.Navigator screenOptions={screenOptions}>
          <Stack.Screen name={root.name} component={root.component} options={root.options} />
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

function MainTabs() {
  const before = TAB_SCREENS.filter((route) => TABS_BEFORE_FAB.includes(route.name));
  const after = TAB_SCREENS.filter((route) => !TABS_BEFORE_FAB.includes(route.name));
  return (
    <Tab.Navigator
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <TabBar {...props} />}
    >
      {before.map(renderTabStack)}
      <Tab.Screen name={ROOT_STACK.CENTER_ACTION} component={AddStub} />
      {after.map(renderTabStack)}
    </Tab.Navigator>
  );
}

function AuthStack() {
  // Karsilama'daki "Rotami kur" -> Kayit, "Hesabim var" -> Giris.
  // Niyet yoksa varsayilan Giris (donen kullanici).
  const intent = consumeAuthIntent();
  return (
    <Stack.Navigator
      screenOptions={screenOptions}
      initialRouteName={intent === "register" ? SCREENS.REGISTER : SCREENS.LOGIN}
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
    <Stack.Navigator screenOptions={screenOptions}>
      {RECOVERY_STACK_SCREENS.map(renderStackScreen)}
    </Stack.Navigator>
  );
}

function SlidesStack() {
  return (
    <Stack.Navigator screenOptions={screenOptions}>
      {SLIDES_STACK_SCREENS.map(renderStackScreen)}
    </Stack.Navigator>
  );
}

function SetupStack() {
  return (
    <Stack.Navigator screenOptions={screenOptions}>
      {SETUP_STACK_SCREENS.map(renderStackScreen)}
      <Stack.Screen name={ROOT_STACK.MAIN_TABS} component={MainTabs} />
    </Stack.Navigator>
  );
}

function AppStackInner() {
  useDeepLink();

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen name={ROOT_STACK.MAIN_TABS} component={MainTabs} />
      {ROOT_SCREENS.map(renderStackScreen)}
    </Stack.Navigator>
  );
}

function AppStack() {
  return (
    <DataSyncProvider>
      <PremiumProvider>
        <AppStackInner />
      </PremiumProvider>
    </DataSyncProvider>
  );
}

function Loading() {
  const C = useC();
  return (
    <View style={{ flex: 1, backgroundColor: C.bg, alignItems: "center", justifyContent: "center" }}>
      <ActivityIndicator color={C.accent} size="large" />
    </View>
  );
}

export default function AppNavigator() {
  const { session, loading, recoveryMode } = useAuth();
  const { onboardingDone, hasSeenSlides, loading: examLoading } = useExam();
  const navigationRef = useNavigationContainerRef();
  const navigationTracker = useMemo(() => createNavigationTracker(track), []);

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

  if (loading || examLoading) return <Loading />;

  let content;
  // Kurtarma modu HER ŞEYDEN ÖNCE gelir: oturum kurulmuş olsa bile kullanıcı
  // önce yeni şifresini belirlemeli.
  if (recoveryMode) {
    content = <RecoveryStack />;
  } else if (!hasSeenSlides) {
    content = <SlidesStack />;
  } else if (!session) {
    content = <AuthStack />;
  } else if (!onboardingDone) {
    content = <SetupStack />;
  } else {
    content = <AppStack />;
  }

  return (
    <NavigationContainer
      ref={navigationRef}
      linking={linkingConfig}
      onReady={() => navigationTracker.ready(navigationRef.getCurrentRoute())}
      onStateChange={() => navigationTracker.change(navigationRef.getCurrentRoute())}
    >
      {content}
    </NavigationContainer>
  );
}
