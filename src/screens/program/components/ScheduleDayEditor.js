import { StyleSheet, Text, View } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";

import { useC } from "../../../contexts/ThemeContext";
import { DAY_KINDS } from "../../../domain/program/classSchedule";
import * as H from "../../../lib/haptics";
import { STEP, TYPOGRAPHY } from "../../../themes/tokens";
import ScheduleChip from "./ScheduleChip";

const HOURS = [1, 2, 3, 4, 5, 6];

// Acilan gun: dersler (TYT / AYT ayrik), saat ve gun turu.
export default function ScheduleDayEditor({ day, editor }) {
  const C = useC();
  const wd = day.weekday;
  const pick = (fn) => () => { H.select(); fn(); };
  const hours = Math.round(day.minutes / 60);

  const hasGroups = Boolean(editor.aytOptions && editor.aytOptions.length > 0);

  return (
    <Animated.View entering={FadeIn.duration(500)} style={s.wrap}>
      {hasGroups ? (
        <>
          <View style={s.section}>
            <Text style={[TYPOGRAPHY.tableHead, s.sectionLabel, { color: C.text3 }]}>
              {editor.group1Label ? `${editor.group1Label.toUpperCase()} DERSLERİ` : "TYT DERSLERİ"}
            </Text>
            <View style={s.group}>
              {editor.tytOptions.map((o) => {
                const on = day.subjects.includes(o.key);
                return (
                  <ScheduleChip
                    key={o.key}
                    label={o.label}
                    tone={on ? "subject" : "plain"}
                    color={C.subjects?.[o.paletteKey || o.key]}
                    selected={on}
                    onPress={pick(() => editor.toggleSubject(wd, o.key))}
                  />
                );
              })}
            </View>
          </View>
          <View style={s.section}>
            <Text style={[TYPOGRAPHY.tableHead, s.sectionLabel, { color: C.text3 }]}>
              {editor.group2Label ? `${editor.group2Label.toUpperCase()} DERSLERİ` : "AYT DERSLERİ"}
            </Text>
            <View style={s.group}>
              {editor.aytOptions.map((o) => {
                const on = day.subjects.includes(o.key);
                return (
                  <ScheduleChip
                    key={o.key}
                    label={o.label}
                    tone={on ? "subject" : "plain"}
                    color={C.subjects?.[o.paletteKey || o.key]}
                    selected={on}
                    onPress={pick(() => editor.toggleSubject(wd, o.key))}
                  />
                );
              })}
            </View>
          </View>
        </>
      ) : (
        <View style={s.section}>
          <View style={s.group}>
            {editor.options.map((o) => {
              const on = day.subjects.includes(o.key);
              return (
                <ScheduleChip
                  key={o.key}
                  label={o.label}
                  tone={on ? "subject" : "plain"}
                  color={C.subjects?.[o.paletteKey || o.key]}
                  selected={on}
                  onPress={pick(() => editor.toggleSubject(wd, o.key))}
                />
              );
            })}
          </View>
        </View>
      )}

      {day.kind !== DAY_KINDS.OFF ? (
        <View style={s.section}>
          <Text style={[TYPOGRAPHY.tableHead, s.sectionLabel, { color: C.text3 }]}>
            GÜNLÜK HEDEF SÜRE
          </Text>
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
  wrap: { gap: STEP.s3, paddingBottom: STEP.s3, paddingLeft: 36 + STEP.s2 },
  section: { gap: STEP.s1 },
  sectionLabel: { fontSize: 11.5, letterSpacing: 1.2 },
  group: { flexDirection: "row", flexWrap: "wrap", gap: STEP.s1 },
});
