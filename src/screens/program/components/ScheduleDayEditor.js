import { StyleSheet, View } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";

import { useC } from "../../../contexts/ThemeContext";
import { DAY_KINDS } from "../../../domain/program/classSchedule";
import * as H from "../../../lib/haptics";
import { STEP } from "../../../themes/tokens";
import ScheduleChip from "./ScheduleChip";

const HOURS = [1, 2, 3, 4, 5, 6];

// Acilan gun: dersler, saat ve gun turu. Metinler yalniz veri (ders adi,
// "N sa") ve tasarimin kendi etiketleri (Deneme günü / Boş gün).
export default function ScheduleDayEditor({ day, editor }) {
  const C = useC();
  const wd = day.weekday;
  const pick = (fn) => () => { H.select(); fn(); };
  const hours = Math.round(day.minutes / 60);

  return (
    <Animated.View entering={FadeIn.duration(500)} style={s.wrap}>
      <View style={s.group}>
        {editor.options.map((o) => {
          const on = day.subjects.includes(o.key);
          return (
            <ScheduleChip
              key={o.key}
              label={o.label}
              tone={on ? "subject" : "plain"}
              color={C.subjects?.[o.key]}
              selected={on}
              onPress={pick(() => editor.toggleSubject(wd, o.key))}
            />
          );
        })}
      </View>
      {day.kind !== DAY_KINDS.OFF ? (
        <View style={s.group}>
          {HOURS.map((h) => (
            <ScheduleChip
              key={h}
              label={`${h} sa`}
              tone={hours === h ? "subject" : "plain"}
              color={C.text}
              selected={hours === h}
              onPress={pick(() => editor.setHours(wd, h))}
            />
          ))}
        </View>
      ) : null}
      <View style={s.group}>
        <ScheduleChip
          tone="dashed"
          label="Deneme günü"
          selected={day.kind === DAY_KINDS.TRIAL}
          onPress={pick(() => editor.toggleKind(wd, DAY_KINDS.TRIAL))}
        />
        <ScheduleChip
          tone="dashed"
          label="Boş gün"
          selected={day.kind === DAY_KINDS.OFF}
          onPress={pick(() => editor.toggleKind(wd, DAY_KINDS.OFF))}
        />
      </View>
    </Animated.View>
  );
}

const s = StyleSheet.create({
  wrap: { gap: STEP.s2 + 2, paddingBottom: STEP.s3, paddingLeft: STEP.s4 + STEP.s2 + 2 },
  group: { flexDirection: "row", flexWrap: "wrap", gap: STEP.s1 + 6 },
});
