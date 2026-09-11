import { SCREENS } from "../constants/screens.js";
import { PRODUCT_FLOW_IDS } from "../constants/productFlows.js";
import { TAB_KEYS, TAB_STACKS } from "./tabAssignment.js";

export const ROOT_STACK = {
  MAIN_TABS: "MainTabs",
  CENTER_ACTION: "Add",
};

export const ROUTE_CONFIGS = {
  [SCREENS.LOGIN]: { path: "giris", flow: PRODUCT_FLOW_IDS.ONBOARDING, deepLink: true },
  [SCREENS.REGISTER]: { path: "kayit", flow: PRODUCT_FLOW_IDS.ONBOARDING, deepLink: true },
  [SCREENS.FORGOT_PASSWORD]: { path: "sifre-sifirla", flow: PRODUCT_FLOW_IDS.ONBOARDING, deepLink: true },
  // Şifre sıfırlama e-postasındaki linkin düştüğü yer. Supabase Auth
  // yapılandırmasında da izinli olmalı (uri_allow_list: maraton://*).
  [SCREENS.SET_NEW_PASSWORD]: { path: "sifre-belirle", flow: PRODUCT_FLOW_IDS.ONBOARDING, deepLink: true },
  [SCREENS.ONBOARDING]: { path: "karsilama", flow: PRODUCT_FLOW_IDS.ONBOARDING, deepLink: false },
  [SCREENS.EXAM_SETUP]: { path: "kurulum/sinav", flow: PRODUCT_FLOW_IDS.ONBOARDING, deepLink: false },
  [SCREENS.GOAL_SETUP]: { path: "kurulum/hedef", flow: PRODUCT_FLOW_IDS.ONBOARDING, deepLink: false },
  [SCREENS.LEVEL_TEST]: { path: "kurulum/seviye", flow: PRODUCT_FLOW_IDS.ONBOARDING, deepLink: false },
  [SCREENS.ROUTE_READY]: { path: "kurulum/rota-hazir", flow: PRODUCT_FLOW_IDS.ONBOARDING, deepLink: false },
  [SCREENS.NOTIFICATION_PERMISSION]: { path: "kurulum/bildirim", flow: PRODUCT_FLOW_IDS.ONBOARDING, deepLink: false },
  [SCREENS.SETUP_INCOMPLETE]: { path: "kurulum/yarim", flow: PRODUCT_FLOW_IDS.ONBOARDING, deepLink: false },

  [SCREENS.HOME]: { path: "home", flow: PRODUCT_FLOW_IDS.DAILY_LOOP, deepLink: true, tab: true },
  [SCREENS.DAILY_PLAN]: { path: "dersler", flow: PRODUCT_FLOW_IDS.PLAN_STOPS, deepLink: true, tab: true },
  [SCREENS.STUDY_LOG]: { path: "calisma/gecmis", flow: PRODUCT_FLOW_IDS.STUDY_SESSION, deepLink: true },
  [SCREENS.ANALYSIS]: { path: "analiz", flow: PRODUCT_FLOW_IDS.ANALYSIS_NOTEBOOK, deepLink: true, tab: true },
  [SCREENS.PROFILE]: { path: "profil", flow: PRODUCT_FLOW_IDS.PROFILE, deepLink: true, tab: true },

  [SCREENS.PLAN_DETAIL]: { path: "plan", flow: PRODUCT_FLOW_IDS.PLAN_STOPS, deepLink: true },
  [SCREENS.ADD_TASK]: { path: "plan/durak-ekle", flow: PRODUCT_FLOW_IDS.PLAN_STOPS, deepLink: false },
  [SCREENS.TOPIC_STUDY]: { path: "konu/calis/:subjectKey?", flow: PRODUCT_FLOW_IDS.PLAN_STOPS, deepLink: false },
  [SCREENS.ROADMAP]: { path: "yol-haritasi", flow: PRODUCT_FLOW_IDS.PLAN_STOPS, deepLink: true },
  [SCREENS.CALENDAR]: { path: "takvim", flow: PRODUCT_FLOW_IDS.PLAN_STOPS, deepLink: true },
  [SCREENS.GOALS]: { path: "hedefler", flow: PRODUCT_FLOW_IDS.PLAN_STOPS, deepLink: true },

  [SCREENS.ADD_STUDY]: { path: "calisma/kaydet", flow: PRODUCT_FLOW_IDS.QUICK_ENTRY, deepLink: true },
  [SCREENS.STUDY_TIMER]: { path: "calis/:subjectKey?", flow: PRODUCT_FLOW_IDS.DAILY_LOOP, deepLink: true },
  [SCREENS.STUDY_SAVE]: { path: "calisma/etiketle", flow: PRODUCT_FLOW_IDS.TRIAL_CAPTURE, deepLink: false },
  [SCREENS.STUDY_SUMMARY]: { path: "calisma/ozet", flow: PRODUCT_FLOW_IDS.DAILY_LOOP, deepLink: false },
  [SCREENS.SUMMARY]: { path: "ozet/:period?", flow: PRODUCT_FLOW_IDS.DAILY_LOOP, deepLink: true },
  [SCREENS.STUDY_HISTORY]: { path: "calisma/gecmis/detay", flow: PRODUCT_FLOW_IDS.STUDY_SESSION, deepLink: false },

  [SCREENS.TRIAL_ENTRY]: { path: "deneme/yeni", flow: PRODUCT_FLOW_IDS.QUICK_ENTRY, deepLink: true },
  [SCREENS.TRIAL_SUMMARY]: { path: "deneme/ozet", flow: PRODUCT_FLOW_IDS.TRIAL_CAPTURE, deepLink: false },
  [SCREENS.TRIAL_COMPARE]: { path: "deneme/karsilastir", flow: PRODUCT_FLOW_IDS.ANALYSIS_NOTEBOOK, deepLink: true },
  [SCREENS.TRIAL_DETAIL]: { path: "deneme/:id", flow: PRODUCT_FLOW_IDS.QUICK_ENTRY, deepLink: true },
  [SCREENS.TRIAL_RECORDS]: { path: "deneme/kayitlar", flow: PRODUCT_FLOW_IDS.ANALYSIS_NOTEBOOK, deepLink: true },
  [SCREENS.TRIAL_INSIGHTS]: { path: "deneme/icgoru", flow: PRODUCT_FLOW_IDS.ANALYSIS_NOTEBOOK, deepLink: false },
  [SCREENS.WEEKLY_TRIAL_REVIEW]: { path: "deneme/haftalik", flow: PRODUCT_FLOW_IDS.TIME_BASED, deepLink: false },

  [SCREENS.SUBJECT_DETAIL]: { path: "ders/:subjectKey", flow: PRODUCT_FLOW_IDS.PLAN_STOPS, deepLink: true },
  [SCREENS.SUBJECT_LIST]: { path: "dersler/liste", flow: PRODUCT_FLOW_IDS.ANALYSIS_NOTEBOOK, deepLink: false },
  [SCREENS.WEAK_AREAS]: { path: "analiz/zayif-konular", flow: PRODUCT_FLOW_IDS.ANALYSIS_NOTEBOOK, deepLink: false },
  [SCREENS.NET_FORECAST]: { path: "net-tahmini", flow: PRODUCT_FLOW_IDS.ROUTE_DEPTH, deepLink: true },
  [SCREENS.PLAN_VS_ACTUAL]: { path: "program/plan-gercek", flow: PRODUCT_FLOW_IDS.PLAN_STOPS, deepLink: false },
  [SCREENS.TOPIC_DEBT]: { path: "program/konu-borcu", flow: PRODUCT_FLOW_IDS.PLAN_STOPS, deepLink: false },
  [SCREENS.COMPARATIVE]: { path: "karsilastirmali-analiz", flow: PRODUCT_FLOW_IDS.ANALYSIS_NOTEBOOK, deepLink: true },
  [SCREENS.RANK_SIMULATOR]: { path: "siralama", flow: PRODUCT_FLOW_IDS.ROUTE_DEPTH, deepLink: true },
  [SCREENS.EXAM_SIMULATOR]: { path: "sinav-prova", flow: PRODUCT_FLOW_IDS.TIME_BASED, deepLink: false },

  [SCREENS.WRONG_NOTEBOOK]: { path: "yanlis", flow: PRODUCT_FLOW_IDS.ANALYSIS_NOTEBOOK, deepLink: true },
  [SCREENS.ADD_WRONG]: { path: "yanlis/yeni", flow: PRODUCT_FLOW_IDS.WRONG_NOTEBOOK, deepLink: true },
  [SCREENS.REVIEW_SESSION]: { path: "yanlis/tekrar", flow: PRODUCT_FLOW_IDS.WRONG_NOTEBOOK, deepLink: true },
  [SCREENS.REVIEW_DONE]: { path: "yanlis/tekrar/bitti", flow: PRODUCT_FLOW_IDS.WRONG_NOTEBOOK, deepLink: false },
  [SCREENS.WRONG_DETAIL]: { path: "yanlis/:id", flow: PRODUCT_FLOW_IDS.WRONG_NOTEBOOK, deepLink: true },
  [SCREENS.SWIPE_REVIEW]: { path: "yanlis/kart", flow: PRODUCT_FLOW_IDS.WRONG_NOTEBOOK, deepLink: false },
  [SCREENS.QUICK_PRACTICE]: { path: "pratik", flow: PRODUCT_FLOW_IDS.WRONG_NOTEBOOK, deepLink: false },

  [SCREENS.TOPIC_CARDS]: { path: "kartlar", flow: PRODUCT_FLOW_IDS.PLAN_STOPS, deepLink: true },
  [SCREENS.CARD_DETAIL]: { path: "kartlar/:id", flow: PRODUCT_FLOW_IDS.PLAN_STOPS, deepLink: false },

  [SCREENS.LEAGUE]: { path: "group/:groupCode?", flow: PRODUCT_FLOW_IDS.SOCIAL, deepLink: true, parse: "groupCode" },
  [SCREENS.FRIENDS]: { path: "friend/:friendCode?", flow: PRODUCT_FLOW_IDS.SOCIAL, deepLink: true, parse: "friendCode" },
  [SCREENS.CHALLENGE]: { path: "sosyal/meydan-okuma", flow: PRODUCT_FLOW_IDS.SOCIAL, deepLink: false },
  [SCREENS.REFERRAL]: { path: "referral/:code?", flow: PRODUCT_FLOW_IDS.SOCIAL, deepLink: true, parse: "code" },
  [SCREENS.ROUTE_COMPANION]: { path: "yol-arkadasi", flow: PRODUCT_FLOW_IDS.SOCIAL, deepLink: true },

  [SCREENS.WEEKLY_REVIEW]: { path: "weekly-review", flow: PRODUCT_FLOW_IDS.TIME_BASED, deepLink: true },
  [SCREENS.SHARE_CARD]: { path: "paylasim", flow: PRODUCT_FLOW_IDS.PROFILE, deepLink: true },

  [SCREENS.PAYWALL]: { path: "premium", flow: PRODUCT_FLOW_IDS.PREMIUM, deepLink: true },

  [SCREENS.SETTINGS]: { path: "ayarlar", flow: PRODUCT_FLOW_IDS.SETTINGS, deepLink: true },
  [SCREENS.APPEARANCE]: { path: "ayarlar/gorunum", flow: PRODUCT_FLOW_IDS.SETTINGS, deepLink: false },
  [SCREENS.EDIT_PROFILE]: { path: "ayarlar/profil", flow: PRODUCT_FLOW_IDS.SETTINGS, deepLink: false },
  [SCREENS.CHANGE_PASSWORD]: { path: "ayarlar/sifre", flow: PRODUCT_FLOW_IDS.SETTINGS, deepLink: false },
  [SCREENS.EDIT_EMAIL]: { path: "ayarlar/eposta", flow: PRODUCT_FLOW_IDS.SETTINGS, deepLink: false },
  [SCREENS.NOTIFICATIONS_SETTINGS]: { path: "ayarlar/bildirim", flow: PRODUCT_FLOW_IDS.SETTINGS, deepLink: true },
  [SCREENS.PRIVACY]: { path: "gizlilik", flow: PRODUCT_FLOW_IDS.SETTINGS, deepLink: true },
  [SCREENS.TERMS]: { path: "kosullar", flow: PRODUCT_FLOW_IDS.SETTINGS, deepLink: true },
  [SCREENS.ABOUT]: { path: "hakkinda", flow: PRODUCT_FLOW_IDS.SETTINGS, deepLink: true },
};

export const ROUTE_PATHS = Object.fromEntries(
  Object.entries(ROUTE_CONFIGS).map(([screen, config]) => [screen, config.path]),
);

const DEEP_LINK_ROUTE_PATHS = Object.fromEntries(
  Object.entries(ROUTE_CONFIGS)
    .filter(([, config]) => config.deepLink)
    .map(([screen, config]) => [screen, config.path]),
);

// Path parametresinin ADI, ekranın okuduğu param adıyla AYNI olmalı.
// React Navigation'ın `parse` seçeneği değeri dönüştürür ama param'ı yeniden
// ADLANDIRAMAZ. Yol `friend/:code?` iken FriendsScreen `route.params.friendCode`
// okuyordu: gerçek davet linkiyle gelen kod ekrana hiç ulaşmıyordu.
function withParse(screen, route) {
  const key = ROUTE_CONFIGS[screen]?.parse;
  if (!key) return route;
  return {
    path: route,
    parse: { [key]: (c) => c?.toUpperCase() },
  };
}

// Sekme ekranları YALNIZCA MainTabs altında tanımlanır.
//
// Önceden bunlar hem MainTabs.screens altında hem de aşağıdaki spread ile
// KÖKTE tekrar tanımlanıyordu. React Navigation aynı path'i iki farklı
// konumda görünce `checkForDuplicatedConfigs` ile HATA FIRLATIYOR
// ("Found conflicting screens with the same pattern"), ve bu kontrol her
// getStateFromPath çağrısında tüm ağaç üzerinde çalıştığı için HİÇBİR
// deep link çalışmıyordu: bildirim dokunuşları, davet/grup linkleri ve
// şifre sıfırlama linki dahil hepsi sessizce ölüydü.
const TAB_SCREEN_KEYS = Object.entries(ROUTE_CONFIGS)
  .filter(([, config]) => config.tab)
  .map(([screen]) => screen);

// NESTED LINKING — sekmeler artik kendi stack'i (bkz. tabAssignment.js).
// Ekranlar kokte degil sekme stack'lerinin ICINDE, o yuzden linking agaci
// da ayni sekli almali; yoksa deep link var olmayan bir konumu isaret eder.
//
// PAYLASIMLI EKRAN TUZAGI: bir ekran birden fazla sekme stack'ine kayitli
// (ornek ROADMAP: ROTA + PROGRAM). Path'i her ikisinde de tanimlarsak
// React Navigation "Found conflicting screens with the same pattern" firlatir
// ve TUM deep linkler oluyor — bu hata projede bir kez yasandi.
// Cozum: path YALNIZ kanonik sekmede tanimlanir. Kanonik = ekrani iceren
// ilk sekme, su sabit sirada. navigate() zaten her sekmede calisiyor.
const TAB_ORDER = [TAB_KEYS.ROTA, TAB_KEYS.PROGRAM, TAB_KEYS.ANALIZ, TAB_KEYS.PROFIL];

function canonicalTabFor(screen) {
  return TAB_ORDER.find((tab) => (TAB_STACKS[tab] || []).includes(screen)) || null;
}

const NESTED_BY_TAB = new Map(TAB_ORDER.map((tab) => [tab, {}]));
const ROOT_LEVEL = {};

for (const [screen, path] of Object.entries(DEEP_LINK_ROUTE_PATHS)) {
  if (TAB_SCREEN_KEYS.includes(screen)) continue; // sekme kokleri asagida
  const tab = canonicalTabFor(screen);
  if (tab) NESTED_BY_TAB.get(tab)[screen] = withParse(screen, path);
  else ROOT_LEVEL[screen] = withParse(screen, path);
}

export const LINKING_SCREENS = {
  [ROOT_STACK.MAIN_TABS]: {
    screens: Object.fromEntries(
      TAB_SCREEN_KEYS
        .filter((screen) => DEEP_LINK_ROUTE_PATHS[screen])
        .map((screen) => [
          screen,
          {
            path: DEEP_LINK_ROUTE_PATHS[screen],
            screens: NESTED_BY_TAB.get(screen) || {},
          },
        ]),
    ),
  },
  ...ROOT_LEVEL,
};

export function getRouteConfig(screen) {
  return ROUTE_CONFIGS[screen] || null;
}

export function getRouteAnalyticsMeta(screen) {
  const config = getRouteConfig(screen);
  return {
    flow: config?.flow || null,
    isTab: Boolean(config?.tab),
    deepLink: Boolean(config?.deepLink),
  };
}

export function appUrl(screen, params = {}) {
  let path = ROUTE_PATHS[screen] || ROUTE_PATHS[SCREENS.HOME];
  Object.entries(params).forEach(([key, value]) => {
    path = path.replace(`:${key}?`, value ? encodeURIComponent(String(value)) : "");
    path = path.replace(`:${key}`, encodeURIComponent(String(value)));
  });
  return `maraton://${path.replace(/\/+/g, "/").replace(/\/$/, "")}`;
}
