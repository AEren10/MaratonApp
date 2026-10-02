import { useClassSchedule } from "./useClassSchedule";
import { DISCOVER_TIPS, useDiscoverTips } from "./useDiscoverTips";
import { activeDayCount } from "../domain/program/classSchedule";

// Ders programi ipucu gorunuyor mu? Program ekraninda ayni anda TEK kesif
// karti: bu gorunurken aliskanlik ve "bildigin konular" kartlari bekler.
export function useScheduleTipVisible() {
  const { schedule, ready } = useClassSchedule();
  const { isClosed } = useDiscoverTips();
  return ready && activeDayCount(schedule) <= 1 && !isClosed(DISCOVER_TIPS.SCHEDULE);
}
