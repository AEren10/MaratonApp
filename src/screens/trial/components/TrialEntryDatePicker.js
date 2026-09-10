import { View, Text, Pressable } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";

import { Icon, IconBox } from "../../../components/design";
import { formatDateISO, formatDateLong } from "../trialEntryDates";

export function TrialEntryDatePicker({
  C,
  recentDays,
  showDatePicker,
  styles,
  trialDate,
  onChangeDate,
  onToggle,
}) {
  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Tarih: ${formatDateLong(trialDate)}`}
        accessibilityHint="Tarih seçiciyi açar veya kapatır"
        onPress={onToggle}
        style={styles.dateRow}
      >
        <IconBox icon="calendar" color={C.accent} size={34} rounded={10} />
        <Text style={styles.dateText}>{formatDateLong(trialDate)}</Text>
        <Icon name={showDatePicker ? "chevUp" : "chevDown"} size={16} color={C.muted} />
      </Pressable>

      {showDatePicker && (
        <Animated.View entering={FadeIn.duration(200)} style={styles.datePicker}>
          {recentDays.map((day) => {
            const active = formatDateISO(trialDate) === day.iso;
            return (
              <Pressable
                key={day.iso}
                accessibilityRole="radio"
                accessibilityLabel={`${day.dayName} ${day.day}`}
                accessibilityState={{ selected: active }}
                onPress={() => onChangeDate(day.date)}
                style={[
                  styles.dateChip,
                  {
                    backgroundColor: active ? C.accent + "1A" : C.surface,
                    borderColor: active ? C.accent : C.border,
                  },
                ]}
              >
                <Text
                  style={{
                    fontFamily: "Archivo_500",
                    fontSize: 11,
                    color: active ? C.accent : C.muted,
                  }}
                >
                  {day.dayName}
                </Text>
                <Text
                  style={{
                    fontFamily: "Bricolage_400",
                    fontSize: 18,
                    color: active ? C.accent : C.text,
                  }}
                >
                  {day.day}
                </Text>
              </Pressable>
            );
          })}
        </Animated.View>
      )}
    </>
  );
}
