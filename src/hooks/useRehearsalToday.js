import { useEffect, useState } from "react";
import { useIsFocused } from "@react-navigation/native";
import { isRehearsalDay } from "../domain/exam/examRehearsal";
import { loadRehearsal } from "../lib/examRehearsalStore";

// Deneme provasi bugune kuruluysa true. Tasarimin kurali: "O gün başka durak
// açılmaz" — Ana Sayfa gunun duraklarini bu bayrakla bos birakir.
export function useRehearsalToday(userId) {
  const focused = useIsFocused();
  const [today, setToday] = useState(false);

  useEffect(() => {
    if (!focused) return undefined;
    let alive = true;
    loadRehearsal(userId)
      .then((r) => { if (alive) setToday(isRehearsalDay(r)); })
      .catch(() => {});
    return () => { alive = false; };
  }, [focused, userId]);

  return today;
}
