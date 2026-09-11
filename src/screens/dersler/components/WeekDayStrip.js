import React, { useCallback } from "react";
import { View, Text, Pressable } from "react-native";
import { STEP, SHAPE } from "../../../themes/tokens";
import { useC } from "../../../contexts/ThemeContext";
import * as H from "../../../lib/haptics";

function DayChip({ day, selected, onPress, C }) {
  const filled = day.isToday;
  const outlined = !filled && selected;
  const bg = filled ? C.brandFill : "transparent";
  const border = filled ? C.brandFill : outlined ? C.accent : day.isFuture ? C.line : C.elev;
  const letterColor = filled ? C.accentInk : outlined ? C.accentBright : C.text3;
  const numColor = filled ? C.accentInk : outlined ? C.text : day.isFuture ? C.text3 : C.text2;
  const dotColor = day.active ? C.accent : day.isFuture ? "transparent" : C.text5;
  const bgFallback = filled ? C.brandFill : day.isFuture ? "transparent" : C.surface;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${day.letter} ${day.dayNum}`}
      onPress={onPress}
      style={{
        flex: 1,
        minHeight: 44,
        paddingVertical: 11,
        borderRadius: SHAPE.cardTight,
        backgroundColor: bg || bgFallback,
        borderWidth: 1,
        borderColor: border,
        borderStyle: day.isFuture && !outlined ? "dashed" : "solid",
        alignItems: "center",
        gap: 6,
      }}
    >
      <Text style={{ fontFamily: "Archivo_700", fontSize: 11, letterSpacing: 1.1, color: letterColor }}>
        {day.letter}
      </Text>
      <Text style={{ fontFamily: "Bricolage_400", fontSize: 17, color: numColor, fontVariant: ["tabular-nums"] }}>
        {day.dayNum}
      </Text>
      <View style={{ width: 5, height: 5, borderRadius: 1, backgroundColor: dotColor }} />
    </Pressable>
  );
}

export function WeekDayStrip({ days, selectedDate, onSelect }) {
  const C = useC();
  const handlePress = useCallback((key) => {
    H.tap();
    onSelect(key);
  }, [onSelect]);

  return (
    <View style={{ marginTop: STEP.s2 }}>
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
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: STEP.s2, marginTop: STEP.s1 }}>
        <Legend color={C.accent} label="tamamlandı" C={C} />
        <Legend color={C.text5} label="bekleyen" C={C} />
        <Legend color="transparent" dashed label="boş gün" C={C} />
      </View>
    </View>
  );
}

function Legend({ color, label, dashed, C }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
      <View style={{
        width: 6, height: 6, borderRadius: 1, backgroundColor: dashed ? "transparent" : color,
        borderWidth: dashed ? 1 : 0, borderColor: C.line, borderStyle: dashed ? "dashed" : "solid",
      }}
      />
      <Text style={{ fontFamily: "Archivo_500", fontSize: 11, color: C.muted }}>{label}</Text>
    </View>
  );
}
