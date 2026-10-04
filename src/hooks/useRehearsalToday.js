import { useCallback, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { isRehearsalDay } from "../domain/exam/examRehearsal";
import { loadRehearsal } from "../lib/examRehearsalStore";

// Deneme provasi bugune kuruluysa true. Tasarimin kurali: "O gün başka durak
// açılmaz" — Ana Sayfa gunun duraklarini bu bayrakla bos birakir.
export function useRehearsalToday(userId) {
  const [today, setToday] = useState(false);

  // Odaga her geliste okunur; useIsFocused degil (odak kaybinda butun Ana
  // Sayfa'yi yeniden cizdiriyordu, sekme gecisinde kasma).
  useFocusEffect(useCallback(() => {
    let alive = true;
    loadRehearsal(userId)
      .then((r) => { if (alive) setToday(isRehearsalDay(r)); })
      .catch(() => {});
    return () => { alive = false; };
  }, [userId]));

  return today;
}
