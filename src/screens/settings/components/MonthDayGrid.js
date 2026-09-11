import React, { useCallback, useMemo } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { TYPOGRAPHY, STEP, SHAPE } from "../../../themes/tokens";

const DAY_HEADS = ["PZT", "SAL", "ÇAR", "PER", "CUM", "CMT", "PAZ"];

// Pazartesi basli ay izgarasi. JS'te getDay() 0=Pazar, tasarim Pazartesi
// ile basliyor; kaydirma burada yapiliyor.
function buildCells(year, month) {
  const first = new Date(year, month, 1);
  const lead = (first.getDay() + 6) % 7;
  const total = new Date(year, month + 1, 0).getDate();
  const cells = new Array(lead).fill(null);
  for (let d = 1; d <= total; d += 1) cells.push(d);
  return cells;
}

function DayCell({ day, selected, disabled, onPress, C }) {
  if (day == null) return <View style={styles.cell} />;
  return (
    <Pressable
      onPress={() => onPress(day)}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ selected, disabled }}
      accessibilityLabel={`${day}`}
      style={({ pressed }) => [
        styles.cell,
        selected && { backgroundColor: C.accent, borderRadius: SHAPE.chip },
        { opacity: disabled ? 0.3 : pressed ? 0.6 : 1 },
      ]}
    >
      <Text
        style={[
          TYPOGRAPHY.captionMedium,
          { color: selected ? C.accentInk : C.text },
        ]}
        allowFontScaling={false}
      >
        {day}
      </Text>
    </Pressable>
  );
}

const MemoCell = React.memo(DayCell);

export function MonthDayGrid({ C, year, month, selectedDay, minDate, onSelectDay }) {
  const cells = useMemo(() => buildCells(year, month), [year, month]);

  const isDisabled = useCallback(
    (day) => {
      if (!minDate) return false;
      return new Date(year, month, day) < new Date(
        minDate.getFullYear(), minDate.getMonth(), minDate.getDate(),
      );
    },
    [minDate, year, month],
  );

  const renderCell = useCallback(
    (day, i) => (
      <MemoCell
        key={`${year}-${month}-${i}`}
        day={day}
        selected={day != null && day === selectedDay}
        disabled={day != null && isDisabled(day)}
        onPress={onSelectDay}
        C={C}
      />
    ),
    [C, year, month, selectedDay, isDisabled, onSelectDay],
  );

  return (
    <View>
      <View style={styles.row}>
        {DAY_HEADS.map((d) => (
          <Text key={d} style={[styles.head, { color: C.text3 }]} allowFontScaling={false}>
            {d}
          </Text>
        ))}
      </View>
      <View style={styles.grid}>{cells.map(renderCell)}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row" },
  head: {
    flex: 1,
    textAlign: "center",
    fontFamily: "Archivo_600",
    fontSize: 11,
    lineHeight: 16,
    letterSpacing: 0.8,
  },
  grid: { flexDirection: "row", flexWrap: "wrap", marginTop: STEP.s1 },
  // 7 sutun: her hucre %14.28. Yukseklik 44 -> dokunma alani tabani.
  cell: {
    width: `${100 / 7}%`,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
});
