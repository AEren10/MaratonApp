import * as Linking from "expo-linking";
import * as Notifications from "expo-notifications";
import { trackNotificationOpened, track } from "../lib/analytics";
import { EVENTS } from "../constants/analytics";
import { LINKING_SCREENS } from "./routes";

const prefix = Linking.createURL("/");

export const linkingConfig = {
  prefixes: [prefix, "maraton://", "https://maraton.app"],
  config: {
    screens: LINKING_SCREENS,
  },
  // Initial deep link from notification or cold start
  async getInitialURL() {
    const url = await Linking.getInitialURL();
    if (url) return url;
    const response = await Notifications.getLastNotificationResponseAsync();
    const data = response?.notification?.request?.content?.data;
    if (data?.url) {
      trackNotificationOpened(data.type || "unknown", { url: data.url, coldStart: true });
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
        trackNotificationOpened(data.type || "unknown", { url: data.url, coldStart: false });
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
