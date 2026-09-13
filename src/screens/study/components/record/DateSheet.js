import { useMemo } from "react";

import { dateKeyOffset } from "../../../../lib/dateUtils";
import { dayMonthLabel } from "../../../../domain/study/studyHistoryModel";
import { RecordSheet, SheetOption } from "./RecordSheet";

const DAYS_BACK = 14;

// TARIH satirindan acilir: bugun ve geriye dogru 14 gun. Gelecek tarih yok.
export function DateSheet({ visible, selectedKey, onSelect, onClose, extraKey }) {
  const options = useMemo(() => {
    const keys = Array.from({ length: DAYS_BACK }, (_, i) => dateKeyOffset(-i));
    if (extraKey && !keys.includes(extraKey)) keys.push(extraKey);
    return keys;
  }, [extraKey, visible]);
  return (
    <RecordSheet visible={visible} label="TARİH" onClose={onClose}>
      {options.map((key, i) => (
        <SheetOption
          key={key}
          title={dayMonthLabel(key)}
          meta={i === 0 ? "Bugün" : i === 1 ? "Dün" : null}
          selected={selectedKey === key}
          onPress={() => { onSelect(key); onClose(); }}
        />
      ))}
    </RecordSheet>
  );
}
