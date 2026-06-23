import * as Linking from "expo-linking";
import * as Notifications from "expo-notifications";

const prefix = Linking.createURL("/");

export const linkingConfig = {
  prefixes: [prefix, "maraton://", "https://maraton.app"],
  config: {
    screens: {
      MainTabs: {
        screens: {
          Home: "home",
          DailyPlan: "dersler",
          Analysis: "analiz",
          Profile: "profil",
        },
      },
      PlanDetail: "plan",
      StudyTimer: "calis/:subjectKey?",
      TrialEntry: "deneme/yeni",
      TrialDetail: "deneme/:id",
      TrialCompare: "deneme/karsilastir",
      AddWrong: "yanlis/yeni",
      WrongNotebook: "yanlis",
      WrongDetail: "yanlis/:id",
      Calendar: "takvim",
      Goals: "hedefler",
      League: "lig",
      Friends: "arkadaslar",
      Roadmap: "yol-haritasi",
      RankSimulator: "siralama",
      NetForecast: "net-tahmini",
      Comparative: "karsilastirmali-analiz",
      ReviewSession: "yanlis/tekrar",
      SubjectDetail: "ders/:subjectKey",
      WeeklyReview: "weekly-review",
      Settings: "ayarlar",
      NotificationsSettings: "ayarlar/bildirim",
      Privacy: "gizlilik",
      Terms: "kosullar",
      About: "hakkinda",
    },
  },
  // Initial deep link from notification or cold start
  async getInitialURL() {
    const url = await Linking.getInitialURL();
    if (url) return url;
    const response = await Notifications.getLastNotificationResponseAsync();
    return response?.notification?.request?.content?.data?.url ?? null;
  },
  subscribe(listener) {
    const onReceiveURL = ({ url }) => listener(url);
    const sub = Linking.addEventListener("url", onReceiveURL);

    const notifSub = Notifications.addNotificationResponseReceivedListener((response) => {
      const url = response?.notification?.request?.content?.data?.url;
      if (url) listener(url);
    });

    return () => {
      sub.remove();
      notifSub.remove();
    };
  },
};
