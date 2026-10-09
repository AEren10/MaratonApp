import React, { useCallback } from "react";
import { View, Text, Pressable } from "react-native";
import { STEP, SHAPE } from "../../../themes/tokens";
import { alpha } from "../../../themes/colorMix";
import { useC } from "../../../contexts/ThemeContext";
import * as H from "../../../lib/haptics";

// Sade serit (9 Ekim): yedi cerceveli kutu + kesikli gelecek gunler gurultuydu.
// Yalniz secili gun kutulu ve kizil tonlu; bugun (secili degilken) ince
// kizil cerceve; digerleri zeminsiz. Nokta: yesil bitti, gri bekleyen.
function DayChip({ day, selected, onPress, C }) {
  const isSelected = selected;
  const isPastDone = Boolean(day.active && !day.isFuture && !isSelected);

  const bg = isSelected ? alpha(C.accent, 14) : "transparent";
  const border = isSelected ? alpha(C.accent, 55) : day.isToday ? alpha(C.accent, 30) : "transparent";
  const letterColor = isSelected ? C.accentText : day.isToday ? C.text2 : C.text3;
  const numColor = isSelected ? C.text : isPastDone ? C.text : day.isFuture ? C.text3 : C.text2;
  const dotColor = isSelected
    ? (day.active ? C.up : C.accent)
    : (day.active || isPastDone)
      ? C.up
      : day.isFuture
        ? "transparent"
        : C.text5;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${day.letter} ${day.dayNum}`}
      onPress={onPress}
      style={{
        flex: 1,
        minHeight: 52,
        paddingVertical: 10,
        borderRadius: 14,
        backgroundColor: bg,
        borderWidth: 1.5,
        borderColor: border,
        alignItems: "center",
        justifyContent: "space-between",
        paddingBottom: 8,
      }}
    >
      <Text style={{ fontFamily: "Archivo_700", fontSize: 11, letterSpacing: 1.1, color: letterColor }}>
        {day.letter}
      </Text>
      <Text style={{ fontFamily: "Bricolage_400", fontSize: 17, color: numColor, fontVariant: ["tabular-nums"] }}>
        {day.dayNum}
      </Text>
      <View style={{
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: dotColor,
      }} />
    </Pressable>
  );
}

export function WeekDayStrip({ days, selectedDate, onSelect, style }) {
  const C = useC();
  const handlePress = useCallback((key) => {
    H.tap();
    onSelect(key);
  }, [onSelect]);

  return (
    <View style={[{ marginTop: STEP.s3 }, style]}>
      <View style={{ flexDirection: "row", gap: 6 }}>
        {days.map((day) => (
          <DayChip
            key={day.key}
            day={day}
            selected={day.key === selectedDate}
            onPress={() => handlePress(day.key)}
            C={C}
          />
        ))}
      </View>
    </View>
  );
}
