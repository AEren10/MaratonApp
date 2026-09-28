import { useEffect, useState } from "react";
import { AppState } from "react-native";

import { todayTR } from "../lib/dateUtils";

// "Bugun" anahtari (YYYY-MM-DD, Turkiye saati) -- gun degisince yeniden
// render ettirir. Acik kalan ana sayfa gece yarisindan sonra dunun planini
// ve dunun gun cubugunu gostermeye devam ediyordu. Gece yarisi zamanlayicisi
// + uygulama one geldiginde kontrol.
export function useTodayKey() {
  const [key, setKey] = useState(todayTR);

  useEffect(() => {
    const refresh = () => setKey((prev) => {
      const now = todayTR();
      return now === prev ? prev : now;
    });
    const now = new Date();
    const msToMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 5) - now;
    const timer = setTimeout(refresh, msToMidnight);
    const sub = AppState.addEventListener("change", (state) => { if (state === "active") refresh(); });
    return () => { clearTimeout(timer); sub.remove(); };
  }, [key]);

  return key;
}
