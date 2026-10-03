import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Linking from "expo-linking";
import * as Notifications from "expo-notifications";
import { trackNotificationOpened, track } from "../lib/analytics";
import { EVENTS } from "../constants/analytics";
import { LINKING_SCREENS } from "./routes";

const prefix = Linking.createURL("/");

// ACILIS ADRESI BIR KEZ KULLANILIR. Uygulama widget'tan (maraton://rota)
// acildiktan sonra JS her yeniden yuklendiginde (gelistirmede her Metro
// yenilemesi, uretimde guncelleme yuklemesi) Linking ayni adresi yeniden
// veriyordu: ikondan acilsa bile hep Rota aciliyordu. Ayni adres kisa sure
// once islendiyse yok sayilir.
const HANDLED_KEY = "@maraton:handled_initial_url";
const REUSE_WINDOW_MS = 30 * 60 * 1000;

async function freshInitialUrl(url) {
  try {
    const raw = await AsyncStorage.getItem(HANDLED_KEY);
    const prev = raw ? JSON.parse(raw) : null;
    if (prev?.url === url && Date.now() - prev.at < REUSE_WINDOW_MS) return null;
    await AsyncStorage.setItem(HANDLED_KEY, JSON.stringify({ url, at: Date.now() }));
  } catch (_) {}
  return url;
}

export const linkingConfig = {
  prefixes: [prefix, "maraton://", "https://maratonapp.com"],
  config: {
    // Kok seviyedeki derin bag (maraton://deneme/yeni -> TrialEntry) soguk
    // acilista ALTINDA hicbir sey olmadan aciliyordu: "Vazgec"/geri gidecek
    // yer yoktu. MainTabs altta kurulur, geri ana sayfaya doner.
    initialRouteName: "MainTabs",
    screens: LINKING_SCREENS,
  },
  // Initial deep link from notification or cold start
  async getInitialURL() {
    const url = await Linking.getInitialURL();
    if (url) return freshInitialUrl(url);
    const response = typeof Notifications.getLastNotificationResponse === "function"
      ? Notifications.getLastNotificationResponse()
      : await Notifications.getLastNotificationResponseAsync();
    const data = response?.notification?.request?.content?.data;
    // Tuketilen yanit temizlenir: yoksa bir sonraki soguk acilis (ikondan)
    // yine ayni bildirimin ekranina dusebiliyordu.
    try {
      if (typeof Notifications.clearLastNotificationResponse === "function") Notifications.clearLastNotificationResponse();
      else await Notifications.clearLastNotificationResponseAsync?.();
    } catch (_) {}
    if (data?.url) {
      trackNotificationOpened(data.type || "unknown", { coldStart: true });
    }
    return data?.url ?? null;
  },
  subscribe(listener) {
    const onReceiveURL = ({ url }) => listener(url);
    const sub = Linking.addEventListener("url", onReceiveURL);

    // Teslim edilen ama HENÜZ dokunulmamış bildirimler. PUSH_RECEIVED tanımlıydı
    // ama hiç gönderilmiyordu: elde sadece "açıldı" vardı, yani bildirimlerin
    // kaçının görülüp kaçının tıklandığı (teslim→açılma oranı) ölçülemiyordu.
    const receivedSub = Notifications.addNotificationReceivedListener((notification) => {
      const data = notification?.request?.content?.data;
      track(EVENTS.PUSH_RECEIVED, { type: data?.type || "unknown" });
    });

    const notifSub = Notifications.addNotificationResponseReceivedListener((response) => {
      const data = response?.notification?.request?.content?.data;
      if (data?.url) {
        trackNotificationOpened(data.type || "unknown", { coldStart: false });
        listener(data.url);
      }
    });

    return () => {
      sub.remove();
      notifSub.remove();
      receivedSub.remove();
    };
  },
};
