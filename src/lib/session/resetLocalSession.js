import { store, RESET_STORE } from "../../store/store";
import { cancelAllScheduled } from "../notifications";
import { clearUserScopedStorage } from "../storage/userScopedStorage";
import { clearAllWidgets } from "../widgetSync";
import { runSessionResets } from "./sessionReset";

// Cikan kullanicinin cihazdaki izini siler: Redux, modul onbellekleri,
// ana ekran widget'lari, planlanmis bildirimler, kullaniciya ozel
// AsyncStorage anahtarlari.
// keepUserId: hesap degisiminde YENI kullanicinin anahtarlari korunur
// (temizlik asenkron; B'nin az once yazdigi yerel yedek silinmesin).
export async function resetLocalSession({ keepUserId = null } = {}) {
  store.dispatch({ type: RESET_STORE });
  runSessionResets();
  try { clearAllWidgets(); } catch (_) {}
  await Promise.all([
    cancelAllScheduled().catch(() => {}),
    clearUserScopedStorage({ keepUserId }),
  ]);
}
